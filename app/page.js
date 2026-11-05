import Link from "next/link";
import { Poppins, Belanosima } from "next/font/google";
import styles from "./page.module.css";
   import Icon from "./Icons";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });
const belanosima = Belanosima({ subsets: ["latin"], weight: ["400", "700"] });

const WA = "https://wa.me/6281259215140";
const MAPS =
  "https://www.google.com/maps/search/?api=1&query=Jl.+Mawar+No.14+Bp.+Wetan+Gresik";

const keunggulan = [
  { icon: "bed", text: "Kamar Nyaman dan Bersih" },
  { icon: "shield", text: "Keamanan 24 Jam" },
  { icon: "wifi", text: "WiFi Gratis" },
  { icon: "pin", text: "Lokasi Strategis" },
  { icon: "plant", text: "Lingkungan Asri" },
];

const tempat = [
  { icon: "shirt", nama: "Laundry", warna: "brown" },
  { icon: "cart", nama: "Supermarket", warna: "navy" },
  { icon: "trees", nama: "Alun-alun", warna: "brown" },
  { icon: "mosque", nama: "Masjid", warna: "navy" },
  { icon: "course", nama: "Sekolah", warna: "brown" },
  { icon: "office", nama: "Perkantoran", warna: "navy" },
];

const faq = [
  {
    q: "Apakah bisa sewa harian?",
    a: "Bisa. Selain sewa bulanan, kami juga menyediakan sewa harian untuk kamu yang hanya perlu menginap sementara. Silahkan cek ketersediaan kamar dan tarif harian di halaman info kost.",
  },
  {
    q: "Bagaimana cara melakukan pesanan?",
    a: "Klik tombol “Booking Sekarang” di bagian paling bawah Beranda untuk melakukan pesanan.",
  },
  {
    q: "Bagaimana jika kita memiliki pertanyaan lebih lanjut?",
    a: "Jika memiliki pertanyaan lebih lanjut, bisa menghubungi kontak yang tertera.",
  },
];

const kontak = [
  { label: "0812 - 5921 - 5140", href: WA, icon: "phone" },
  { label: "@itsaulia.kost", href: "https://instagram.com/itsaulia.kost", icon: "instagram" },
  { label: "@auliakost.gresik", href: "https://tiktok.com/@auliakost.gresik", icon: "tiktok" },
];

function Brand() {
  return (
    <Link href="/" className={styles.brand}>
      <span className={styles.logo} aria-hidden="true" />
      <span className={`${styles.brandName} ${belanosima.className}`}>
        Kost Aulia
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <div className={`${styles.page} ${poppins.className}`}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand />
          <nav className={styles.nav} aria-label="Navigasi utama">
            <a href="#beranda">Beranda</a>
            <a href="#kontak">Kontak</a>
            <a href="#fasilitas">Fasilitas</a>
          </nav>
          <div className={styles.auth}>
            <Link href="/signup" className={styles.btnSolid}><Icon name="user" size={20} /> Sign Up</Link>
            <Link href="/login" className={styles.btnOutline}><Icon name="login" size={20} /> Login</Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section id="beranda" className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.heroText}>
              <p className={styles.address}><Icon name="pin" size={18} /> Jl. Mawar No.14 Bp.Wetan, Gresik</p>
              <h1 className={`${styles.heroTitle} ${belanosima.className}`}>
                Kost Pilihan Terbaikmu.
              </h1>
              <p className={styles.heroSub}>
                Kost khusus Putri dengan fasilitas lengkap, untuk hidup yang lebih tenang.
              </p>
              <a href="#booking" className={styles.btnPill}>
                Lihat Ketersediaan Kamar <Icon name="arrow" size={20} />
              </a>
            </div>
            <div className={styles.heroImg} role="img" aria-label="Halaman depan Kost Aulia" />
          </div>
        </section>

        {/* KEUNGGULAN */}
        <section id="fasilitas" className={styles.strip}>
          <ul className={styles.stripList}>
            {keunggulan.map((k) => (
              <li key={k.text}>
                <Icon name={k.icon} size={40} />
                {k.text}
              </li>
            ))}
          </ul>
        </section>

        {/* TENTANG */}
        <section className={styles.about}>
          <div className={styles.aboutText}>
            <span className={styles.pillLight}>Tentang Kost Aulia</span>
            <h2 className={styles.h2}>Lebih dari Sekadar Kost</h2>
            <p className={styles.body}>
              Kost Aulia hadir untuk memberikan tempat tinggal yang nyaman, aman, dan strategis.
              Dengan fasilitas lengkap dan lingkungan yang kondusif, kami percaya ini adalah
              tempat terbaik untukmu
            </p>
          </div>
          <div className={styles.aboutImg} role="img" aria-label="Lingkungan Kost Aulia" />
        </section>

        {/* LOKASI */}
        <section className={styles.location}>
          <div className={styles.locationInner}>
            <div className={styles.locationText}>
              <span className={styles.pillDark}>Lokasi Strategis</span>
              <h2 className={styles.h2}>Dekat Kemana Saja</h2>
              <p className={styles.body}>
                Berlokasi di kawasan yang mudah dijangkau, Kost Aulia memberikan akses praktis ke
                berbagai fasilitas penunjang kehidupan sehari-hari, seperti pusat perbelanjaan,
                laundry, tempat ibadah, institusi pendidikan, dan area perkantoran.
              </p>
              <ul className={styles.tiles}>
                {tempat.map((t) => (
                  <li key={t.nama} className={styles[t.warna]}>
                    <Icon name={t.icon} size={36} />
                    {t.nama}
                  </li>
                ))}
              </ul>
              <a href={MAPS} target="_blank" rel="noreferrer" className={styles.btnPill}>
                Lihat Peta <Icon name="arrow" size={20} />
              </a>
            </div>
            <div className={styles.mapBox} role="img" aria-label="Peta lokasi Kost Aulia">
              <div className={styles.pin}>
                <span className={styles.pinDot} />
                <span className={styles.pinLabel}>Kost Aulia</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ + KONTAK */}
        <section id="kontak" className={styles.info}>
          <div className={styles.faqBox}>
            <h2 className={styles.h2}>Pertanyaan Yang Sering Diajukan</h2>
            <div className={styles.faqList}>
              {faq.map((f) => (
                <details key={f.q} className={styles.faqItem} open>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className={styles.contactBox}>
            <h2 className={styles.h2}>Kontak Kami</h2>
            <p className={styles.body}>
              Jika ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami.
            </p>
            <ul className={styles.contactList}>
              {kontak.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target="_blank" rel="noreferrer">
                    <span className={styles.contactIcon}><Icon name={c.icon} size={22} /></span>
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href={WA} target="_blank" rel="noreferrer" className={styles.btnPill}>
              Hubungi Whatsapp <Icon name="arrow" size={20} />
            </a>
          </div>
        </section>

        {/* CTA BOOKING */}
        <section id="booking" className={styles.cta}>
          <div className={styles.ctaInner}>
            <h2 className={styles.h2Center}>Mulai Cerita Barumu Bersama Kost Aulia!</h2>
            <p className={styles.ctaText}>
              Jangan lewatkan kesempatan untuk menikmati hunian nyaman dan lokasi strategis bersama
              Kost Aulia.
            </p>
            <a href={WA} target="_blank" rel="noreferrer" className={styles.btnBig}>
              Booking Sekarang <Icon name="arrow" size={20} />
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Brand />
          <p className={styles.footerTag}>Kost Pilihan Terbaikmu.</p>
        </div>
      </footer>
    </div>
  );
}