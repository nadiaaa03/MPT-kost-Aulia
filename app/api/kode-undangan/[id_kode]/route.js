import db from '@/lib/db';
import { wajibRole } from '@/lib/auth';

const STATUS_VALID = ['aktif', 'nonaktif'];

// PATCH /api/kode-undangan/1  (pemilik, admin)
// Body: { "status": "nonaktif" }
export async function PATCH(request, { params }) {
  const { error } = wajibRole(request, ['pemilik', 'admin']);
  if (error) return error;

  try {
    const { id_kode } = await params;
    if (!/^[0-9]+$/.test(id_kode)) {
      return Response.json({ message: 'ID kode tidak valid' }, { status: 400 });
    }

    const { status } = await request.json();
    if (!STATUS_VALID.includes(status)) {
      return Response.json(
        { message: 'Status harus aktif atau nonaktif' },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      'UPDATE kode_undangan SET status = ? WHERE id_kode = ?',
      [status, id_kode]
    );
    if (result.affectedRows === 0) {
      return Response.json({ message: 'Kode undangan tidak ditemukan' }, { status: 404 });
    }
    return Response.json({ message: 'Status kode undangan diperbarui', id_kode: Number(id_kode), status });
  } catch (err) {
    console.error(err);
    return Response.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}