"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const roomTypes = [
  {
    id: "standar",
    title: "Tipe Standar",
    image: "/image/kost-standar.jpeg",
    price: "Rp 1.100.000",
    available: 10,
    total: 15,
    facilities: [
      "Kasur spring bed",
      "Free WiFi",
      "Kamar mandi dalam",
      "TV Digital",
      "Teko listrik/kamar",
      "Lemari baju",
      "Meja dan kursi di dalam kamar",
      "AC",
      "Listrik (token) bulanan",
      "Air PDAM Umbulan Pasuruan",
      "Satu jendela yang mengarah keluar",
    ],
  },
  {
    id: "exclusive",
    title: "Tipe Exclusive",
    image: "/image/kost-exclusive.jpeg",
    price: "Rp 1.200.000",
    available: 2,
    total: 8,
    facilities: [
      "Kasur spring bed",
      "Free WiFi",
      "Kamar mandi dalam",
      "TV Digital",
      "Teko listrik/kamar",
      "Lemari baju",
      "Meja dan kursi di dalam kamar",
      "AC",
      "Listrik (token) bulanan",
      "Air PDAM Umbulan Pasuruan",
      "Dua jendela yang mengarah keluar",
    ],
  },
];

const galleryPreview = [
  "/image/kamar-standar.png",
  "/image/kamar-exclusive.png",
  "/image/dapur-bersama.png",
  "/image/parkiran-luas.png",
];

