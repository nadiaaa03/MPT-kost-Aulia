
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins, Belanosima } from "next/font/google";
import Image from "next/image";
import styles from "./login.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const belanosima = Belanosima({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-belanosima",
});

export default function LoginPage() {
  const router = useRouter();

  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          gmail,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login gagal.");
      }

      setMessage("Login berhasil! Selamat datang, " + result.user.nama);

      // Pengalihan dashboard akan ditambahkan
      // setelah halaman dashboard tersedia.

    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <main
      className={`${styles.page} ${poppins.variable} ${belanosima.variable}`}
    >
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            src="/image/logo-kost-aulia.png"
            alt="Logo Kost Aulia"
            width={65}
            height={45}
            className={styles.logo}
          />
          <span>Kost Aulia</span>
        </div>

        <nav className={styles.nav}>
          <a href="/">Beranda</a>
          <a href="#contact">Kontak</a>
          <a href="/facilities">Fasilitas</a>
        </nav>

        <div className={styles.navButtons}>
          <a href="/signup" className={styles.signUp}>
            Daftar
          </a>
          <a href="/login" className={styles.loginButton}>
            Login
          </a>
        </div>
      </header>

      {/* HERO DAN FORM LOGIN */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Selamat Datang di Kost Aulia
        </h1>

        <p className={styles.tagline}>
          Kost Pilihan Terbaikmu.
        </p>

        <div className={styles.loginCard}>
          <h2 className={styles.formTitle}>
            Masuk untuk Melanjutkan
          </h2>

          <p className={styles.formDescription}>
            *Gunakan Email dan Password yang Sudah Terdaftar
          </p>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>✉</span>
                  <input
                    id="email"
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <p
                role="alert"
                style={{
                  color: message.startsWith("Login berhasil")
                    ? "green"
                    : "#c0392b",
                  fontSize: "14px",
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Memproses..." : "Konfirmasi"}
            </button>
          </form>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className={styles.contact}>
        <div className={styles.contactContent}>
          <h2 className={styles.contactTitle}>Kontak Kami</h2>

          <p className={styles.contactDescription}>
            Jika ada pertanyaan lebih lanjut, jangan ragu untuk
            menghubungi kami.
          </p>

          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>☎</span>
              <span>0812 - 5921 - 5140</span>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>◎</span>
              <span>@itsaulia.kost</span>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>♪</span>
              <span>@auliakost.gresik</span>
            </div>
          </div>

          <a
            href="https://wa.me/6281259215140"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            Hubungi Whatsapp <span>→</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image
            src="/image/logo-kost-aulia.png"
            alt="Logo Kost Aulia"
            width={65}
            height={45}
            className={styles.logo}
          />
          <span>Kost Aulia</span>
        </div>

        <p className={styles.footerTagline}>
          Kost Pilihan Terbaikmu.
        </p>
      </footer>
    </main>
  );
}
