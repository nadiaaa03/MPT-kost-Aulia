
import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/rooms/1
// Mengambil detail kamar berdasarkan ID

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const roomId = Number(id);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kamar tidak valid."
        },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      `SELECT
        id,
        nomor_kamar,
        tipe,
        harga,
        status,
        deskripsi,
        created_at,
        updated_at
       FROM rooms
       WHERE id = ?
       LIMIT 1`,
      [roomId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data kamar tidak ditemukan."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error("GET ROOM ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kamar."
      },
      { status: 500 }
    );
  }
}
