
import { NextResponse } from "next/server";

// API registrasi penghuni
export async function POST(request) {
  try {
    const body = await request.json();

    const { nama, gmail, no_telp, password } = body;

    // 1. Validasi kolom wajib
    if (
      !nama?.trim() ||
      !gmail?.trim() ||
      !no_telp?.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Semua kolom wajib diisi.",
        },
        { status: 400 }
      );
    }

    // 2. Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(gmail.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Format email tidak valid.",
        },
        { status: 400 }
      );
    }

    // 3. Validasi panjang password
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 8 karakter.",
        },
        { status: 400 }
      );
    }

    // 4. Validasi huruf besar
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password harus memiliki huruf besar.",
        },
        { status: 400 }
      );
    }

    // 5. Validasi huruf kecil
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password harus memiliki huruf kecil.",
        },
        { status: 400 }
      );
    }

    // 6. Validasi angka
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password harus memiliki angka.",
        },
        { status: 400 }
      );
    }

    // 7. Validasi simbol
    if (!/[^A-Za-z0-9\s]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password harus memiliki simbol.",
        },
        { status: 400 }
      );
    }

    // 8. Validasi nomor telepon
    if (!/^\d{10,15}$/.test(no_telp.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor telepon harus terdiri dari 10–15 angka.",
        },
        { status: 400 }
      );
    }

    // 9. Validasi registrasi berhasil.
    // Penyimpanan akun ke TiDB menunggu integrasi database.

    return NextResponse.json(
      {
        success: true,
        message: "Validasi registrasi berhasil.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("SIGN UP API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
