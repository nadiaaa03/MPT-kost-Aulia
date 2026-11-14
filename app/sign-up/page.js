"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../site-header";
import Icon from "../icons";
import loginStyles from "../login/login.module.css";
import styles from "./page.module.css";
import { Poppins, Caveat } from "next/font/google";

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
    <Link
      href="/"
      className={loginStyles.brand}
      aria-label="Kost Aulia"
    >
      <Image
        src="/image/logo-kost-aulia.png"
        alt="Logo Kost Aulia"
        width={137}
        height={81}
        className={loginStyles.logo}
        priority
      />
    </Link>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: "",
    gmail: "",
    no_telp: "",
    kode_unik: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const requirements = [
    {
      label: "Minimal 8 karakter",
      valid: form.password.length >= 8,
    },
    {
      label: "Memiliki huruf besar (A-Z)",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "Memiliki huruf kecil (a-z)",
      valid: /[a-z]/.test(form.password),
    },
    {
      label: "Memiliki angka (0-9)",
      valid: /\d/.test(form.password),
    },
    {
      label: "Memiliki simbol (!@#$%)",
      valid: /[^A-Za-z0-9\s]/.test(form.password),
    },
  ];

  const passwordValid = requirements.every(
    (item) => item.valid
  );

  const passwordsMatch =
    form.password === form.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!passwordValid) {
      setMessage(
        "Password belum memenuhi semua persyaratan."
      );
      setMessageType("error");
      return;
    }

    if (!passwordsMatch) {
      setMessage("Konfirmasi password tidak cocok.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: form.nama,
          gmail: form.gmail,
          no_telp: form.no_telp,
          password: form.password,
          kode_unik: form.kode_unik,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Registrasi gagal."
        );
      }

      setMessage(
        result.message || "Pendaftaran berhasil."
      );
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.message || "Terjadi kesalahan."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`${loginStyles.page} ${poppins.variable} ${caveat.variable}`}
    >
      {/* HEADER */}
      <SiteHeader variant="solid" />

      {/* BAGIAN UTAMA */}
      <section className={loginStyles.loginSection}>
        {/* SISI KIRI */}
        <div className={loginStyles.welcomePanel}>
          <Image
            src="/image/kost-tampak-luar.png"
            alt="Tampak depan Kost Aulia"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 50vw"
            className={loginStyles.welcomeImage}
          />

          <div className={loginStyles.welcomeOverlay} />

          <div className={loginStyles.welcomeContent}>
            <h1 className={loginStyles.welcomeTitle}>
              Selamat
              <br />
              Datang
            </h1>

            <p className={loginStyles.welcomeSmall}>
              di Kost Pilihan Terbaikmu.
            </p>
          </div>
        </div>

        {/* SISI KANAN */}
        <div className={loginStyles.formPanel}>
          <div className={loginStyles.loginContent}>
            <h2 className={loginStyles.formTitle}>
              Daftar Akun
            </h2>

            <p className={loginStyles.formDescription}>
              *Gunakan Kode Unik yang Sudah Diberikan oleh
              Pemilik Kost
            </p>

            <form
              className={styles.signupForm}
              onSubmit={handleSubmit}
            >
              {/* NAMA LENGKAP */}
              <div className={styles.field}>
                <label htmlFor="nama">
                  Nama Lengkap
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="1"
                      />
                      <circle cx="9" cy="11" r="2" />
                      <path d="M6 16c.7-1.5 1.7-2 3-2s2.3.5 3 2" />
                      <path d="M15 10h3M15 14h3" />
                    </svg>
                  </span>

                  <input
                    id="nama"
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* NOMOR TELEPON */}
              <div className={styles.field}>
                <label htmlFor="no_telp">
                  Nomor Telepon
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 3h4l2 5-2.5 1.5a15 15 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z" />
                    </svg>
                  </span>

                  <input
                    id="no_telp"
                    type="tel"
                    name="no_telp"
                    value={form.no_telp}
                    onChange={handleChange}
                    placeholder="Masukkan nomor telepon"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className={styles.field}>
                <label htmlFor="gmail">
                  Email
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
                      <path d="M4 21v-1.2C4 16.6 7.58 14 12 14s8 2.6 8 5.8V21H4Z" />
                    </svg>
                  </span>

                  <input
                    id="gmail"
                    type="email"
                    name="gmail"
                    value={form.gmail}
                    onChange={handleChange}
                    placeholder="Masukkan email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className={styles.field}>
                <label htmlFor="password">
                  Password
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Zm3 4a2 2 0 0 0-1 3.73V19h2v-1.27A2 2 0 0 0 12 14Z" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>

                {/* PASSWORD REQUIREMENTS */}
                <div className={styles.requirements}>
                  <p className={styles.requirementsTitle}>
                    Password Requirements
                  </p>

                  {requirements.map((item, index) => (
                    <div
                      key={index}
                      className={
                        item.valid
                          ? styles.requirementValid
                          : styles.requirementInvalid
                      }
                    >
                      <span>
                        {item.valid ? "✓" : "✕"}
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* KONFIRMASI PASSWORD */}
              <div className={styles.field}>
                <label htmlFor="confirmPassword">
                  Konfirmasi Password
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Zm3 4a2 2 0 0 0-1 3.73V19h2v-1.27A2 2 0 0 0 12 14Z" />
                    </svg>
                  </span>

                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Masukkan ulang password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowConfirm(!showConfirm)
                    }
                    aria-label={
                      showConfirm
                        ? "Sembunyikan konfirmasi password"
                        : "Tampilkan konfirmasi password"
                    }
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>

                {form.confirmPassword && (
                  <p
                    className={
                      passwordsMatch
                        ? styles.matchSuccess
                        : styles.matchError
                    }
                  >
                    {passwordsMatch
                      ? "✓ Password sesuai"
                      : "✕ Password belum sesuai"}
                  </p>
                )}
              </div>

              {/* KODE UNIK */}
              <div className={styles.field}>
                <label htmlFor="kode_unik">
                  Kode Unik
                </label>

                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="10"
                        width="18"
                        height="11"
                        rx="2"
                      />
                      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" />
                    </svg>
                  </span>

                  <input
                    id="kode_unik"
                    type="text"
                    name="kode_unik"
                    value={form.kode_unik}
                    onChange={handleChange}
                    placeholder="Tuliskan Kode Unik yang Sudah Diberikan"
                    required
                  />
                </div>
              </div>

              {/* PESAN */}
              {message && (
                <p
                  role="alert"
                  className={
                    messageType === "success"
                      ? styles.messageSuccess
                      : styles.messageError
                  }
                >
                  {message}
                </p>
              )}

              {/* TOMBOL KONFIRMASI */}
              <button
                type="submit"
                className={loginStyles.submitButton}
                disabled={
                  loading ||
                  !passwordValid ||
                  !form.confirmPassword ||
                  !passwordsMatch
                }
              >
                {loading ? "Memproses..." : "Konfirmasi"}
              </button>
            </form>

            <p className={styles.login}>
              Sudah memiliki akun?{" "}
              <Link href="/login">Login</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="footer"
        className={loginStyles.footer}
      >
        <div className={loginStyles.footerInner}>
          <div className={loginStyles.footerBrand}>
            <div className={loginStyles.footerLogo}>
              <Brand />
            </div>

            <p>
              Kost khusus putri yang terletak di pusat kota
              Gresik dengan fasilitas lengkap, untuk hidup
              yang lebih tenang.
            </p>
          </div>

          <div className={loginStyles.footerColumn}>
            <h3>LINK</h3>
            <Link href="/#beranda">Beranda</Link>
            <Link href="/#fasilitas">Fasilitas</Link>
            <Link href="/#kontak">FAQ</Link>
          </div>

          <div className={loginStyles.footerColumn}>
            <h3>KONTAK</h3>
            <a
              href="https://wa.me/6281259215140"
              target="_blank"
              rel="noreferrer"
            >
              0812 - 5921 - 5140
            </a>

            <div className={loginStyles.socialLinks}>
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

          <div className={loginStyles.footerColumn}>
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

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
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
  );
}