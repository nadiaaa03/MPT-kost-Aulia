
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins, Caveat } from "next/font/google";
import SiteHeader from "../site-header";
import Icon from "../icons";
import styles from "./page.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const WA = "https://wa.me/6281259215140";

const reviews = [
  {
    id: 1,
    text: "Awalnya cuma cari kost yang lokasinya cocok, ternyata tempatnya juga nyaman buat ditinggali. Kalau lagi capek kuliah, pulang ke kost rasanya jadi waktu buat istirahat beneran.",
  },
  {
    id: 2,
    text: "Menurutku yang paling enak tuh fasilitasnya cukup lengkap buat kebutuhan sehari-hari. Jadi nggak perlu ribet ke sana-sini kalau mau masak atau sekadar beres-beres.",
  },
  {
    id: 3,
    text: "Udah lumayan lama tinggal di sini dan sejauh ini nyaman. Suasananya nggak terlalu ramai, jadi masih enak buat belajar atau ngerjain tugas.",
  },
  {
    id: 4,
    text: "Suka karena tempatnya terasa simpel dan nyaman. Apalagi setelah seharian beraktivitas, bisa pulang dan istirahat tanpa banyak gangguan.",
  },
  {
    id: 5,
    text: "Cari kost itu ternyata nggak gampang, banyak yang kelihatannya bagus tapi belum tentu cocok. Di sini aku suka karena fasilitasnya kepake dan lingkungannya terasa tenang.",
  },
  {
    id: 6,
    text: "Tempatnya cukup strategis, jadi kalau mau cari makan atau kebutuhan lain nggak terlalu jauh. Buat sehari-hari menurutku praktis banget.",
  },
];

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Kost Aulia">
      <Image
        src="/image/logo-kost-aulia.png"
        alt="Logo Kost Aulia"
        width={137}
        height={81}
        className={styles.logo}
      />
    </Link>
  );
}

function Footer() {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            <Brand />
          </div>
          <p>
            Kost khusus putri yang terletak di pusat kota Gresik dengan
            fasilitas lengkap, untuk hidup yang lebih tenang.
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
  );
}

export default function UlasanPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const move = (direction) => {
    setActiveIndex(
      (current) => (current + direction + reviews.length) % reviews.length
    );
  };

  const getOffset = (index) => {
    let offset = index - activeIndex;
    const half = reviews.length / 2;

    if (offset > half) offset -= reviews.length;
    if (offset < -half) offset += reviews.length;

    return offset;
  };

  return (
    <div className={`${styles.page} ${poppins.className}`}>
      <SiteHeader />

      <main>
        <section className={styles.reviewSection} aria-label="Ulasan Kost Aulia">
          <div className={styles.reviewHeading}>
            <h1>
              Cerita nyaman,
              <br />
              <span className={caveat.className}>dimulai dari sini.</span>
            </h1>

            <p className={styles.reviewDescription}>
              Setiap tempat punya ceritanya sendiri. Lihat pengalaman dan kesan
              tinggal di Kost Aulia.
            </p>
          </div>

          <div className={styles.carousel}>
            <div className={styles.cardStage}>
              {reviews.map((review, index) => {
                const offset = getOffset(index);
                const isCenter = offset === 0;
                const isSide = Math.abs(offset) === 1;
                const isVisible = Math.abs(offset) <= 2;

                return (
                  <article
                    key={review.id}
                    className={`${styles.reviewCard} ${
                      isCenter ? styles.centerCard : ""
                    } ${isSide ? styles.sideCard : ""} ${
                      !isVisible ? styles.hiddenCard : ""
                    }`}
                    style={{
                      transform: `translate(-50%, -50%) translateX(${offset * 72}%) scale(${
                        isCenter ? 1 : isSide ? 0.82 : 0.68
                      })`,
                      opacity: isCenter ? 1 : isSide ? 0.72 : 0,
                      zIndex: isCenter ? 5 : isSide ? 3 : 1,
                      pointerEvents: isVisible ? "auto" : "none",
                    }}
                    onClick={() => {
                      if (offset !== 0) setActiveIndex(index);
                    }}
                    aria-hidden={!isCenter}
                  >
                    <div className={styles.quoteMark} aria-hidden="true">
                      “
                    </div>

                    <p className={styles.reviewText}>{review.text}</p>

                    <div className={styles.cardBottom}>
                      <span className={styles.cardAccent} />
                      <span className={styles.cardLabel}>KOST AULIA</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className={styles.carouselControls}>
              <button
                type="button"
                onClick={() => move(-1)}
                className={styles.arrowButton}
                aria-label="Ulasan sebelumnya"
              >
                <span aria-hidden="true">←</span>
              </button>

              <div className={styles.dots} aria-label="Pilih ulasan">
                {reviews.map((review, index) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`${styles.dot} ${
                      index === activeIndex ? styles.activeDot : ""
                    }`}
                    aria-label={`Ulasan ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => move(1)}
                className={styles.arrowButton}
                aria-label="Ulasan selanjutnya"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
