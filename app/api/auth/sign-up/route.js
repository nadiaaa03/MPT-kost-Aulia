
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import db from "@/lib/db";

export async function POST(request) {
  let connection;
  let transactionStarted = false;

  try {
    const body = await request.json();

    const nama = body.nama?.trim();
    const gmail = body.gmail?.trim().toLowerCase();
    const no_telp = body.no_telp?.trim();
    const password = body.password;
    const kodeUnik = body.kode_unik?.trim().toUpperCase();

    // 1. Validasi input wajib
    if (!nama || !gmail || !no_telp || !password || !kodeUnik) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi, termasuk kode undangan." },
        { status: 400 }
      );
    }

    // 2. Validasi Gmail sesuai constraint database
    if (!/^[^\s@]+@gmail\.com$/i.test(gmail)) {
      return NextResponse.json(
        { success: false, message: "Gunakan alamat email Gmail yang valid." },
        { status: 400 }
      );
    }

    // 3. Validasi password
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9\s]/.test(password)
    ) {
      return NextResponse.json(
        { success: false, message: "Password belum memenuhi semua persyaratan." },
        { status: 400 }
      );
    }

    // 4. Validasi nomor telepon
    if (!/^[0-9+]{10,15}$/.test(no_telp)) {
      return NextResponse.json(
        { success: false, message: "Nomor telepon harus terdiri dari 10–15 angka." },
        { status: 400 }
      );
    }

    if (nama.length > 100) {
      return NextResponse.json(
        { success: false, message: "Nama maksimal 100 karakter." },
        { status: 400 }
      );
    }

    // 5. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Mulai transaksi database
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // 7. Kunci dan periksa kode undangan
    const [codes] = await connection.execute(
      `SELECT id_kode, kode_unik, id_pemilik
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
          message: "Kode undangan tidak valid, tidak aktif, atau sudah digunakan."
        },
        { status: 400 }
      );
    }

    // 8. Buat ID penghuni otomatis
    const idUser =
      "PNG-" + randomBytes(7).toString("hex").toUpperCase();

    // 9. Simpan akun penghuni ke users
    await connection.execute(
      `INSERT INTO users
       (id_user, kode_unik, nama, gmail, no_telp,
        password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 'penghuni', 1)`,
      [
        idUser,
        kodeUnik,
        nama,
        gmail,
        no_telp,
        passwordHash
      ]
    );

    // 10. Tandai kode undangan sudah digunakan
    const [updateResult] = await connection.execute(
      `UPDATE kode_undangan
       SET status = 'digunakan',
           digunakan_oleh = ?,
           used_at = CURRENT_TIMESTAMP
       WHERE id_kode = ?
       AND status = 'aktif'`,
      [idUser, codes[0].id_kode]
    );

    if (updateResult.affectedRows !== 1) {
      throw new Error("Gagal memperbarui status kode undangan.");
    }

    // 11. Simpan seluruh perubahan
    await connection.commit();
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil! Silakan login.",
        data: {
          id_user: idUser,
          nama,
          gmail,
          role: "penghuni"
        }
      },
      { status: 201 }
    );

  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    console.error("SIGN UP API ERROR:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "Gmail, nomor telepon, atau kode undangan sudah digunakan."
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Registrasi gagal karena terjadi kesalahan server."
      },
      { status: 500 }
    );

  } finally {
    if (connection) {
      connection.release();
    }
  }
}
