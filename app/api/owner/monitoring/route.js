
import { NextResponse } from "next/server";
import db from "@/lib/db";
import {
  wajibRoleAktif,
  tanggalWIB,
} from "@/lib/auth";

// ==========================================
// GET /api/owner/monitoring
// KHUSUS PEMILIK KOST
// ==========================================

export async function GET(request) {
  try {
    // ======================================
    // 1. VALIDASI AKSES PEMILIK
    // ======================================

    const auth = await wajibRoleAktif(
      request,
      ["pemilik"]
    );

    if (auth.error) {
      return auth.error;
    }

    const hariIni = tanggalWIB();

    // ======================================
    // 2. RINGKASAN KAMAR
    // ======================================

    const [ringkasanRows] = await db.execute(
      `
      SELECT
        total_kamar,
        kamar_tersedia,
        kamar_terisi,
        keterangan
      FROM v_ringkasan_kamar
      `
    );

    const ringkasan = ringkasanRows[0] || {};

    // ======================================
    // 3. AMBIL SELURUH DATA KAMAR
    // ======================================

    const [kamarRows] = await db.execute(
      `
      SELECT
        id,
        nomor_kamar,
        tipe,
        harga,
        status,
        deskripsi
      FROM v_kamar
      ORDER BY
        CAST(nomor_kamar AS UNSIGNED),
        nomor_kamar
      `
    );

    // ======================================
    // 4. AMBIL DATA SEWA AKTIF
    // ======================================

    const [penghuniRows] = await db.execute(
      `
      SELECT
        s.id_sewa,
        s.id_kamar,
        s.id_user,

        DATE_FORMAT(
          s.tanggal_masuk,
          '%Y-%m-%d'
        ) AS tanggal_masuk,

        DATE_FORMAT(
          s.tanggal_keluar,
          '%Y-%m-%d'
        ) AS tanggal_keluar,

        u.nama AS nama_penghuni,
        u.gmail,
        u.no_telp

      FROM sewa_kamar s

      INNER JOIN users u
        ON u.id_user = s.id_user

      WHERE s.status_sewa = 'aktif'
        AND s.tanggal_masuk <= ?
        AND (
          s.tanggal_keluar IS NULL
          OR s.tanggal_keluar >= ?
        )

      ORDER BY
        s.tanggal_masuk ASC,
        s.id_sewa ASC
      `,
      [hariIni, hariIni]
    );

    // ======================================
    // 5. HUBUNGKAN PENGHUNI DENGAN KAMAR
    // ======================================

    const penghuniPerKamar = new Map();

    for (const penghuni of penghuniRows) {
      const idKamar = String(penghuni.id_kamar);

      // Satu kamar hanya menampilkan satu
      // penghuni aktif pada dashboard.
      if (!penghuniPerKamar.has(idKamar)) {
        penghuniPerKamar.set(idKamar, penghuni);
      }
    }

    // ======================================
    // 6. GABUNGKAN DATA KAMAR DAN PENGHUNI
    // ======================================

    const kamar = kamarRows.map((item) => {
      const penghuni = penghuniPerKamar.get(
        String(item.id)
      );

      return {
        id_kamar: item.id,
        nomor_kamar: item.nomor_kamar,
        tipe: item.tipe,
        harga: Number(item.harga),
        status: item.status,
        deskripsi: item.deskripsi,

        id_sewa: penghuni?.id_sewa ?? null,
        id_user: penghuni?.id_user ?? null,

        tanggal_masuk:
          penghuni?.tanggal_masuk ?? null,

        tanggal_keluar:
          penghuni?.tanggal_keluar ?? null,

        nama_penghuni:
          penghuni?.nama_penghuni ?? null,

        gmail: penghuni?.gmail ?? null,
        no_telp: penghuni?.no_telp ?? null,
      };
    });

    // ======================================
    // 7. AMBIL TAGIHAN BELUM LUNAS
    // ======================================

    const [tagihanRows] = await db.execute(
      `
      SELECT
        t.id_tagihan,
        t.id_sewa,
        t.periode_ke,

        DATE_FORMAT(
          t.periode_mulai,
          '%Y-%m-%d'
        ) AS periode_mulai,

        DATE_FORMAT(
          t.periode_selesai,
          '%Y-%m-%d'
        ) AS periode_selesai,

        DATE_FORMAT(
          t.tanggal_jatuh_tempo,
          '%Y-%m-%d'
        ) AS tanggal_jatuh_tempo,

        t.nominal,
        t.status_tagihan,

        r.nomor_kamar,
        r.tipe,

        u.id_user,
        u.nama AS nama_penghuni,
        u.no_telp,
        u.gmail

      FROM tagihan t

      INNER JOIN sewa_kamar s
        ON s.id_sewa = t.id_sewa

      INNER JOIN rooms r
        ON r.id = s.id_kamar

      INNER JOIN users u
        ON u.id_user = s.id_user

      WHERE t.status_tagihan IN (
        'belum_bayar',
        'menunggu_verifikasi'
      )

      ORDER BY
        t.tanggal_jatuh_tempo ASC,
        r.nomor_kamar ASC
      `
    );

    // ======================================
    // 8. KONVERSI DATA TAGIHAN
    // ======================================

    const tagihan = tagihanRows.map((item) => ({
      ...item,
      nominal: Number(item.nominal),
    }));

    // ======================================
    // 9. RINGKASAN STATUS TAGIHAN
    // ======================================

    const belumBayar = tagihan.filter(
      (item) =>
        item.status_tagihan === "belum_bayar"
    );

    const menungguVerifikasi = tagihan.filter(
      (item) =>
        item.status_tagihan === "menunggu_verifikasi"
    );

    const totalBelumBayar = belumBayar.reduce(
      (total, item) => total + item.nominal,
      0
    );

    // ======================================
    // 10. RESPONSE DASHBOARD OWNER
    // ======================================

    return NextResponse.json({
      success: true,

      tanggal_hari_ini: hariIni,

      monitoring: {
        total_kamar: Number(
          ringkasan.total_kamar ?? 0
        ),

        kamar_tersedia: Number(
          ringkasan.kamar_tersedia ?? 0
        ),

        kamar_terisi: Number(
          ringkasan.kamar_terisi ?? 0
        ),
      },

      kamar,

      tagihan,

      ringkasan_tagihan: {
        jumlah_belum_bayar: belumBayar.length,

        jumlah_menunggu_verifikasi:
          menungguVerifikasi.length,

        total_belum_bayar: totalBelumBayar,
      },
    });

  } catch (error) {

    // ======================================
    // 11. PENANGANAN ERROR
    // ======================================

    console.error("OWNER MONITORING ERROR:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil data monitoring pemilik.",
        error:
          error.sqlMessage || error.message,
        code: error.code || null,
      },
      { status: 500 }
    );
  }
}
