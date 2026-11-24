
const URL_RINGKASAN =
      "https://mpt-kost-aulia.vercel.app/api/rooms/ringkasan";

const URL_DAFTAR_KAMAR =
      "https://mpt-kost-aulia.vercel.app/api/rooms";

async function ambilJson(url) {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let pesan = `Gagal mengambil data: ${response.status}`;

    try {
      const dataError = await response.json();

      if (dataError.message) {
        pesan = dataError.message;
      }
    } catch {
      // Jika response bukan JSON,
      // gunakan pesan error HTTP
    }

    throw new Error(pesan);
  }

  return response.json();
}

// ==========================================
// AMBIL INFORMASI KAMAR BERDASARKAN TIPE
// ==========================================

export async function ambilInfoTipeKamar() {
  // Mengambil data ringkasan dan daftar kamar
  // secara bersamaan

  const [ringkasan, daftarKamar] = await Promise.all([
    ambilJson(URL_RINGKASAN),
    ambilJson(URL_DAFTAR_KAMAR),
  ]);

  // Validasi struktur respons API
  if (
    !ringkasan ||
    !Array.isArray(ringkasan.per_tipe) ||
    !Array.isArray(daftarKamar)
  ) {
    throw new Error(
      "Format data kamar dari server tidak sesuai."
    );
  }

  const hasil = {};

  // Mengolah data kamar Standar dan Eksklusif
  for (const tipe of ["standar", "eksklusif"]) {

    // Cari ringkasan berdasarkan tipe
    const info = ringkasan.per_tipe.find(
      (item) => item.tipe === tipe
    );

    // Cari semua kamar dengan tipe yang sama
    const kamarTipe = daftarKamar.filter(
      (item) => item.tipe === tipe
    );

    // Ambil harga yang tersedia
    const daftarHarga = kamarTipe
      .map((item) => Number(item.harga))
      .filter(
        (harga) =>
          Number.isFinite(harga) &&
          harga > 0
      );

    // Gunakan harga terendah
    // sebagai harga mulai per tipe kamar
    const harga =
      daftarHarga.length > 0
        ? Math.min(...daftarHarga)
        : null;

    // Hitung jumlah kamar tersedia
    const tersedia = info
      ? Number(info.kamar_tersedia)
      : 0;

    const total = info
      ? Number(info.total_kamar)
      : 0;

    const terisi = info
      ? Number(info.kamar_terisi)
      : 0;

    // Susun data sesuai format TipeKamar.js
    hasil[tipe] = {
      ada: Boolean(info),
      harga,
      tersedia,
      total,
      terisi,
      penuh: Boolean(info) && tersedia === 0,
    };
  }

  return hasil;
}
