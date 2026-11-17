
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import db from "@/lib/db";

export async function POST(request) {
  let connection;
  let transactionStarted = false;

  try {
    // =====================================
    // 1. AMBIL DATA FORM REGISTRASI
    // =====================================

    const body = await request.json();

    const nama =
      typeof body.nama === "string"
        ? body.nama.trim()
        : "";

    const gmail =
      typeof body.gmail === "string"
        ? body.gmail.trim().toLowerCase()
        : "";

    const no_telp =
      typeof body.no_telp === "string"
        ? body.no_telp.trim()
        : "";

    const password = body.password;

    const kodeUnik =
      typeof body.kode_unik === "string"
        ? body.kode_unik.trim().toUpperCase()
        : "";

    // =====================================
    // 2. VALIDASI INPUT WAJIB
    // =====================================

    if (
      !nama ||
      !gmail ||
      !no_telp ||
      !password ||
      !kodeUnik
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Semua kolom wajib diisi, termasuk kode undangan.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 3. VALIDASI GMAIL
    // =====================================

    if (!/^[^\s@]+@gmail\.com$/i.test(gmail)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gunakan alamat email Gmail yang valid.",
        },
        { status: 400 }
      );
    }

    if (gmail.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Email maksimal 100 karakter.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 4. VALIDASI PASSWORD
    // =====================================

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9\s]/.test(password)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password belum memenuhi semua persyaratan.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 5. VALIDASI NOMOR TELEPON
    // =====================================

    if (!/^[0-9+]{10,15}$/.test(no_telp)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nomor telepon harus terdiri dari 10–15 karakter angka atau tanda +.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 6. VALIDASI PANJANG DATA
    // =====================================

    if (nama.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama maksimal 100 karakter.",
        },
        { status: 400 }
      );
    }

    if (kodeUnik.length > 20) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode undangan maksimal 20 karakter.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 7. HASH PASSWORD
    // =====================================

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    // =====================================
    // 8. MULAI TRANSAKSI DATABASE
    // =====================================

    connection = await db.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // =====================================
    // 9. VALIDASI KODE UNDANGAN
    // =====================================

    const [codes] = await connection.execute(
      `SELECT
          id_kode,
          kode_unik,
          id_pemilik
       FROM kode_undangan
       WHERE kode_unik = ?
         AND status = 'aktif'
       FOR UPDATE`,
      [kodeUnik]
    );

    if (codes.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return NextResponse.json(
        {
          success: false,
          message:
            "Kode undangan tidak valid, tidak aktif, atau sudah digunakan.",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 10. BUAT ID PENGHUNI
    // =====================================

    const idUser =
      "PNG-" +
      randomBytes(7)
        .toString("hex")
        .toUpperCase();

    // =====================================
    // 11. SIMPAN AKUN KE TABEL USERS
    // =====================================

    await connection.execute(
      `INSERT INTO users (
          id_user,
          kode_unik,
          nama,
          gmail,
          no_telp,
          password_hash,
          role,
          is_active
       )
       VALUES (?, ?, ?, ?, ?, ?, 'penghuni', 1)`,
      [
        idUser,
        kodeUnik,
        nama,
        gmail,
        no_telp,
        passwordHash,
      ]
    );

    // =====================================
    // 12. UPDATE STATUS KODE UNDANGAN
    // =====================================

    const [updateResult] = await connection.execute(
      `UPDATE kode_undangan
       SET
          status = 'digunakan',
          digunakan_oleh = ?,
          used_at = CURRENT_TIMESTAMP
       WHERE id_kode = ?
         AND status = 'aktif'`,
      [idUser, codes[0].id_kode]
    );

    if (updateResult.affectedRows !== 1) {
      throw new Error(
        "Gagal memperbarui status kode undangan."
      );
    }

    // =====================================
    // 13. COMMIT TRANSAKSI
    // =====================================

    await connection.commit();
    transactionStarted = false;

    // =====================================
    // 14. RESPONSE BERHASIL
    // =====================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Registrasi berhasil! Silakan login.",
        data: {
          id_user: idUser,
          nama,
          gmail,
          role: "penghuni",
        },
      },
      { status: 201 }
    );

  } catch (error) {

    // =====================================
    // ROLLBACK JIKA TERJADI ERROR
    // =====================================

    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "SIGN UP ROLLBACK ERROR:",
          rollbackError.code,
          rollbackError.message
        );
      }
    }

    // =====================================
    // LOG ERROR BACKEND
    // =====================================

    console.error("SIGN UP API ERROR:", {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      message: error.message,
    });

    // =====================================
    // DUPLICATE ACCOUNT
    // =====================================

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gmail, nomor telepon, atau kode undangan sudah digunakan.",
        },
        { status: 409 }
      );
    }

    // =====================================
    // ERROR SERVER
    // =====================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Registrasi gagal karena terjadi kesalahan server.",
      },
      { status: 500 }
    );

  } finally {

    if (connection) {
      connection.release();
    }

  }
}
