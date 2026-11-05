
import Link from "next/link";
import styles from "./page.module.css";

const amenities = [
  { icon: "⌂", label: "Kamar Nyaman", detail: "dan Bersih" },
  { icon: "⌁", label: "Keamanan", detail: "24 Jam" },
  { icon: "◔", label: "WiFi", detail: "Gratis" },
  { icon: "◌", label: "Lokasi", detail: "Strategis" },
  { icon: "✦", label: "Lingkungan", detail: "Asri" },
];

const faqs = [
  {
    question: "Apakah bisa sewa harian?",
    answer:
      "Bisa, selain sewa bulanan, kami juga menyediakan sewa harian untuk kebutuhan singkat atau tamu yang sedang menempati kamar dengan jangka waktu tertentu.",
  },
  {
    question: "Bagaimana cara melakukan pemesanan?",
    answer:
      "Klik tombol 'Booking Sekarang' di bawah ini dan isi form pemesanan. Tim kami akan menghubungi Anda untuk konfirmasi ketersediaan kamar.",
  },
  {
    question: "Bagaimana jika kita memiliki pertanyaan lebih lanjut?",
    answer:
      "Silakan hubungi kami melalui WhatsApp, telepon, atau email yang tertera di bagian kontak. Kami akan dengan senang hati membantu Anda.",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>⌂</span>
            <span>Kost Aulia</span>
          </Link>

          <nav className={styles.navigation} aria-label="Main navigation">
            <a href="#beranda">Beranda</a>
            <a href="#kontak">Kontak</a>
            <a href="#fasilitas">Fasilitas</a>
            <a href="#faq">FAQ</a>
          </nav>

          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
        </div>
      </header>

      <section id="beranda" className={styles.heroSection}>
        <div className={styles.heroCard}>
          <div className={styles.heroText}>
            <p className={styles.address}>📍 Jl. Mawar No.14 Bp.Wetan, Gresik</p>

            <h1>
              Kost Pilihan
              <br />
              Terbaikmu.
            </h1>

            <p className={styles.description}>
              Kost nyaman dengan fasilitas lengkap,
              <br />
              untuk hidup yang lebih tenang.
            </p>

            <a href="#fasilitas" className={styles.heroButton}>
              Lihat Ketersediaan Kamar <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className={styles.heroPhoto} aria-hidden="true">
            <div className={styles.photoGlow} />
            <div className={styles.windowRow}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.photoLine} />
          </div>
        </div>

        <div className={styles.featureStrip}>
          {amenities.map((item) => (
            <div key={item.label} className={styles.featureCard}>
              <span className={styles.iconBubble}>{item.icon}</span>
              <span className={styles.featureText}>
                {item.label}
                <small>{item.detail}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="fasilitas" className={styles.aboutSection}>
        <div className={styles.aboutText}>
          <p className={styles.sectionLabel}>Tentang Kost Aulia</p>
          <h2>Lebih dari Sekadar Kost</h2>
          <p>
            Kost Aulia hadir untuk memberika tempat tinggal yang nyaman, aman, dan strategis.
            Dengan fasilitas lengkap dan lingkungan yang tenang, Anda dapat menikmati setiap hari
            dengan lebih nyaman serta fokus pada aktivitas utama.
          </p>
        </div>

        <div className={styles.aboutImage} aria-hidden="true">
          <div className={styles.imageTop} />
          <div className={styles.imageBottom} />
        </div>
      </section>

      <section className={styles.locationSection}>
        <div className={styles.locationBadge}>📍 Lokasi Strategis</div>

        <div className={styles.mapCard}>
          <div className={styles.mapPin} aria-hidden="true">📍</div>
          <div className={styles.mapLabel} style={{ left: "18%", top: "26%" }}>Masjid</div>
          <div className={styles.mapLabel} style={{ left: "58%", top: "24%" }}>Laundry</div>
          <div className={styles.mapLabel} style={{ left: "15%", top: "64%" }}>Sekolah</div>
          <div className={styles.mapLabel} style={{ left: "66%", top: "58%" }}>Alun-alun</div>
          <div className={styles.mapLabel} style={{ left: "42%", top: "44%" }}>Kost Aulia</div>
        </div>

        <p className={styles.locationText}>
          Berlokasi di kawasan yang mudah dijangkau, Kost Aulia memberikan akses praktis ke
          berbagai fasilitas penunjang kehidupan sehari-hari, seperti pusat perbelanjaan, tempat
          ibadah, serta area pendidikan dan rekreasi.
        </p>
      </section>

      <section id="faq" className={styles.infoSection}>
        <div className={styles.faqPanel}>
          <h3>FAQ</h3>
          <div className={styles.faqList}>
            {faqs.map((item) => (
              <div key={item.question} className={styles.faqItem}>
                <button type="button" className={styles.faqQuestion}>
                  {item.question}
                  <span aria-hidden="true">›</span>
                </button>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <aside id="kontak" className={styles.contactPanel}>
          <h3>Kontak Kami</h3>
          <p>Jika ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.</p>

          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactIcon}>☎</span>
              <span>0812 - 5921 - 5140</span>
            </li>
            <li>
              <span className={styles.contactIcon}>✉</span>
              <span>itsaulia.kost</span>
            </li>
            <li>
              <span className={styles.contactIcon}>◎</span>
              <span>aulia@kostgresik</span>
            </li>
          </ul>

          <a href="https://wa.me/6281259215140" target="_blank" rel="noreferrer" className={styles.whatsappButton}>
            Hubungi WhatsApp <span aria-hidden="true">→</span>
          </a>
        </aside>
      </section>

      <section className={styles.ctaSection}>
        <h3>Mulai Cerita Barumu Bersama Kost Aulia!</h3>
        <p>Jangan lewatkan kesempatan untuk menikmati hunian nyaman dan lokasi strategis bersama Kost Aulia.</p>
        <a href="#beranda" className={styles.bookingButton}>
          Booking Sekarang <span aria-hidden="true">→</span>
        </a>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.footerMark}>⌂</span>
          <span>Kost Aulia</span>
        </div>
        <p>Kost Pilihan Terbaikmu.</p>
      </footer>
    </main>
  );
}
