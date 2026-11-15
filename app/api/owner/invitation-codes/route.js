
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import db from "@/lib/db";

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

function generateCode() {
  return "AUL-" + randomBytes(5).toString("hex").toUpperCase();
}

// GET: Mengambil daftar kode milik pemilik yang sedang login
export async function GET(request) {
  try {
    const owner = verifyOwner(request);

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Silakan login sebagai pemilik.",
        },
        { status: 401 }
      );
    }

    const [rows] = await db.execute(
      `SELECT
        id_kode,
        kode_unik,
        nama_penghuni,
        nomor_kamar,
        tanggal_masuk,
        metode,
        status,
        digunakan_oleh,
        created_at,
        used_at
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
      {
        success: false,
        message: "Gagal mengambil daftar kode.",
      },
      { status: 500 }
    );
  }
}

// POST: Membuat kode undangan baru
export async function POST(request) {
  try {
    const owner = verifyOwner(request);

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Silakan login sebagai pemilik.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      metode,
      kode_unik,
      nama_penghuni,
      nomor_kamar,
      tanggal_masuk,
    } = body;

    // Validasi metode pembuatan
    if (!["manual", "otomatis"].includes(metode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Metode pembuatan kode tidak valid.",
        },
        { status: 400 }
      );
    }

    // Validasi data penghuni
    if (
      !nama_penghuni?.trim() ||
      nomor_kamar === undefined ||
      nomor_kamar === null ||
      String(nomor_kamar).trim() === "" ||
      !tanggal_masuk
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama penghuni, nomor kamar, dan tanggal masuk wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Validasi nomor kamar 1 sampai 15
    const roomNumber = Number(nomor_kamar);

    if (
      !Number.isInteger(roomNumber) ||
      roomNumber < 1 ||
      roomNumber > 15
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor kamar harus berupa angka dari 1 sampai 15.",
        },
        { status: 400 }
      );
    }

    // Validasi tanggal masuk
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(tanggal_masuk)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal masuk tidak valid.",
        },
        { status: 400 }
      );
    }

    const parsedDate = new Date(`${tanggal_masuk}T00:00:00`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== tanggal_masuk
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal masuk tidak valid.",
        },
        { status: 400 }
      );
    }

    // Menentukan kode undangan
    let kodeUnik = String(kode_unik || "")
      .trim()
      .toUpperCase();

    if (metode === "otomatis" && !kodeUnik) {
      kodeUnik = generateCode();
    }

    if (!/^[A-Z0-9-]{4,20}$/.test(kodeUnik)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kode harus 4–20 karakter dan hanya menggunakan huruf, angka, atau tanda hubung.",
        },
        { status: 400 }
      );
    }

    // Menyimpan kode dan data penghuni
    const [result] = await db.execute(
      `INSERT INTO kode_undangan
       (
         kode_unik,
         id_pemilik,
         nama_penghuni,
         nomor_kamar,
         tanggal_masuk,
         metode,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, 'aktif')`,
      [
        kodeUnik,
        owner.id_user,
        nama_penghuni.trim(),
        roomNumber,
        tanggal_masuk,
        metode,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Kode undangan berhasil dibuat.",
        data: {
          id_kode: result.insertId,
          kode_unik: kodeUnik,
          nama_penghuni: nama_penghuni.trim(),
          nomor_kamar: roomNumber,
          tanggal_masuk,
          metode,
          status: "aktif",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE INVITATION CODE ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "Kode sudah digunakan. Silakan generate kode lain.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat kode undangan.",
      },
      { status: 500 }
    );
  }
}
