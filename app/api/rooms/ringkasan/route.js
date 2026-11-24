
import { connection } from "next/server";
import db from "@/lib/db";

// ==========================================
// GET /api/rooms/ringkasan
// API PUBLIK - TIDAK MEMERLUKAN LOGIN
// ==========================================

export async function GET() {
  // Menghindari hasil database
  // tersimpan sebagai cache statis.
  await connection();

  try {
    // ======================================
    // 1. AMBIL RINGKASAN SELURUH KAMAR
    // ======================================

    const [total] = await db.query(
      `
      SELECT
        total_kamar,
        kamar_tersedia,
        kamar_terisi,
        kamar_dipesan,
        keterangan
      FROM v_ringkasan_kamar
      `
    );

    // ======================================
    // 2. AMBIL RINGKASAN PER TIPE
    // ======================================

    const [perTipe] = await db.query(
      `
      SELECT
        tipe,
        total_kamar,
        kamar_tersedia,
        kamar_terisi,
        kamar_dipesan,
        keterangan
      FROM v_ringkasan_per_tipe
      `
    );

    // ======================================
    // 3. KONVERSI NILAI KE ANGKA
    // ======================================

    const angka = (row) => ({
      ...row,
      total_kamar: Number(row.total_kamar ?? 0),
      kamar_tersedia: Number(
        row.kamar_tersedia ?? 0
      ),
      kamar_terisi: Number(
        row.kamar_terisi ?? 0
      ),
      kamar_dipesan: Number(
        row.kamar_dipesan ?? 0
      ),
    });

    // ======================================
    // 4. RINGKASAN KESELURUHAN
    // ======================================

    const ringkasan = angka(total[0] ?? {});

    // ======================================
    // 5. RINGKASAN BERDASARKAN TIPE
    // ======================================

    const ringkasanPerTipe = perTipe.map(
      (row) => {
        const data = angka(row);

        return {
          ...data,

          // Kamar penuh jika tidak ada
          // kamar kosong yang tersedia.
          penuh: data.kamar_tersedia === 0,
        };
      }
    );

    // ======================================
    // 6. KIRIM RESPONSE KE FRONTEND
    // ======================================

    return Response.json({
      ...ringkasan,

      penuh: ringkasan.kamar_tersedia === 0,

      per_tipe: ringkasanPerTipe,
    });

  } catch (error) {
    console.error(
      "ROOM SUMMARY API ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Terjadi kesalahan saat mengambil ringkasan kamar.",
      },
      { status: 500 }
    );
  }
}
