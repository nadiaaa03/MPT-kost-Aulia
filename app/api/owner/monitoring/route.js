
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
  const auth = await wajibRoleAktif(
    request,
    ["pemilik"]
  );

  if (auth.error) {
    return auth.error;
  }

  try {
    const hariIni = tanggalWIB();

    // ======================================
    // 1. RINGKASAN JUMLAH KAMAR
    // ======================================

    const [ringkasanRows] = await db.execute(
      `
      SELECT
        total_kamar,
        kamar_tersedia,
        kamar_dipesan,
        kamar_terisi,
        keterangan
      FROM v_ringkasan_kamar
      `
    );

    // ======================================
    // 2. PROFIL PENGHUNI PER KAMAR
    // ======================================
    // Kamar tanpa sewa tetap ditampilkan.
    // Identitas penghuni hanya dikirim
    // melalui API khusus pemilik.

    const [kamarRows] = await db.execute(
      `
      SELECT
        r.id AS id_kamar,
        r.nomor_kamar,
        r.tipe,
        r.harga,
        v.status,

        s.id_sewa,
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

      FROM rooms r

      JOIN v_kamar v
        ON v.id = r.id

      LEFT JOIN sewa_kamar s
        ON s.id_sewa = (
          SELECT s2.id_sewa
          FROM sewa_kamar s2
          WHERE s2.id_kamar = r.id
            AND s2.status_sewa = 'aktif'
            AND (
              s2.tanggal_keluar IS NULL
              OR s2.tanggal_keluar >= ?
            )
          ORDER BY
            s2.tanggal_masuk ASC,
            s2.id_sewa ASC
          LIMIT 1
        )

      LEFT JOIN users u
        ON u.id_user = s.id_user

      ORDER BY
        CAST(r.nomor_kamar AS UNSIGNED),
        r.nomor_kamar
      `,
      [hariIni]
    );

    // ======================================
    // 3. TAGIHAN YANG BELUM LUNAS
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

      JOIN sewa_kamar s
        ON s.id_sewa = t.id_sewa

      JOIN rooms r
        ON r.id = s.id_kamar

      JOIN users u
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
    // 4. KONVERSI DATA NUMERIK
    // ======================================

    const ringkasan =
      ringkasanRows[0] ?? {};

    const kamar = kamarRows.map(
      (item) => ({
        ...item,
        harga: Number(item.harga),
      })
    );

    const tagihan = tagihanRows.map(
      (item) => ({
        ...item,
        nominal: Number(item.nominal),
      })
    );

    // ======================================
    // 5. HITUNG RINGKASAN TAGIHAN
    // ======================================

    const belumBayar = tagihan.filter(
      (item) =>
        item.status_tagihan ===
        "belum_bayar"
    );

    const menungguVerifikasi =
      tagihan.filter(
        (item) =>
          item.status_tagihan ===
          "menunggu_verifikasi"
      );

    // ======================================
    // 6. RESPONSE UNTUK DASHBOARD
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
        kamar_dipesan: Number(
          ringkasan.kamar_dipesan ?? 0
        ),
        kamar_terisi: Number(
          ringkasan.kamar_terisi ?? 0
        ),
      },

      kamar,

      tagihan,

      ringkasan_tagihan: {
        jumlah_belum_bayar:
          belumBayar.length,

        jumlah_menunggu_verifikasi:
          menungguVerifikasi.length,

        total_belum_bayar:
          belumBayar.reduce(
            (total, item) =>
              total + item.nominal,
            0
          ),
      },
    });

  } catch (error) {
    console.error(
      "OWNER MONITORING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil data monitoring pemilik.",
      },
      { status: 500 }
    );
  }
}
