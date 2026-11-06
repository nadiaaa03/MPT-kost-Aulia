export async function POST() {
  return Response.json(
    { message: 'Logout berhasil' },
    {
      headers: {
        // Menghapus cookie token (kalau nanti token disimpan di cookie)
        'Set-Cookie': 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      },
    }
  );
}