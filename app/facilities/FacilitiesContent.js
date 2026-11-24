
"use client";

import { useCallback, useEffect, useState } from "react";
import { ambilInfoTipeKamar } from "@/lib/kamar-api";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../site-header";
import { Poppins, Caveat } from "next/font/google";
import styles from "./page.module.css";
import Icon from "../icons";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const WA = "https://wa.me/6281259215140";

const facilities = [
  {
    title: "2 Tipe Kamar",
    description: "Pilihan kamar yang nyaman sesuai kebutuhanmu.",
    image: "/image/dua-tipe-kamar.png",
  },
  {
    title: "Dapur Bersama",
    description: "Area memasak bersama yang praktis dan nyaman.",
    image: "/image/dapur-bersama.png",
  },
  {
    title: "Keamanan 24 Jam",
    description: "Lingkungan hunian yang lebih aman dan terpantau.",
    image: "/image/cctv.png",
  },
  {
    title: "Parkiran Luas",
    description: "Area parkir yang memadai untuk penghuni.",
    image: "/image/parkiran-luas.png",
  },
];

const roomTypes = [
  {
    id: "standar",
    apiKey: "standar",
    title: "Kamar Tipe Standar",
    description:
      "Pilihan kamar nyaman untuk kamu yang menginginkan hunian praktis dengan fasilitas yang menunjang kebutuhan sehari-hari.",
    images: [
      "/image/tipe-kamar-standar.png",
      "/image/kamar-standar-dua.png",
      "/image/kamar-mandi.png",
    ],
    imageLabels: ["Tampilan kamar", "Sudut kamar lainnya", "Kamar mandi"],
  },
  {
    id: "exclusive",
    apiKey: "eksklusif",
    title: "Kamar Tipe Exclusive",
    description:
      "Pilihan kamar dengan kenyamanan ekstra untuk menemani aktivitas dan waktu istirahatmu.",
    images: [
      "/image/kamar-exclusive.png",
      "/image/exclusive-dua.png",
      "/image/kamar-mandi.png",
    ],
    imageLabels: ["Tampilan kamar", "Sudut kamar lainnya", "Kamar mandi"],
  },
];

// Fasilitas kamar
// Untuk sementara, daftar fasilitas masih statis di frontend.
const roomFacilities = [
  "Kasur spring bed",
  "Kamar mandi dalam",
  "Teko listrik",
  "Meja dan kursi",
  "Listrik token",
  "Free WiFi",
  "TV Digital",
  "Lemari baju",
  "AC",
  "Air PDAM",
];

