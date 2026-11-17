
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

// Verifikasi pemilik
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

// PATCH: Mengubah status kode undangan
// PATCH /api/owner/invitation-codes/1
export async function PATCH(request, { params }) {
  try {
    // 1. Verifikasi login pemilik
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

    // 2. Ambil ID kode undangan
    const { id } = await params;

    if (!/^[0-9]+$/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kode tidak valid.",
        },
        { status: 400 }
      );
    }

    // 3. Ambil status baru
    const body = await request.json();
    const { status } = body;

    if (!["aktif", "nonaktif"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status harus aktif atau nonaktif.",
        },
        { status: 400 }
      );
    }

    // 4. Pastikan kode merupakan milik pemilik yang login
    const [rows] = await db.execute(
      `SELECT id_kode
       FROM kode_undangan
       WHERE id_kode = ? AND id_pemilik = ?
       LIMIT 1`,
      [id, owner.id_user]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode undangan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // 5. Perbarui status kode undangan
    await db.execute(
      `UPDATE kode_undangan
       SET status = ?
       WHERE id_kode = ? AND id_pemilik = ?`,
      [status, id, owner.id_user]
    );

    // 6. Berikan respons berhasil
    return NextResponse.json({
      success: true,
      message: "Status kode undangan berhasil diperbarui.",
      data: {
        id_kode: Number(id),
        status: status,
      },
    });

  } catch (error) {
    console.error("UPDATE INVITATION CODE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui status kode undangan.",
      },
      { status: 500 }
    );
  }
}
