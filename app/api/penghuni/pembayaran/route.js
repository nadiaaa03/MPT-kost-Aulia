import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import db from "@/lib/db";
import { wajibRole } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
  const { user, error } = wajibRole(request, ["penghuni"]);
  if (error) return error;

  const conn = await db.getConnection();

  try {
    const formData = await request.formData();
    const file = formData.get("bukti");
    const idTagihanRaw = formData.get("id_tagihan");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "File bukti pembayaran wajib diunggah." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Format file harus JPG, PNG, WEBP, atau PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran file maksimal 5 MB." },
        { status: 400 }
      );
    }

    const idTagihan = Number(idTagihanRaw);
    if (!Number.isInteger(idTagihan) || idTagihan <= 0) {
      return NextResponse.json(
        { success: false, message: "ID tagihan tidak valid." },
        { status: 400 }
      );
    }

    // Validasi kepemilikan tagihan oleh penghuni yang sedang login
    const [tagihanRows] = await conn.query(
      `SELECT t.id_tagihan, t.nominal, t.status_tagihan
       FROM tagihan t
       JOIN sewa_kamar sk ON t.id_sewa = sk.id_sewa
       WHERE t.id_tagihan = ? AND sk.id_user = ?
       LIMIT 1`,
      [idTagihan, user.id_user]
    );

    if (tagihanRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tagihan tidak ditemukan atau bukan milik Anda." },
        { status: 404 }
      );
    }

    const tagihan = tagihanRows[0];

    if (tagihan.status_tagihan === "lunas") {
      return NextResponse.json(
        { success: false, message: "Tagihan ini sudah berstatus lunas." },
        { status: 400 }
      );
    }

    // Simpan file ke public/uploads/bukti
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const safeFileName = `bukti_${idTagihan}_${Date.now()}_${randomBytes(4).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "bukti");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeFileName), buffer);

    const fileUrl = `/uploads/bukti/${safeFileName}`;

    await conn.beginTransaction();

    // Simpan riwayat pembayaran
    await conn.query(
      `INSERT INTO pembayaran
       (id_tagihan, nominal_dibayar, tanggal_transfer, bukti_pembayaran, status_verifikasi)
       VALUES (?, ?, NOW(), ?, 'menunggu')`,
      [idTagihan, tagihan.nominal, fileUrl]
    );

    // Update status tagihan menjadi menunggu_verifikasi
    await conn.query(
      `UPDATE tagihan
       SET status_tagihan = 'menunggu_verifikasi'
       WHERE id_tagihan = ?`,
      [idTagihan]
    );

    await conn.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Bukti pembayaran berhasil diunggah. Menunggu verifikasi pemilik.",
        data: {
          bukti_pembayaran: fileUrl,
          status_tagihan: "menunggu_verifikasi",
          status_verifikasi: "menunggu",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    await conn.rollback();
    console.error("UPLOAD PEMBAYARAN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengunggah bukti pembayaran." },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}