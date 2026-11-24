
import jwt from "jsonwebtoken";
import db from "@/lib/db";

const ROLE_DIIZINKAN = [
  "penghuni",
  "pemilik",
  "admin",
];

// ============================================
// 1. AMBIL DAN VERIFIKASI TOKEN JWT
// ============================================

export function ambilUser(request) {
  let token = null;

  const header = request.headers.get(
    "authorization"
  );

  if (header?.startsWith("Bearer ")) {
    token = header.slice(7).trim();
  } else {
    token =
      request.cookies?.get("token")?.value ||
      null;
  }

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.id_user !== "string" ||
      !ROLE_DIIZINKAN.includes(payload.role)
    ) {
      return null;
    }

    return {
      id_user: payload.id_user,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

// ============================================
// 2. FUNGSI LAMA
// KOMPATIBILITAS SEMENTARA
// ============================================

// Fungsi ini hanya memeriksa JWT.
// Jangan gunakan untuk endpoint sensitif baru.
// Gunakan wajibRoleAktif sebagai penggantinya.

export function wajibRole(
  request,
  rolesDiizinkan
) {
  const user = ambilUser(request);

  if (!user) {
    return {
      error: Response.json(
        {
          success: false,
          message:
            "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      ),
    };
  }

  if (
    !Array.isArray(rolesDiizinkan) ||
    !rolesDiizinkan.includes(user.role)
  ) {
    return {
      error: Response.json(
        {
          success: false,
          message:
            "Anda tidak memiliki akses ke fitur ini.",
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

// ============================================
// 3. TANGGAL HARI INI DALAM WIB
// ============================================

export function tanggalWIB() {
  const bagian = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(new Date());

  const nilai = (type) =>
    bagian.find(
      (item) => item.type === type
    )?.value;

  return [
    nilai("year"),
    nilai("month"),
    nilai("day"),
  ].join("-");
}

// ============================================
// 4. VERIFIKASI ROLE DAN STATUS TERBARU
// ============================================

export async function wajibRoleAktif(
  request,
  rolesDiizinkan
) {
  // A. PERIKSA JWT

  const tokenUser = ambilUser(request);

  if (!tokenUser) {
    return {
      error: Response.json(
        {
          success: false,
          message:
            "Sesi tidak valid atau sudah berakhir. Silakan login.",
        },
        { status: 401 }
      ),
    };
  }

  // B. VALIDASI DAFTAR ROLE

  if (
    !Array.isArray(rolesDiizinkan) ||
    rolesDiizinkan.length === 0 ||
    !rolesDiizinkan.every(
      (role) => ROLE_DIIZINKAN.includes(role)
    )
  ) {
    return {
      error: Response.json(
        {
          success: false,
          message:
            "Konfigurasi izin akses tidak valid.",
        },
        { status: 500 }
      ),
    };
  }

  try {
    // ========================================
    // C. AMBIL STATUS AKUN DARI DATABASE
    // ========================================

    const [rows] = await db.execute(
      `
      SELECT
        id_user,
        nama,
        gmail,
        role,
        is_active
      FROM users
      WHERE id_user = ?
      LIMIT 1
      `,
      [tokenUser.id_user]
    );

    const userDB = rows[0];

    if (!userDB) {
      return {
        error: Response.json(
          {
            success: false,
            message:
              "Akun tidak ditemukan.",
          },
          { status: 401 }
        ),
      };
    }

    // ========================================
    // D. VALIDASI ROLE DARI DATABASE
    // ========================================

    if (tokenUser.role !== userDB.role) {
      return {
        error: Response.json(
          {
            success: false,
            message:
              "Hak akses akun berubah. Silakan login ulang.",
          },
          { status: 401 }
        ),
      };
    }

    if (
      !rolesDiizinkan.includes(userDB.role)
    ) {
      return {
        error: Response.json(
          {
            success: false,
            message:
              "Anda tidak memiliki akses ke fitur ini.",
          },
          { status: 403 }
        ),
      };
    }

    // ========================================
    // E. VALIDASI KHUSUS PENGHUNI
    // ========================================

    let sewaAktif = null;
    let statusPenempatan = null;

    if (userDB.role === "penghuni") {
      // Akun harus aktif.
      if (
        Number(userDB.is_active) !== 1
      ) {
        return {
          error: Response.json(
            {
              success: false,
              message:
                "Akun penghuni tidak aktif. Hubungi pemilik kost.",
            },
            { status: 403 }
          ),
        };
      }

      const hariIni = tanggalWIB();

      // Penyewaan boleh dimulai di masa depan.
      // Yang penting status sewa masih aktif
      // dan tanggal keluar belum lewat.

      const [sewaRows] =
        await db.execute(
          `
          SELECT
            s.id_sewa,
            s.id_kamar,
            DATE_FORMAT(
              s.tanggal_masuk, '%Y-%m-%d'
            ) AS tanggal_masuk,
            DATE_FORMAT(
              s.tanggal_keluar, '%Y-%m-%d'
            ) AS tanggal_keluar,
            s.status_sewa,
            s.harga_sewa,
            r.nomor_kamar,
            r.tipe
          FROM sewa_kamar s
          JOIN rooms r
            ON r.id = s.id_kamar
          WHERE s.id_user = ?
            AND s.status_sewa = 'aktif'
            AND (
              s.tanggal_keluar IS NULL
              OR s.tanggal_keluar >= ?
            )
          ORDER BY s.tanggal_masuk DESC,
                   s.id_sewa DESC
          LIMIT 1
          `,
          [
            userDB.id_user,
            hariIni,
          ]
        );

      if (sewaRows.length === 0) {
        return {
          error: Response.json(
            {
              success: false,
              message:
                "Tidak ada penyewaan aktif. Akses khusus penghuni tidak tersedia.",
            },
            { status: 403 }
          ),
        };
      }

      sewaAktif = sewaRows[0];

      // ======================================
      // F. BEDAKAN PEMESANAN DAN PENEMPATAN
      // ======================================

      if (
        sewaAktif.tanggal_masuk > hariIni
      ) {
        statusPenempatan = "dipesan";
      } else {
        statusPenempatan = "dihuni";
      }
    }

    // ========================================
    // G. OTORISASI BERHASIL
    // ========================================

    return {
      user: {
        id_user: userDB.id_user,
        nama: userDB.nama,
        gmail: userDB.gmail,
        role: userDB.role,
        is_active: userDB.is_active,
      },

      sewaAktif,
      statusPenempatan,
    };

  } catch (error) {
    console.error(
      "AUTHORIZATION ERROR:",
      {
        code: error.code,
        message: error.message,
      }
    );

    return {
      error: Response.json(
        {
          success: false,
          message:
            "Gagal memverifikasi hak akses.",
        },
        { status: 500 }
      ),
    };
  }
}
