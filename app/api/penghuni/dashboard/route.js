import { connection } from "next/server";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { wajibRole } from "@/lib/auth";

export async function GET(request) {
  await connection();

  const { user, error } = wajibRole(request, ["penghuni"]);
  if (error) return error;

  try {
    // 1. Ambil profil user
    const [userRows] = await db.query(
      `SELECT id_user, nama, gmail, no_telp
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [user.id_user]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data penghuni tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Ambil data sewa kamar aktif
    const [sewaRows] = await db.query(
      `SELECT
        sk.id_sewa,
        sk.tanggal_masuk,
        sk.tanggal_keluar,
        sk.harga_sewa,
        sk.status_sewa,
        r.id AS id_kamar,
        r.nomor_kamar,
        r.tipe,
        r.harga AS harga_kamar
       FROM sewa_kamar sk
       JOIN rooms r ON sk.id_kamar = r.id
       WHERE sk.id_user = ?
       ORDER BY (sk.status_sewa = 'aktif') DESC, sk.created_at DESC
       LIMIT 1`,
      [user.id_user]
    );

    const sewa = sewaRows[0] || null;
    let tagihan = null;
    let pembayaranTerakhir = null;

    // 3. Jika memiliki data sewa, ambil tagihan terbaru & bukti pembayaran terakhir
    if (sewa) {
      const [tagihanRows] = await db.query(
        `SELECT
          id_tagihan,
          periode_ke,
          periode_mulai,
          periode_selesai,
          tanggal_jatuh_tempo,
          nominal,
          status_tagihan,
          tanggal_lunas
         FROM tagihan
         WHERE id_sewa = ?
         ORDER BY periode_ke DESC, id_tagihan DESC
         LIMIT 1`,
        [sewa.id_sewa]
      );

      tagihan = tagihanRows[0] || null;

      if (tagihan) {
        const [bayarRows] = await db.query(
          `SELECT
            id_pembayaran,
            nominal_dibayar,
            tanggal_transfer,
            bukti_pembayaran,
            status_verifikasi,
            catatan_pemilik,
            diverifikasi_pada,
            created_at
           FROM pembayaran
           WHERE id_tagihan = ?
           ORDER BY created_at DESC, id_pembayaran DESC
           LIMIT 1`,
          [tagihan.id_tagihan]
        );

        pembayaranTerakhir = bayarRows[0] || null;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profil: userRows[0],
        hunian: sewa,
        tagihan,
        pembayaran: pembayaranTerakhir,
      },
    });
  } catch (err) {
    console.error("GET PENGHUNI DASHBOARD ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}