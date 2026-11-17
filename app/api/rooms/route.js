import { connection } from 'next/server';
import db from '@/lib/db';
import { wajibRole } from '@/lib/auth';

const STATUS_VALID = ['kosong', 'terisi'];
const TIPE_VALID = ['eksklusif', 'standar'];

// GET /api/rooms?status=kosong&tipe=eksklusif  (publik)
export async function GET(request) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tipe = searchParams.get('tipe');

    const where = [];
    const params = [];

    if (status) {
      if (!STATUS_VALID.includes(status)) {
        return Response.json(
          { message: 'Status harus kosong atau terisi' },
          { status: 400 }
        );
      }
      where.push('status = ?');
      params.push(status);
    }
    if (tipe) {
      if (!TIPE_VALID.includes(tipe)) {
        return Response.json(
          { message: 'Tipe harus eksklusif atau standar' },
          { status: 400 }
        );
      }
      where.push('tipe = ?');
      params.push(tipe);
    }

    const sql =
      'SELECT id, nomor_kamar, tipe, harga, status, deskripsi FROM v_kamar' +
      (where.length ? ' WHERE ' + where.join(' AND ') : '') +
      ' ORDER BY CAST(nomor_kamar AS UNSIGNED)';

    const [rows] = await db.query(sql, params);
    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return Response.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

// POST /api/rooms  (pemilik, admin) -> menulis ke tabel rooms
export async function POST(request) {
  const { error } = wajibRole(request, ['pemilik', 'admin']);
  if (error) return error;

  try {
    const { nomor_kamar, tipe, harga, deskripsi } = await request.json();

    if (!nomor_kamar || String(nomor_kamar).trim() === '') {
      return Response.json({ message: 'Nomor kamar wajib diisi' }, { status: 400 });
    }
    if (String(nomor_kamar).length > 10) {
      return Response.json({ message: 'Nomor kamar maksimal 10 karakter' }, { status: 400 });
    }
    if (!TIPE_VALID.includes(tipe)) {
      return Response.json({ message: 'Tipe harus eksklusif atau standar' }, { status: 400 });
    }
    if (!Number.isInteger(harga) || harga <= 0) {
      return Response.json(
        { message: 'Harga harus berupa angka bulat lebih dari 0' },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      'INSERT INTO rooms (nomor_kamar, tipe, harga, deskripsi) VALUES (?, ?, ?, ?)',
      [String(nomor_kamar).trim(), tipe, harga, deskripsi || null]
    );

    return Response.json(
      { message: 'Kamar berhasil ditambahkan', id: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return Response.json({ message: 'Nomor kamar sudah ada' }, { status: 409 });
    }
    console.error(err);
    return Response.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}