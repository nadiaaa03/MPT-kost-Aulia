
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// =====================================
// TANGGAL HARI INI BERDASARKAN WIB
// =====================================

function tanggalHariIniWIB() {
  const bagian = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(new Date());

  const ambil = (jenis) =>
    bagian.find((item) => item.type === jenis)?.value;

  return [
    ambil("year"),
    ambil("month"),
    ambil("day"),
  ].join("-");
}

// =====================================
// API LOGIN
// =====================================

export async function POST(request) {
  try {
    // =====================================
    // 1. AMBIL DATA LOGIN
    // =====================================

    const body = await request.json();

    const gmail =
      typeof body.gmail === "string"
        ? body.gmail.trim().toLowerCase()
        : "";

    const password = body.password;

    // =====================================
    // 2. VALIDASI INPUT
    // =====================================

    if (
      !gmail ||
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gmail dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 3. CARI AKUN
    // =====================================

    const [rows] = await db.execute(
      `
      SELECT
        id_user,
        nama,
        gmail,
        password_hash,
        role,
        is_active
      FROM users
      WHERE gmail = ?
      LIMIT 1
      `,
      [gmail]
    );

    const user = rows[0];

    // =====================================
    // 4. VALIDASI PASSWORD
    // =====================================

    const cocok = user
      ? await bcrypt.compare(
          password,
          user.password_hash
        )
      : false;

    if (!cocok) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gmail atau password salah.",
        },
        { status: 401 }
      );
    }

    // =====================================
    // 5. VALIDASI STATUS AKUN PENGHUNI
    // =====================================

    if (
      user.role === "penghuni" &&
      Number(user.is_active) !== 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Akun penghuni tidak aktif. Hubungi pemilik Kost Aulia.",
        },
        { status: 403 }
      );
    }

    // =====================================
    // 6. CEK SEWA AKTIF UNTUK PENGHUNI
    // =====================================

    if (user.role === "penghuni") {
      const hariIni = tanggalHariIniWIB();

      const [sewaAktif] = await db.execute(
        `
        SELECT
          s.id_sewa,
          s.id_kamar,
          s.tanggal_masuk
        FROM sewa_kamar s
        WHERE s.id_user = ?
          AND s.status_sewa = 'aktif'
          AND s.tanggal_masuk <= ?
          AND (
            s.tanggal_keluar IS NULL
            OR s.tanggal_keluar >= ?
          )
        LIMIT 1
        `,
        [
          user.id_user,
          hariIni,
          hariIni,
        ]
      );

      if (sewaAktif.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Akun berhasil diverifikasi, tetapi masa sewa kamu belum aktif atau sudah berakhir. Hubungi pemilik kost.",
          },
          { status: 403 }
        );
      }
    }

    // =====================================
    // 7. VALIDASI ROLE
    // =====================================

    const roleDiizinkan = [
      "penghuni",
      "pemilik",
      "admin",
    ];

    if (!roleDiizinkan.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Role akun tidak dikenali.",
        },
        { status: 403 }
      );
    }

    // =====================================
    // 8. PERIKSA JWT SECRET
    // =====================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "LOGIN ERROR: JWT_SECRET belum tersedia."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Konfigurasi server belum lengkap.",
        },
        { status: 500 }
      );
    }

    // =====================================
    // 9. BUAT TOKEN LOGIN
    // =====================================

    const token = jwt.sign(
      {
        id_user: user.id_user,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // =====================================
    // 10. RESPONSE BERHASIL
    // =====================================

    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil.",
        user: {
          id_user: user.id_user,
          nama: user.nama,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // =====================================
    // 11. SIMPAN COOKIE LOGIN
    // =====================================

    response.cookies.set("token", token, {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", {
      code: error.code,
      message: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
