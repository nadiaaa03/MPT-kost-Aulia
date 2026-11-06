import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS jumlah_user FROM users');
    return Response.json({ status: 'terhubung', ...rows[0] });
  } catch (err) {
    console.error(err);
    return Response.json({ status: 'gagal', pesan: err.message }, { status: 500 });
  }
}