function ArrowIcon({ direction = "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={direction === "left" ? styles.arrowLeft : ""}
    >
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FacilityCard({ item }) {
  return (
    <article className={styles.facilityCard}>
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 700px) 45vw, 280px"
        className={styles.facilityImage}
      />

      <div className={styles.facilityOverlay}>
        <div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </div>
    </article>
  );
}

function RoomGallery({ room, onPreview }) {
  const [activeImage, setActiveImage] = useState(0);

  const previousImage = () => {
    setActiveImage((current) =>
      current === 0 ? room.images.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveImage((current) =>
      current === room.images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className={styles.roomGallery}>
      <div className={styles.roomImageFrame}>
        <Image
          src={room.images[activeImage]}
          alt={`${room.title} - ${room.imageLabels[activeImage]}`}
          fill
          sizes="(max-width: 800px) 90vw, 550px"
          className={styles.roomImage}
          priority={activeImage === 0}
        />

        <button
          type="button"
          className={styles.expandButton}
          onClick={() =>
            onPreview({
              src: room.images[activeImage],
              alt: `${room.title} - ${room.imageLabels[activeImage]}`,
            })
          }
          aria-label="Perbesar gambar"
          title="Perbesar gambar"
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 9 4.5 4.5M15 9l4.5-4.5M9 15l-4.5 4.5M15 15l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          type="button"
          className={`${styles.galleryArrow} ${styles.galleryPrevious}`}
          onClick={previousImage}
          aria-label="Foto sebelumnya"
        >
          <ArrowIcon direction="left" />
        </button>

        <button
          type="button"
          className={`${styles.galleryArrow} ${styles.galleryNext}`}
          onClick={nextImage}
          aria-label="Foto berikutnya"
        >
          <ArrowIcon />
        </button>

        <span className={styles.imageCounter}>
          {activeImage + 1} / {room.images.length}
        </span>
      </div>

      <div className={styles.galleryDots}>
        {room.images.map((image, index) => (
          <button
            type="button"
            key={image + index}
            className={`${styles.galleryDot} ${
              activeImage === index ? styles.galleryDotActive : ""
            }`}
            onClick={() => setActiveImage(index)}
            aria-label={`Lihat foto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Format angka menjadi Rupiah
function formatRupiah(angka) {
  if (angka === null || angka === undefined || angka === "") {
    return "Harga belum tersedia";
  }

  return Number(angka).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

// Card kamar publik: hanya untuk melihat informasi
function RoomCard({ room, info, loading, onPreview }) {
  const isFull =
    info?.penuh === true ||
    (info?.tersedia !== undefined && Number(info.tersedia) <= 0);

  let statusText = "Informasi belum tersedia";
  let statusBackground = "#E9EDF2";
  let statusColor = "#657386";

  if (loading) {
    statusText = "Memuat ketersediaan...";
  } else if (info?.ada) {
    if (isFull) {
      statusText = "Kamar sudah penuh";
      statusBackground = "#FBE1E1";
      statusColor = "#A83232";
    } else {
      statusText = `${info.tersedia} kamar tersedia`;
      statusBackground = "#DDF3E3";
      statusColor = "#367347";
    }
  }

  return (
    <article className={styles.roomCard}>
      <RoomGallery room={room} onPreview={onPreview} />

      <div className={styles.roomInfo}>
        <span className={styles.roomLabel}>KOST AULIA</span>
        <h3>{room.title}</h3>
        <p className={styles.roomDescription}>{room.description}</p>

        {/* HARGA DAN KETERSEDIAAN DIGABUNG DALAM CARD */}
        <div
          style={{
            marginTop: "20px",
            padding: "18px",
            background: "#f6eade",
            borderRadius: "14px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#88684d",
              marginBottom: "6px",
            }}
          >
            HARGA SEWA PER BULAN
          </span>

          <div
            style={{
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 700,
              color: "#002446",
              lineHeight: 1.4,
              overflowWrap: "anywhere",
            }}
          >
            {formatRupiah(info?.harga)}
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "12px",
              padding: "8px 14px",
              borderRadius: "30px",
              background: statusBackground,
              color: statusColor,
              fontSize: "12px",
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {statusText}
          </div>
        </div>

        {/* FASILITAS KAMAR */}
        <div
          style={{
            marginTop: "24px",
            width: "100%",
          }}
        >
          <h4
            style={{
              margin: "0 0 14px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#994619",
            }}
          >
            Fasilitas Kamar
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px 10px",
            }}
          >
            {roomFacilities.map((facility) => (
              <div
                key={facility}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "#594636",
                }}
              >
                <span
                  style={{
                    color: "#a66a3e",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <span>{facility}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FacilitiesPage() {
  const [preview, setPreview] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState("");

  // Mengambil harga dan ketersediaan kamar dari API
  const muatDataKamar = useCallback(async () => {
    try {
      setRoomError("");

      const hasil = await ambilInfoTipeKamar();
      setRoomData(hasil);
    } catch (err) {
      console.error("Gagal mengambil informasi kamar:", err);
      setRoomError(err.message || "Gagal memuat informasi kamar.");
    } finally {
      setRoomLoading(false);
    }
  }, []);

  useEffect(() => {
    muatDataKamar();

    // Refresh data secara otomatis setiap 60 detik
    const interval = setInterval(() => {
      muatDataKamar();
    }, 60000);

    return () => clearInterval(interval);
  }, [muatDataKamar]);

  useEffect(() => {
    if (window.location.hash === "#tipe-kamar") {
      requestAnimationFrame(() => {
        document.getElementById("tipe-kamar")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, []);

  return (
    <div className={`${styles.page} ${poppins.className}`}>
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>KOST AULIA GRESIK</span>

            <h1>
              Fasilitas untuk
              <br />
              <span className={caveat.className}>Kenyamananmu.</span>
            </h1>

            <p>
              Temukan hunian nyaman dengan fasilitas yang mendukung
              kebutuhanmu. Karena tempat tinggal yang baik membuat
              setiap harimu terasa lebih berarti.
            </p>

            <Link href="#fasilitas-utama" className={styles.heroButton}>
              Jelajahi Fasilitas
              <ArrowIcon />
            </Link>
          </div>

          <div className={styles.heroDecoration} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>

        {/* FASILITAS UTAMA */}
        <section
          id="fasilitas-utama"
          className={styles.facilitiesSection}
        >
          <div className={styles.sectionHeading}>
            <span className={styles.sectionEyebrow}>
              YANG KAMI SEDIAKAN
            </span>

            <h2>Fasilitas Utama</h2>

            <p>
              Berbagai fasilitas untuk membuat pengalaman tinggalmu
              semakin nyaman.
            </p>
          </div>

          <div className={styles.facilityTrack}>
            {facilities.map((item) => (
              <FacilityCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        {/* TIPE KAMAR */}
        <section id="tipe-kamar" className={styles.roomsSection}>
          <div className={styles.roomsHeading}>
            <span className={styles.sectionEyebrow}>
              PILIHAN HUNIAN
            </span>

            <h2>
              Temukan Kamar
              <br />
              <span className={caveat.className}>yang Tepat Untukmu.</span>
            </h2>

            <p>
              Kost Aulia menyediakan dua pilihan tipe kamar yang bisa
              disesuaikan dengan kebutuhan dan kenyamananmu.
            </p>
          </div>

          {/* PESAN ERROR API */}
          {roomError && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "#fff0ee",
                color: "#ad332b",
                fontSize: "13px",
              }}
            >
              Informasi harga dan ketersediaan belum dapat dimuat.
              Silakan coba muat ulang halaman.
              <button
                type="button"
                onClick={muatDataKamar}
                style={{
                  marginLeft: "10px",
                  padding: "7px 12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#002446",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Coba Lagi
              </button>
            </div>
          )}

          <div className={styles.roomsGrid}>
            {roomTypes.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                info={roomData?.[room.apiKey]}
                loading={roomLoading}
                onPreview={setPreview}
              />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <span className={styles.sectionEyebrow}>
              TERTARIK MENJADI PENGHUNI?
            </span>

            <h2 className={caveat.className}>
              Hunian Nyaman
              <br />
              Menantimu!
            </h2>

            <p>
              Masih punya pertanyaan atau ingin mengetahui informasi
              lebih lanjut mengenai kamar dan fasilitas Kost Aulia?
              Hubungi kami melalui WhatsApp.
            </p>

            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className={styles.ctaButton}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20.5 11.7a8.7 8.7 0 0 1-12.9 7.6L3 20.5l1.3-4.4a8.7 8.7 0 1 1 16.2-4.4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.3-.1.5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .3-.2 1.1-.7 1.5-.5.4-1.1.6-1.8.5-1-.1-2.2-.7-3.5-1.8-1.1-1-2-2.3-2.2-3.3-.2-.9.1-1.7.6-2.3Z"
                  fill="currentColor"
                />
              </svg>
              Hubungi Kami melalui WhatsApp
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Link href="/" aria-label="Kembali ke Beranda">
                <Image
                  src="/image/logo-kost-aulia.png"
                  alt="Logo Kost Aulia"
                  width={137}
                  height={81}
                  className={styles.footerLogoImage}
                />
              </Link>
            </div>

            <p>
              Kost khusus putri yang terletak di pusat kota Gresik
              dengan fasilitas lengkap, untuk hidup yang lebih tenang.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h3>LINK</h3>
            <Link href="/#beranda">Beranda</Link>
            <Link href="/facilities">Fasilitas</Link>
            <Link href="/#kontak">FAQ</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>KONTAK</h3>

            <a href={WA} target="_blank" rel="noreferrer">
              0812 - 5921 - 5140
            </a>

            <div className={styles.socialLinks}>
              <a
                href="https://instagram.com/itsaulia.kost"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Kost Aulia"
              >
                <Icon name="instagram" size={21} />
              </a>

              <a
                href="https://tiktok.com/@auliakost.gresik"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok Kost Aulia"
              >
                <Icon name="tiktok" size={21} />
              </a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3>LOKASI</h3>

            <p>
              Jl. Mawar No.14
              <br />
              Bp.Wetan, Gresik
            </p>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {preview && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau gambar"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setPreview(null)}
            aria-label="Tutup gambar"
          >
            ×
          </button>

          <div
            className={styles.lightboxImageWrap}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={preview.src}
              alt={preview.alt}
              fill
              sizes="95vw"
              className={styles.lightboxImage}
            />
          </div>

          <p className={styles.lightboxCaption}>{preview.alt}</p>
        </div>
      )}
    </div>
  );
}
