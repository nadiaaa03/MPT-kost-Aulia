
import InteractiveImageAccordion from "./interactive-image-accordion";
import SiteHeader from "./site-header";
import Image from "next/image";
import ScrollReveal from "@/components/ui/scroll-reveal";
import Link from "next/link";
import { Poppins, Caveat } from "next/font/google";
import styles from "./page.module.css";
import Icon from "./icons";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const WA = "https://wa.me/6281259215140";

const MAPS =
  "https://www.google.com/maps/search/?api=1&query=Jl.+Mawar+No.14+Bp.+Wetan+Gresik";

const faq = [
  {
    q: "Apakah bisa sewa harian?",
    a: "Bisa. Selain sewa bulanan, kami juga menyediakan sewa harian untuk kamu yang hanya perlu menginap sementara. Silakan cek informasi lebih lanjut pada bagian Fasilitas.",
  },
  {
    q: "Bagaimana cara melakukan pesanan?",
    a: "Untuk pemesanan bisa menghubungi kami melalui WhatsApp yang tertera di daftar kontak.",
  },
  {
    q: "Bagaimana jika kita memiliki pertanyaan lebih lanjut?",
    a: "Jika memiliki pertanyaan lebih lanjut, kamu bisa menghubungi kontak yang tertera.",
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
        priority
      />
    </Link>
  );
}

export default function Home() {
  return (
    <div className={`${styles.page} ${poppins.className}`}>
      <SiteHeader />

      <main>
        {/* HERO */}
        <section id="beranda" className={styles.hero}>
          <div className={styles.heroOverlay}>
            <ScrollReveal className={styles.heroReveal}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  KOST PILIHAN
                </h1>

                <p className={`${styles.heroScript} ${caveat.className}`}>
                  Terbaikmu.
                </p>

                <p className={styles.heroSub}>
                  Kost khusus putri yang terletak di pusat kota Gresik
                  dengan fasilitas lengkap, untuk hidup yang lebih tenang.
                </p>

                <Link
                  href="/facilities#tipe-kamar"
                  className={styles.heroButton}
                >
                  Lihat Ketersediaan Kamar
                  <Icon name="arrow" size={18} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* TENTANG KOST AULIA */}
        <ScrollReveal>
          <section id="fasilitas" className={styles.about}>
            <div className={styles.aboutText}>
              <span className={styles.sectionBadge}>
                Tentang Kost Aulia
              </span>

              <h2 className={styles.sectionTitle}>
                Lebih dari Sekadar Kost
              </h2>

              <p className={styles.body}>
                Kost Aulia hadir untuk memberikan tempat tinggal yang
                nyaman, aman, dan strategis. Dengan fasilitas lengkap dan
                lingkungan yang kondusif, kami percaya ini adalah tempat
                terbaik untukmu.
              </p>

              <Link
                href="/facilities"
                className={styles.blueButton}
              >
                Lihat Fasilitas Lengkap
                <Icon name="arrow" size={18} />
              </Link>
            </div>

            <div className={styles.aboutAccordion}>
              <InteractiveImageAccordion />
            </div>
          </section>
        </ScrollReveal>

        {/* LOKASI */}
        <ScrollReveal>
          <section className={styles.location}>
            <div className={styles.locationInner}>
              <div className={styles.locationText}>
                <span className={styles.sectionBadge}>
                  Lokasi Strategis
                </span>

                <h2 className={styles.sectionTitle}>
                  Dekat Kemana Saja
                </h2>

                <p className={styles.body}>
                  Berlokasi di kawasan yang mudah dijangkau, Kost Aulia
                  memberikan akses praktis ke berbagai fasilitas penunjang
                  kehidupan sehari-hari, seperti pusat perbelanjaan,
                  laundry, tempat ibadah, institusi pendidikan, dan area
                  perkantoran.
                </p>

                <a
                  href={MAPS}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.blueButton}
                >
                  Buka Rute Google Maps
                  <Icon name="arrow" size={18} />
                </a>
              </div>

              <div className={styles.mapCard}>
                <div className={styles.mapImage}>
                  <iframe
                    title="Peta lokasi Kost Aulia"
                    src="https://maps.google.com/maps?q=Jl.%20Mawar%20No.14%20Bp.%20Wetan%2C%20Gresik&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className={styles.mapCaption}>
                  <strong>Kost Aulia</strong>
                  <span>Jl. Mawar No.14 Bp.Wetan, Gresik</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal>
          <section id="kontak" className={styles.faqSection}>
            <div className={styles.faqBox}>
              <span className={styles.faqLabel}>FAQ</span>

              <h2 className={styles.sectionTitle}>
                Pertanyaan Yang Sering Diajukan
              </h2>

              <div className={styles.faqList}>
                {faq.map((item) => (
                  <details
                    key={item.q}
                    className={styles.faqItem}
                    open
                  >
                    <summary>
                      <span>{item.q}</span>
                      <span className={styles.faqArrow}>&gt;</span>
                    </summary>

                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <section className={styles.cta}>
            <div className={styles.ctaInner}>
              <h2 className={caveat.className}>
                Siap Memulai
                <br />
                Cerita Baru?
              </h2>

              <p className={styles.ctaText}>
                Jangan lewatkan kesempatan untuk menikmati hunian nyaman
                dan lokasi strategis bersama Kost Aulia. Hubungi kami dan
                temukan hunian yang tepat untukmu!
              </p>

              <a
                href={WA}
                target="_blank"
                rel="noreferrer"
                className={styles.whatsappButton}
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
                WhatsApp Kami
              </a>
            </div>

            {/* FOOTER */}
            <footer id="footer" className={styles.footer}>
              <div className={styles.footerInner}>
                <div className={styles.footerBrand}>
                  <div className={styles.footerLogo}>
                    <Brand />
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
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
