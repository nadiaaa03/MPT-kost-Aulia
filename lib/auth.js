import jwt from 'jsonwebtoken';

// Mengembalikan { id_user, role } atau null (artinya tamu)
export function ambilUser(request) {
  let token = null;

  const header = request.headers.get('authorization');
  if (header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  } else {
    token = request.cookies?.get('token')?.value || null;
  }
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Hasil: { user } kalau lolos, atau { error } berisi Response yang tinggal di-return
export function wajibRole(request, rolesDiizinkan) {
  const user = ambilUser(request);

  if (!user) {
    return {
      error: Response.json({ message: 'Silakan login terlebih dahulu' }, { status: 401 }),
    };
  }
  if (!rolesDiizinkan.includes(user.role)) {
    return {
      error: Response.json({ message: 'Anda tidak punya akses ke fitur ini' }, { status: 403 }),
    };
  }
  return { user };
}