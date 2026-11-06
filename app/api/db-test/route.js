
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 AS connection_test");

    return NextResponse.json({
      success: true,
      message: "Koneksi ke database TiDB berhasil!",
      data: rows[0],
    });
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Koneksi ke database gagal.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
