
const URL_RINGKASAN =
    // "http://localhost:3000/api/rooms/ringkasan";
    "https://mpt-kost-aulia.vercel.app/api/rooms/ringkasan";

const URL_DAFTAR_KAMAR =
    // "http://localhost:3000/api/rooms";
    "https://mpt-kost-aulia.vercel.app/api/rooms";

async function ambilJson(url) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil data: ${response.status}`
    );
  }

  return response.json();
}

export async function ambilInfoTipeKamar() {
  const [ringkasan, daftarKamar] = await Promise.all([
    ambilJson(URL_RINGKASAN),
    ambilJson(URL_DAFTAR_KAMAR),
  ]);
console.log("Data Ringkasan:", ringkasan);
console.log("Data Daftar Kamar:", daftarKamar);

  const hasil = {};

  for (const tipe of ["standar", "eksklusif"]) {
    // Mengambil ringkasan berdasarkan tipe kamar
    const info = ringkasan.per_tipe.find(
      (item) => item.tipe === tipe
    );

    // Mengambil daftar kamar berdasarkan tipe
    const kamarTipe = daftarKamar.filter(
      (item) => item.tipe === tipe
    );

    // Mengambil harga kamar
    const daftarHarga = kamarTipe
      .map((item) => Number(item.harga))
      .filter((harga) => Number.isFinite(harga) && harga > 0);

    hasil[tipe] = {
      ada: Boolean(info),

      tersedia: info
        ? Number(info.kamar_tersedia)
        : 0,

      penuh: info
        ? info.penuh
        : true,

      harga: daftarHarga.length > 0
        ? Math.min(...daftarHarga)
        : null,
    };
  }

  return hasil;
}