export default function OwnerDashboardPage() {
  const totalAvailable = roomTypes.reduce(
    (sum, item) => sum + item.available,
    0
  );
  const totalRooms = roomTypes.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const occupancy = Math.round(
    ((totalRooms - totalAvailable) / totalRooms) * 100
  );

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/image/logo-kost-aulia.png"
              alt="Logo Kost Aulia"
              width={137}
              height={81}
              className={styles.logo}
              priority
            />
          </Link>

          <nav className={styles.nav}>
            <Link href="/owner">Beranda</Link>
            <Link href="/owner/invitation-codes">Kode Undangan</Link>
            <Link href="/owner/ulasan">Ulasan</Link>
          </nav>

          <div className={styles.headerActions}>
            <Link href="/" className={styles.backButton}>
              Kembali ke Beranda Publik
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <Image
          src="/image/kost-tampak-luar.png"
          alt="Tampak luar Kost Aulia"
          fill
          priority
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <h1>Manajemen Kost</h1>

          <div className={styles.summaryGrid}>
            {/* MONITORING KAMAR */}
            <div className={styles.summaryCard}>
              <h3>Monitoring Kamar</h3>

              <div className={styles.monitorBox}>
                <div className={styles.monitorHeader}>
                  <span>Okupansi Kamar</span>
                  <strong>
                    {totalAvailable} / {totalRooms} tersisa
                  </strong>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${occupancy}%` }}
                  />
                </div>

                <p className={styles.smallInfo}>
                  {occupancy}% kamar sedang terisi
                </p>
              </div>
            </div>

            {/* TAGIHAN */}
            <div className={styles.summaryCard}>
              <h3>Tagihan</h3>

              <div className={styles.billBox}>
                <span className={styles.billLabel}>Belum Bayar</span>
                <h4>2 Kamar</h4>

                <Link
                  href="/owner/pembayaran"
                  className={styles.detailButton}
                >
                  Lihat Detail →
                </Link>
              </div>
            </div>

            {/* QUICK ACTION */}
            <div className={styles.summaryCard}>
              <h3>Aksi Cepat</h3>

              <div className={styles.quickActions}>
                <Link href="/owner/invitation-codes" className={styles.quickAction}>
                  Kelola Kode Undangan
                </Link>
                <Link href="/owner/kamar" className={styles.quickAction}>
                  Edit Info Kamar
                </Link>
                <Link href="/owner/galeri" className={styles.quickAction}>
                  Kelola Foto Kost
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KONTEN */}
      <section className={styles.contentSection}>
        <div className={styles.contentInner}>
          <h2 className={styles.sectionTitle}>Edit Tarif Kamar</h2>

          <div className={styles.roomList}>
            {roomTypes.map((room) => (
              <article key={room.id} className={styles.roomCard}>
                <div className={styles.roomTop}>
                  <div className={styles.roomPreview}>
                    <Image
                      src={room.image}
                      alt={room.title}
                      width={170}
                      height={120}
                      className={styles.roomImage}
                    />
                  </div>

                  <div className={styles.roomMain}>
                    <div className={styles.roomHeader}>
                      <h3>{room.title}</h3>

                      <button
                        type="button"
                        className={styles.editLink}
                      >
                        ✎ Edit
                      </button>
                    </div>

                    <div className={styles.priceBox}>
                      <span className={styles.priceLabel}>
                        Tarif Sewa Kamar
                      </span>

                      <div className={styles.priceRow}>
                        <strong>{room.price}</strong>
                        <span>/bulan</span>
                      </div>
                    </div>

                    <div className={styles.roomMeta}>
                      <span>Ketersediaan: {room.available} kamar</span>
                      <span>Total kamar: {room.total}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.facilityBlock}>
                  <h4>Fasilitas {room.title}</h4>

                  <ul className={styles.facilityList}>
                    {room.facilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          {/* SECTION KELOLA BERANDA PUBLIC */}
          <div className={styles.publicSyncSection}>
            <div className={styles.publicSyncHeader}>
              <div>
                <h2>Kontrol Beranda Public</h2>
                <p>
                  Informasi yang dikelola di sini nantinya bisa langsung
                  ditampilkan pada halaman public, seperti foto terbaru,
                  ketersediaan kamar, harga, dan fasilitas.
                </p>
              </div>

              <button type="button" className={styles.primaryButton}>
                Simpan Perubahan
              </button>
            </div>

            <div className={styles.publicGrid}>
              <div className={styles.publicCard}>
                <h3>Informasi yang Bisa Diedit</h3>
                <ul className={styles.publicInfoList}>
                  <li>Nama / tipe kamar</li>
                  <li>Harga sewa bulanan</li>
                  <li>Jumlah kamar tersedia</li>
                  <li>Deskripsi singkat kamar</li>
                  <li>Fasilitas tiap tipe kamar</li>
                  <li>Foto kamar dan area kost</li>
                </ul>
              </div>

              <div className={styles.publicCard}>
                <h3>Preview Galeri Kost</h3>
                <div className={styles.galleryGrid}>
                  {galleryPreview.map((src, index) => (
                    <div className={styles.galleryItem} key={index}>
                      <Image
                        src={src}
                        alt={`Galeri Kost ${index + 1}`}
                        width={220}
                        height={160}
                        className={styles.galleryImage}
                      />
                    </div>
                  ))}
                </div>

                <button type="button" className={styles.secondaryButton}>
                  + Tambahkan Foto / Informasi Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER OWNER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Image
              src="/image/logo-kost-aulia.png"
              alt="Logo Kost Aulia"
              width={90}
              height={54}
              className={styles.footerLogo}
            />
            <p>
              Kost khusus putri yang terletak di pusat kota Gresik dengan
              fasilitas lengkap, untuk hidup yang lebih tenang.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h4>LINK</h4>
            <Link href="/owner">Beranda</Link>
            <Link href="/owner/kode-undangan">Kode Undangan</Link>
            <Link href="/owner/pembayaran">Pembayaran</Link>
            <Link href="/owner/ulasan">Ulasan</Link>
          </div>

          <div className={styles.footerColumn}>
            <h4>KONTAK</h4>
            <a
              href="https://wa.me/6281259215140"
              target="_blank"
              rel="noreferrer"
            >
              0812 - 5921 - 5140
            </a>
          </div>

          <div className={styles.footerColumn}>
            <h4>LOKASI</h4>
            <p>
              Jl. Mawar No.14
              <br />
              Bp. Wetan, Gresik
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}