
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import db from "@/lib/db";
import { wajibRoleAktif, tanggalWIB } from "@/lib/auth";


// =====================================
// GENERATE KODE UNDANGAN
// =====================================

function generateCode() {
  return (
    "AUL-" +
    randomBytes(8).toString("hex").toUpperCase()
  );
}

// =====================================
// VALIDASI TANGGAL YYYY-MM-DD
// =====================================

function tanggalValid(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [tahun, bulan, hari] =
    value.split("-").map(Number);

  const hasil = new Date(
    Date.UTC(tahun, bulan - 1, hari)
  );

  return (
    hasil.getUTCFullYear() === tahun &&
    hasil.getUTCMonth() + 1 === bulan &&
    hasil.getUTCDate() === hari
  );
}

// =====================================
// GET - DAFTAR KODE UNDANGAN OWNER
// =====================================

export async function GET(request) {
  const auth = await wajibRoleAktif(
    request,
    ["pemilik"]
  );

  if (auth.error) {
    return auth.error;
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT
        id_kode,
        kode_unik,
        nama_penghuni,
        nomor_kamar,
        tanggal_masuk,
        metode,
        status,
        digunakan_oleh,
        created_at,
        used_at
      FROM kode_undangan
      WHERE id_pemilik = ?
        AND status = 'aktif'
        AND digunakan_oleh IS NULL
        AND used_at IS NULL
      ORDER BY created_at DESC, id_kode DESC
      `,
      [auth.user.id_user]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error(
      "GET INVITATION CODE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil daftar kode undangan.",
      },
      { status: 500 }
    );
  }
}

// =====================================
// POST - BUAT KODE UNDANGAN
// =====================================

export async function POST(request) {
  const auth = await wajibRoleAktif(
    request,
    ["pemilik"]
  );

  if (auth.error) {
    return auth.error;
  }

  try {
    // =================================
    // 1. AMBIL INPUT
    // =================================

    const body = await request.json();

    const metode = body.metode;

    const namaPenghuni =
      typeof body.nama_penghuni === "string"
        ? body.nama_penghuni.trim()
        : "";

    const nomorKamar =
      body.nomor_kamar === null ||
      body.nomor_kamar === undefined
        ? ""
        : String(body.nomor_kamar).trim();

    const tanggalMasuk =
      typeof body.tanggal_masuk === "string"
        ? body.tanggal_masuk.trim()
        : "";

    let kodeUnik =
      typeof body.kode_unik === "string"
        ? body.kode_unik.trim().toUpperCase()
        : "";

    // =================================
    // 2. VALIDASI METODE
    // =================================

    if (
      metode !== "manual" &&
      metode !== "otomatis"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Metode pembuatan kode tidak valid.",
        },
        { status: 400 }
      );
    }

    // =================================
    // 3. VALIDASI NAMA
    // =================================

    if (
      !namaPenghuni ||
      namaPenghuni.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama penghuni wajib diisi dan maksimal 100 karakter.",
        },
        { status: 400 }
      );
    }

    // =================================
    // 4. VALIDASI NOMOR KAMAR
    // =================================

    if (
      !/^[0-9]{1,10}$/.test(nomorKamar)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor kamar tidak valid.",
        },
        { status: 400 }
      );
    }

    // =================================
    // 5. VALIDASI TANGGAL MASUK
    // =================================

    if (!tanggalValid(tanggalMasuk)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal masuk tidak valid.",
        },
        { status: 400 }
      );
    }

    if (tanggalMasuk < tanggalWIB()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal masuk tidak boleh di masa lalu.",
        },
        { status: 400 }
      );
    }

    // =================================
    // 6. VALIDASI KODE
    // =================================

    if (metode === "otomatis") {
      kodeUnik = generateCode();
    }

    if (
      !/^[A-Z0-9-]{4,20}$/.test(kodeUnik)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kode harus 4–20 karakter, menggunakan huruf, angka, atau tanda hubung.",
        },
        { status: 400 }
      );
    }

    // =================================
    // 7. CARI KAMAR DI DATABASE
    // =================================

    const [rooms] = await db.execute(
      `
      SELECT
        id,
        nomor_kamar,
        tipe,
        harga
      FROM rooms
      WHERE nomor_kamar = ?
      LIMIT 1
      `,
      [nomorKamar]
    );

    if (rooms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kamar tidak ditemukan dalam database.",
        },
        { status: 404 }
      );
    }

    const kamar = rooms[0];

    // =================================
    // 8. PERIKSA PENYEWAAN AKTIF
    // =================================

    const [sewaAktif] = await db.execute(
      `
      SELECT id_sewa
      FROM sewa_kamar
      WHERE id_kamar = ?
        AND status_sewa = 'aktif'
        AND (
          tanggal_keluar IS NULL
          OR tanggal_keluar >= ?
        )
      LIMIT 1
      `,
      [
        kamar.id,
        tanggalMasuk,
      ]
    );

    if (sewaAktif.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kamar masih memiliki penyewaan aktif. Pilih kamar lain atau selesaikan masa sewa sebelumnya.",
        },
        { status: 409 }
      );
    }

    // =================================
    // 9. PERIKSA KODE AKTIF KAMAR
    // =================================

    const [kodeAktif] = await db.execute(
      `
      SELECT id_kode
      FROM kode_undangan
      WHERE nomor_kamar = ?
        AND status = 'aktif'
        AND digunakan_oleh IS NULL
        AND used_at IS NULL
      LIMIT 1
      `,
      [kamar.nomor_kamar]
    );

    if (kodeAktif.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kamar ini sudah memiliki kode undangan aktif. Gunakan kode tersebut atau nonaktifkan terlebih dahulu.",
        },
        { status: 409 }
      );
    }

    // =================================
    // 10. SIMPAN KODE UNDANGAN
    // =================================

    const [result] = await db.execute(
      `
      INSERT INTO kode_undangan (
        kode_unik,
        id_pemilik,
        nama_penghuni,
        nomor_kamar,
        tanggal_masuk,
        metode,
        status
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, 'aktif'
      )
      `,
      [
        kodeUnik,
        auth.user.id_user,
        namaPenghuni,
        kamar.nomor_kamar,
        tanggalMasuk,
        metode,
      ]
    );

    // =================================
    // 11. RESPONSE BERHASIL
    // =================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Kode undangan berhasil dibuat.",
        data: {
          id_kode: result.insertId,
          kode_unik: kodeUnik,
          nama_penghuni: namaPenghuni,
          nomor_kamar: kamar.nomor_kamar,
          tanggal_masuk: tanggalMasuk,
          metode,
          status: "aktif",
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(
      "CREATE INVITATION CODE ERROR:",
      error
    );

    if (
      error.code === "ER_DUP_ENTRY" ||
      error.errno === 1062
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kode undangan sudah ada. Silakan gunakan kode lain.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal membuat kode undangan.",
      },
      { status: 500 }
    );
  }
}
