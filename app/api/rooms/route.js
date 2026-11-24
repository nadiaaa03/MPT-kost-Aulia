
import { connection } from "next/server";
import db from "@/lib/db";
import { wajibRoleAktif } from "@/lib/auth";

// ==========================================
// KONFIGURASI VALIDASI
// ==========================================

const STATUS_VALID = [
  "kosong",
  "dipesan",
  "terisi",
];

const TIPE_VALID = [
  "eksklusif",
  "standar",
];

// ==========================================
// GET /api/rooms
// PUBLIK - TIDAK MEMERLUKAN LOGIN
// ==========================================

export async function GET(request) {
  await connection();

  try {
    // ======================================
    // 1. AMBIL PARAMETER FILTER
    // ======================================

    const { searchParams } = new URL(
      request.url
    );

    const status = searchParams.get(
      "status"
    );

    const tipe = searchParams.get(
      "tipe"
    );

    const where = [];
    const params = [];

    // ======================================
    // 2. VALIDASI FILTER STATUS
    // ======================================

    if (status) {
      if (!STATUS_VALID.includes(status)) {
        return Response.json(
          {
            message:
              "Status harus kosong, dipesan, atau terisi.",
          },
          { status: 400 }
        );
      }

      where.push("status = ?");
      params.push(status);
    }

    // ======================================
    // 3. VALIDASI FILTER TIPE
    // ======================================

    if (tipe) {
      if (!TIPE_VALID.includes(tipe)) {
        return Response.json(
          {
            message:
              "Tipe harus eksklusif atau standar.",
          },
          { status: 400 }
        );
      }

      where.push("tipe = ?");
      params.push(tipe);
    }

    // ======================================
    // 4. QUERY DAFTAR KAMAR
    // ======================================

    const sql = `
      SELECT
        id,
        nomor_kamar,
        tipe,
        harga,
        status,
        deskripsi
      FROM v_kamar
      ${
        where.length
          ? "WHERE " + where.join(" AND ")
          : ""
      }
      ORDER BY
        CAST(nomor_kamar AS UNSIGNED),
        nomor_kamar
    `;

    const [rows] = await db.query(
      sql,
      params
    );

    // ======================================
    // 5. FORMAT HASIL UNTUK FRONTEND
    // ======================================

    const data = rows.map((row) => ({
      ...row,
      harga: Number(row.harga),
    }));

    // Tetap berupa array,
    // sesuai format API sebelumnya.
    return Response.json(data);

  } catch (error) {
    console.error(
      "GET ROOMS ERROR:",
      error
    );

    return Response.json(
      {
        message:
          "Terjadi kesalahan saat mengambil data kamar.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// POST /api/rooms
// KHUSUS PEMILIK DAN ADMIN
// ==========================================

export async function POST(request) {
  // ======================================
  // 1. VERIFIKASI HAK AKSES
  // ======================================

  const auth = await wajibRoleAktif(
    request,
    ["pemilik", "admin"]
  );

  if (auth.error) {
    return auth.error;
  }

  try {
    // ======================================
    // 2. AMBIL INPUT
    // ======================================

    const body = await request.json();

    const nomorKamar =
      body.nomor_kamar === undefined ||
      body.nomor_kamar === null
        ? ""
        : String(body.nomor_kamar).trim();

    const tipe = body.tipe;

    const harga = Number(body.harga);

    const deskripsi =
      typeof body.deskripsi === "string"
        ? body.deskripsi.trim()
        : "";

    // ======================================
    // 3. VALIDASI NOMOR KAMAR
    // ======================================

    if (!nomorKamar) {
      return Response.json(
        {
          message:
            "Nomor kamar wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (nomorKamar.length > 10) {
      return Response.json(
        {
          message:
            "Nomor kamar maksimal 10 karakter.",
        },
        { status: 400 }
      );
    }

    // ======================================
    // 4. VALIDASI TIPE KAMAR
    // ======================================

    if (!TIPE_VALID.includes(tipe)) {
      return Response.json(
        {
          message:
            "Tipe harus eksklusif atau standar.",
        },
        { status: 400 }
      );
    }

    // ======================================
    // 5. VALIDASI HARGA
    // ======================================

    if (
      body.harga === null ||
      body.harga === undefined ||
      String(body.harga).trim() === "" ||
      !Number.isSafeInteger(harga) ||
      harga <= 0
    ) {
      return Response.json(
        {
          message:
            "Harga harus berupa angka bulat lebih dari 0.",
        },
        { status: 400 }
      );
    }

    // ======================================
    // 6. VALIDASI DESKRIPSI
    // ======================================

    if (
      body.deskripsi !== undefined &&
      body.deskripsi !== null &&
      typeof body.deskripsi !== "string"
    ) {
      return Response.json(
        {
          message:
            "Deskripsi harus berupa teks.",
        },
        { status: 400 }
      );
    }

    // ======================================
    // 7. INSERT KAMAR BARU
    // ======================================

    const [result] = await db.execute(
      `
      INSERT INTO rooms (
        nomor_kamar,
        tipe,
        harga,
        deskripsi
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        nomorKamar,
        tipe,
        harga,
        deskripsi || null,
      ]
    );

    // ======================================
    // 8. RESPONSE BERHASIL
    // ======================================

    return Response.json(
      {
        message:
          "Kamar berhasil ditambahkan.",
        id: result.insertId,
      },
      { status: 201 }
    );

  } catch (error) {
    if (
      error.code === "ER_DUP_ENTRY" ||
      error.errno === 1062
    ) {
      return Response.json(
        {
          message:
            "Nomor kamar sudah ada.",
        },
        { status: 409 }
      );
    }

    console.error(
      "CREATE ROOM ERROR:",
      error
    );

    return Response.json(
      {
        message:
          "Terjadi kesalahan saat menambahkan kamar.",
      },
      { status: 500 }
    );
  }
}
