
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import db from "@/lib/db";

// Memeriksa identitas dan role pemilik
function verifyOwner(request) {
  const token = request.cookies.get("token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user.role !== "pemilik" || !user.id_user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

// GET: Melihat daftar kode milik pemilik yang login
export async function GET(request) {
  try {
    const owner = verifyOwner(request);

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan login sebagai pemilik." },
        { status: 401 }
      );
    }

    const [rows] = await db.execute(
      `SELECT id_kode, kode_unik, metode, status,
              digunakan_oleh, created_at, used_at
       FROM kode_undangan
       WHERE id_pemilik = ?
       ORDER BY created_at DESC`,
      [owner.id_user]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("GET INVITATION CODE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar kode." },
      { status: 500 }
    );
  }
}

// POST: Membuat kode manual atau otomatis
export async function POST(request) {
  try {
    const owner = verifyOwner(request);

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan login sebagai pemilik." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { metode } = body;

    if (!["manual", "otomatis"].includes(metode)) {
      return NextResponse.json(
        { success: false, message: "Metode pembuatan kode tidak valid." },
        { status: 400 }
      );
    }

    let kodeUnik;

    if (metode === "manual") {
      kodeUnik = String(body.kode_unik || "").trim().toUpperCase();

      if (!/^[A-Z0-9-]{4,20}$/.test(kodeUnik)) {
        return NextResponse.json(
          {
            success: false,
            message: "Kode harus 4–20 karakter dan hanya menggunakan huruf, angka, atau tanda hubung."
          },
          { status: 400 }
        );
      }
    } else {
      kodeUnik = "AUL-" + randomBytes(5).toString("hex").toUpperCase();
    }

    const [result] = await db.execute(
      `INSERT INTO kode_undangan
       (kode_unik, id_pemilik, metode, status)
       VALUES (?, ?, ?, 'nonaktif')`,
      [kodeUnik, owner.id_user, metode]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Kode undangan berhasil dibuat. Aktifkan sebelum digunakan.",
        data: {
          id_kode: result.insertId,
          kode_unik: kodeUnik,
          metode,
          status: "nonaktif",
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("CREATE INVITATION CODE ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Kode sudah digunakan. Silakan buat kode lain." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal membuat kode undangan." },
      { status: 500 }
    );
  }
}
