
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { gmail, password } = await request.json();

    if (!gmail || !password) {
      return NextResponse.json(
        { message: "Gmail dan password wajib diisi" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT id_user, nama, gmail, password_hash, role, is_active
       FROM users
       WHERE gmail = ?
       LIMIT 1`,
      [gmail.trim().toLowerCase()]
    );

    const user = rows[0];

    const cocok = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!cocok) {
      return NextResponse.json(
        { message: "Gmail atau password salah" },
        { status: 401 }
      );
    }

    if (user.role === "penghuni" && Number(user.is_active) !== 1) {
      return NextResponse.json(
        { message: "Akun tidak aktif, hubungi pemilik kost" },
        { status: 403 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Konfigurasi server belum lengkap" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id_user: user.id_user,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id_user: user.id_user,
        nama: user.nama,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
