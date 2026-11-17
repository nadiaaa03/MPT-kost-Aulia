
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../site-header";
import Icon from "../icons";
import styles from "./login.module.css";
import { Poppins, Caveat } from "next/font/google";
import { useRouter } from "next/navigation";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-caveat",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});


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

export default function LoginPage() {
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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

      const rawResponse = await response.text();

      console.log("STATUS API:", response.status);
      console.log("RESPONS API:", rawResponse);

      let result;

      try {
        result = JSON.parse(rawResponse);
      } catch (error) {
        throw new Error(
          `Respons API tidak valid. Status: ${response.status}. Periksa Console dan terminal.`
        );
      }

      if (!response.ok) {
        throw new Error(result.message || "Login gagal.");
      }

      setMessage("Login berhasil! Selamat datang, " + result.user.nama);
      if (result.user.role === "pemilik") {
        router.push("/owner");
        router.refresh();
      } else if (result.user.role === "penghuni") {
        router.push("/");
        router.refresh();
      }

      // Pengalihan dashboard dapat ditambahkan
      // setelah halaman dashboard tersedia.
    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`${styles.page} ${poppins.variable} ${caveat.variable}`}
    >
      {/* HEADER */}
      <SiteHeader variant="solid" />

      {/* BAGIAN UTAMA */}
      <section className={styles.loginSection}>
        {/* SISI KIRI */}
        <div className={styles.welcomePanel}>
          <Image
            src="/image/kost-tampak-luar.png"
            alt="Tampak depan Kost Aulia"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 50vw"
            className={styles.welcomeImage}
          />

          <div className={styles.welcomeOverlay} />
          
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>
              Selamat
              <br />
              Datang
            </h1>

            <p className={styles.welcomeSmall}>
              di Kost Pilihan Terbaikmu.
            </p>
          </div>
        </div>

        {/* SISI KANAN */}
        <div className={styles.formPanel}>
          <div className={styles.loginContent}>
            <h2 className={styles.formTitle}>
              Masuk untuk Melanjutkan
            </h2>

            <p className={styles.formDescription}>
              Belum memiliki akun? Daftar sebagai penghuni sekarang.
            </p>

            <Link
              href="/sign-up"
              className={styles.registerButton}
            >
              <span className={styles.registerIcon}>＋</span>
              Daftar Sebagai Penghuni Baru
            </Link>

            <div className={styles.separator}>
              <span />
              <p>ATAU</p>
              <span />
            </div>

            <p className={styles.loginInstruction}>
              Gunakan Email dan Password yang Sudah Terdaftar
            </p>

            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label htmlFor="email">Email</label>

                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        width="21"
                        height="21"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
                        <path d="M4 21v-1.2C4 16.6 7.58 14 12 14s8 2.6 8 5.8V21H4Z" />
                      </svg>
                    </span>

                    <input
                      id="email"
                      type="email"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      placeholder="Masukkan email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="password">Password</label>

                  
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <svg
                        viewBox="0 0 24 24"
                        width="21"
                        height="21"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Zm3 4a2 2 0 0 0-1 3.73V19h2v-1.27A2 2 0 0 0 12 14Z" />
                      </svg>
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          width="21"
                          height="21"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          width="21"
                          height="21"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m3 3 18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a14.8 14.8 0 0 1-3.1 3.9" />
                          <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.1 0 2.1-.2 3-.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {message && (
                <p
                  role="alert"
                  className={`${styles.message} ${
                    message.startsWith("Login berhasil")
                      ? styles.successMessage
                      : styles.errorMessage
                  }`}
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
        </div>
      </section>

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
            <Link href="/#fasilitas">Fasilitas</Link>
            <Link href="/#kontak">FAQ</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>KONTAK</h3>
            <a href="https://wa.me/6281259215140" target="_blank" rel="noreferrer">
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
    </main>
  );
}
