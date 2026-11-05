
// Data sementara informasi kost
const dataKost = {
    nama: "Kost Aulia",
    alamat: "Jl. Contoh No. 10",
    deskripsi: "Kost nyaman dan strategis",
    harga: 1200000,
    kontak: "081234567890",
    fasilitas: [
        "WiFi",
        "Parkir",
        "Kamar Mandi"
    ]
};

// API untuk mengambil informasi kost
export async function GET() {
    return Response.json({
        success: true,
        message: "Berhasil mengambil informasi kost",
        data: dataKost
    });
}

