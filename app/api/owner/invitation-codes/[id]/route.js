
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    let user;

    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak valid." },
        { status: 401 }
      );
    }

    if (user.role !== "pemilik" || !user.id_user) {
      return NextResponse.json(
        { success: false, message: "Hanya pemilik yang dapat mengelola kode." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idKode = Number(id);

    if (!Number.isSafeInteger(idKode) || idKode <= 0) {
      return NextResponse.json(
        { success: false, message: "ID kode tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["aktif", "nonaktif"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status tidak valid." },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `UPDATE kode_undangan
       SET status = ?
       WHERE id_kode = ?
       AND id_pemilik = ?
       AND status IN ('aktif', 'nonaktif')`,
      [status, idKode, user.id_user]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode tidak ditemukan, bukan milik Anda, atau sudah digunakan."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Kode berhasil diubah menjadi ${status}.`,
    });

  } catch (error) {
    console.error("UPDATE INVITATION CODE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status kode." },
      { status: 500 }
    );
  }
}
