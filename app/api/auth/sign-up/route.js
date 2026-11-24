
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import db from "@/lib/db";

// ==========================================
// VALIDASI TANGGAL YYYY-MM-DD
// ==========================================

function tanggalValid(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [tahun, bulan, hari] = value
    .split("-")
    .map(Number);

  const tanggal = new Date(
    Date.UTC(tahun, bulan - 1, hari)
  );

  return (
    tanggal.getUTCFullYear() === tahun &&
    tanggal.getUTCMonth() + 1 === bulan &&
    tanggal.getUTCDate() === hari
  );
}

// ==========================================
// HELPER RESPONSE ERROR
// ==========================================

function gagal(message, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

// ==========================================
// POST - REGISTRASI PENGHUNI
// ==========================================

export async function POST(request) {
  let connection;
  let transactionStarted = false;

  try {
    // ======================================
    // 1. AMBIL DATA REGISTRASI
    // ======================================

    const body = await request.json();

    const nama =
      typeof body.nama === "string"
        ? body.nama.trim()
        : "";

    const gmail =
      typeof body.gmail === "string"
        ? body.gmail.trim().toLowerCase()
        : "";

    const noTelp =
      typeof body.no_telp === "string"
        ? body.no_telp.trim()
        : "";

    const password = body.password;

    const kodeUnik =
      typeof body.kode_unik === "string"
        ? body.kode_unik.trim().toUpperCase()
        : "";

    // ======================================
    // 2. VALIDASI DATA WAJIB
    // ======================================

    if (
      !nama ||
      !gmail ||
      !noTelp ||
      !password ||
      !kodeUnik
    ) {
      return gagal(
        "Semua kolom wajib diisi, termasuk kode undangan."
      );
    }

    // ======================================
    // 3. VALIDASI NAMA
    // ======================================

    if (nama.length > 100) {
      return gagal(
        "Nama maksimal 100 karakter."
      );
    }

    // ======================================
    // 4. VALIDASI GMAIL
    // ======================================

    if (
      gmail.length > 100 ||
      !/^[^\s@]+@gmail\.com$/i.test(gmail)
    ) {
      return gagal(
        "Gunakan alamat Gmail yang valid."
      );
    }

    // ======================================
    // 5. VALIDASI NOMOR TELEPON
    // ======================================

    if (!/^\+?[0-9]{10,15}$/.test(noTelp)) {
      return gagal(
        "Nomor telepon harus berisi 10–15 digit, dengan tanda + opsional di awal."
      );
    }

    // ======================================
    // 6. VALIDASI PASSWORD
    // ======================================

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9\s]/.test(password)
    ) {
      return gagal(
        "Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol, serta maksimal 72 byte."
      );
    }

    // ======================================
    // 7. VALIDASI FORMAT KODE UNDANGAN
    // ======================================

    if (
      !/^[A-Z0-9-]{4,20}$/.test(kodeUnik)
    ) {
      return gagal(
        "Format kode undangan tidak valid."
      );
    }

    // ======================================
    // 8. HASH PASSWORD
    // ======================================

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // ======================================
    // 9. MULAI TRANSAKSI DATABASE
    // ======================================

    connection = await db.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // ======================================
    // 10. AMBIL DAN KUNCI KODE UNDANGAN
    // ======================================

    const [codes] = await connection.execute(
      `
      SELECT
        id_kode,
        kode_unik,
        id_pemilik,
        nama_penghuni,
        nomor_kamar,
        DATE_FORMAT(
          tanggal_masuk, '%Y-%m-%d'
        ) AS tanggal_masuk
      FROM kode_undangan
      WHERE kode_unik = ?
        AND status = 'aktif'
        AND digunakan_oleh IS NULL
        AND used_at IS NULL
      FOR UPDATE
      `,
      [kodeUnik]
    );

    if (codes.length !== 1) {
      await connection.rollback();
      transactionStarted = false;

      return gagal(
        "Kode undangan tidak valid, sudah digunakan, atau tidak aktif."
      );
    }

    const kode = codes[0];

    // ======================================
    // 11. VALIDASI PEMILIK KODE
    // ======================================

    const [pemilik] = await connection.execute(
      `
      SELECT id_user
      FROM users
      WHERE id_user = ?
        AND role = 'pemilik'
      LIMIT 1
      `,
      [kode.id_pemilik]
    );

    if (pemilik.length !== 1) {
      throw new Error(
        "Pemilik kode undangan tidak valid."
      );
    }

    // ======================================
    // 12. VALIDASI TANGGAL MASUK
    // ======================================

    if (!tanggalValid(kode.tanggal_masuk)) {
      await connection.rollback();
      transactionStarted = false;

      return gagal(
        "Tanggal masuk pada kode undangan tidak valid."
      );
    }

    // ======================================
    // 13. VALIDASI EMAIL DAN TELEPON
    // ======================================

    const [akunAda] = await connection.execute(
      `
      SELECT id_user
      FROM users
      WHERE gmail = ?
         OR no_telp = ?
      LIMIT 1
      `,
      [gmail, noTelp]
    );

    if (akunAda.length > 0) {
      await connection.rollback();
      transactionStarted = false;

      return gagal(
        "Gmail atau nomor telepon sudah terdaftar.",
        409
      );
    }

    // ======================================
    // 14. AMBIL DAN KUNCI DATA KAMAR
    // ======================================

    const [rooms] = await connection.execute(
      `
      SELECT
        id,
        nomor_kamar,
        tipe,
        harga
      FROM rooms
      WHERE nomor_kamar = ?
      FOR UPDATE
      `,
      [String(kode.nomor_kamar)]
    );

    if (rooms.length !== 1) {
      await connection.rollback();
      transactionStarted = false;

      return gagal(
        "Nomor kamar pada kode undangan tidak ditemukan.",
        404
      );
    }

    const kamar = rooms[0];

    // ======================================
    // 15. CEK KETERSEDIAAN KAMAR
    // ======================================
    // Tolak bila masih ada sewa aktif
    // yang berlangsung pada atau setelah
    // tanggal masuk calon penghuni.

    const [sewaBentrok] =
      await connection.execute(
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
          kode.tanggal_masuk,
        ]
      );

    if (sewaBentrok.length > 0) {
      await connection.rollback();
      transactionStarted = false;

      return gagal(
        "Kamar sudah memiliki penyewaan yang bentrok dengan tanggal masuk. Hubungi pemilik kost.",
        409
      );
    }

    // ======================================
    // 16. VALIDASI HARGA KAMAR
    // ======================================

    const hargaSewa = Number(kamar.harga);

    if (
      !Number.isSafeInteger(hargaSewa) ||
      hargaSewa <= 0
    ) {
      throw new Error(
        "Harga kamar tidak valid."
      );
    }

    // ======================================
    // 17. GENERATE ID PENGHUNI
    // ======================================

    const idUser =
      "PNG-" +
      randomBytes(7)
        .toString("hex")
        .toUpperCase();

    // ======================================
    // 18. BUAT AKUN PENGHUNI
    // ======================================
    // is_active = 1 berarti akun valid.
    // Bukan berarti penghuni sudah
    // menempati kamar secara fisik.

    await connection.execute(
      `
      INSERT INTO users (
        id_user,
        kode_unik,
        nama,
        gmail,
        no_telp,
        password_hash,
        role,
        is_active
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, 'penghuni', 1
      )
      `,
      [
        idUser,
        kodeUnik,
        nama,
        gmail,
        noTelp,
        passwordHash,
      ]
    );

    // ======================================
    // 19. BUAT DATA PENYEWAAN
    // ======================================
    // Data sewa dicatat sejak Sign Up.
    // Okupansi aktual dihitung dari
    // tanggal masuk dan tanggal keluar.

    const [hasilSewa] =
      await connection.execute(
        `
        INSERT INTO sewa_kamar (
          id_user,
          id_kamar,
          id_kode,
          tanggal_masuk,
          tanggal_keluar,
          harga_sewa,
          status_sewa
        )
        VALUES (
          ?, ?, ?, ?, NULL, ?, 'aktif'
        )
        `,
        [
          idUser,
          kamar.id,
          kode.id_kode,
          kode.tanggal_masuk,
          hargaSewa,
        ]
      );

    const idSewa = hasilSewa.insertId;

    // ======================================
    // 20. BUAT TAGIHAN PERTAMA
    // ======================================
    // Periode pertama dimulai
    // pada tanggal masuk.
    // Jatuh tempo = tanggal masuk.
    // periode_ke = 0 sesuai data kita.

    const [hasilTagihan] =
      await connection.execute(
        `
        INSERT INTO tagihan (
          id_sewa,
          periode_ke,
          periode_mulai,
          periode_selesai,
          tanggal_jatuh_tempo,
          nominal,
          status_tagihan
        )
        VALUES (
          ?,
          0,
          ?,
          DATE_SUB(
            DATE_ADD(
              ?, INTERVAL 1 MONTH
            ),
            INTERVAL 1 DAY
          ),
          ?,
          ?,
          'belum_bayar'
        )
        `,
        [
          idSewa,
          kode.tanggal_masuk,
          kode.tanggal_masuk,
          kode.tanggal_masuk,
          hargaSewa,
        ]
      );

    // ======================================
    // 21. TANDAI KODE SUDAH DIGUNAKAN
    // ======================================

    const [hasilKode] =
      await connection.execute(
        `
        UPDATE kode_undangan
        SET
          status = 'digunakan',
          digunakan_oleh = ?,
          used_at = CURRENT_TIMESTAMP
        WHERE id_kode = ?
          AND status = 'aktif'
          AND digunakan_oleh IS NULL
          AND used_at IS NULL
        `,
        [
          idUser,
          kode.id_kode,
        ]
      );

    if (hasilKode.affectedRows !== 1) {
      throw new Error(
        "Gagal mengubah status kode undangan."
      );
    }

    // ======================================
    // 22. SIMPAN SEMUA PERUBAHAN
    // ======================================

    await connection.commit();
    transactionStarted = false;

    // ======================================
    // 23. RESPONSE REGISTRASI BERHASIL
    // ======================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Registrasi berhasil! Akun dan data sewa telah dibuat. Silakan login.",
        data: {
          id_user: idUser,
          nama,
          gmail,
          role: "penghuni",
          nomor_kamar: kamar.nomor_kamar,
          tanggal_masuk: kode.tanggal_masuk,
          id_sewa: idSewa,
          id_tagihan:
            hasilTagihan.insertId,
          nominal_tagihan: hargaSewa,
          status_tagihan: "belum_bayar",
        },
      },
      { status: 201 }
    );

  } catch (error) {
    // ======================================
    // 24. ROLLBACK JIKA GAGAL
    // ======================================

    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "SIGN UP ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "SIGN UP API ERROR:",
      {
        code: error.code,
        message: error.message,
      }
    );

    if (
      error.code === "ER_DUP_ENTRY" ||
      error.errno === 1062
    ) {
      return gagal(
        "Gmail, nomor telepon, ID, atau kode undangan sudah digunakan.",
        409
      );
    }

    return gagal(
      "Registrasi gagal karena terjadi kesalahan server.",
      500
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
