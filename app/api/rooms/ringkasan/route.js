import { connection } from 'next/server';
import db from '@/lib/db';

// GET /api/rooms/ringkasan  (publik)
export async function GET() {
  await connection();

  try {
    const [total] = await db.query('SELECT * FROM v_ringkasan_kamar');
    const [perTipe] = await db.query('SELECT * FROM v_ringkasan_per_tipe');

    // SUM() dikembalikan sebagai teks oleh mysql2, jadi diubah ke angka
    const angka = (r) => ({
      ...r,
      total_kamar: Number(r.total_kamar),
      kamar_tersedia: Number(r.kamar_tersedia),
      kamar_terisi: Number(r.kamar_terisi),
    });

    const ringkasan = angka(total[0]);

    return Response.json({
      ...ringkasan,
      penuh: ringkasan.kamar_tersedia === 0,
      per_tipe: perTipe.map(angka).map((r) => ({
        ...r,
        penuh: r.kamar_tersedia === 0,
      })),
    });
  } catch (err) {
    console.error(err);
    return Response.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}