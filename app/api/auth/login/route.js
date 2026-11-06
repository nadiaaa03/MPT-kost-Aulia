import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { gmail, password } = await request.json();

    // 1. Input wajib diisi
    if (!gmail || !password) {
      return Response.json(
        { message: 'Gmail dan password wajib diisi' },
        { status: 400 }
      );
    }

    // 2. SELECT: ambil akun berdasarkan gmail
    const [rows] = await db.query(
      `SELECT id_user, nama, gmail, password_hash, role, is_active
       FROM users
       WHERE gmail = ?
       LIMIT 1`,
      [gmail.toLowerCase()]
    );
    const user = rows[0];

    // 3. Cocokkan password dengan hash (bukan di SQL)
    const cocok = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    // Pesan sama untuk gmail salah dan password salah
    if (!cocok) {
      return Response.json(
        { message: 'Gmail atau password salah' },
        { status: 401 }
      );
    }

    // 4. is_active hanya diperiksa untuk penghuni
    if (user.role === 'penghuni' && user.is_active !== 1) {
      return Response.json(
        { message: 'Akun tidak aktif, hubungi pemilik kos' },
        { status: 403 }
      );
    }

    // 5. Buat token JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET belum diisi di .env.local');
      return Response.json({ message: 'Konfigurasi server belum lengkap' }, { status: 500 });
    }

    const token = jwt.sign(
      { id_user: user.id_user, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return Response.json({
      message: 'Login berhasil',
      token,
      user: { id_user: user.id_user, nama: user.nama, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}