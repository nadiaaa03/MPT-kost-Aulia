"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Poppins, Caveat } from "next/font/google";
import Icon from "../icons";
import styles from "./page.module.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-caveat",
});

const WA_PEMILIK = "https://wa.me/6281259215140";
const NO_REKENING = "150265791250";

function formatRupiah(angka) {
  if (angka === null || angka === undefined || !Number.isFinite(Number(angka))) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(angka));
}

function formatTanggalMasuk(tanggal) {
  if (!tanggal) return "— / — / —";
  const d = new Date(tanggal);
  if (Number.isNaN(d.getTime())) return String(tanggal);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd} / ${mm} / ${yy}`;
}

export default function PenghuniDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State interaksi UI
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ type: "", text: "" });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  async function muatDashboard() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/penghuni/dashboard", {
        cache: "no-store",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data dashboard.");
      }

      setData(json.data);
    } catch (err) {
      console.error("Dashboard penghuni:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatDashboard();
  }, []);

  async function handleCopyRekening() {
    try {
      await navigator.clipboard.writeText(NO_REKENING);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function prosesUploadFile(file) {
    if (!file) return;

    const idTagihan = data?.tagihan?.id_tagihan;
    if (!idTagihan) {
      setUploadMsg({
        type: "error",
        text: "Belum ada tagihan aktif untuk diunggah buktinya.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg({
        type: "error",
        text: "Ukuran file maksimal 5 MB.",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadMsg({ type: "", text: "" });

      const formData = new FormData();
      formData.append("id_tagihan", String(idTagihan));
      formData.append("bukti", file);

      const res = await fetch("/api/penghuni/pembayaran", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengunggah bukti transfer.");
      }

      setUploadMsg({
        type: "success",
        text: json.message || "Bukti pembayaran berhasil diunggah!",
      });

      await muatDashboard();
    } catch (err) {
      setUploadMsg({
        type: "error",
        text: err.message || "Terjadi kesalahan saat mengunggah.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) prosesUploadFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) prosesUploadFile(file);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Abaikan jika endpoint logout belum dibuat, tetap arahkan ke login
    }
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
    router.refresh();
  }

  const profil = data?.profil;
  const hunian = data?.hunian;
  const tagihan = data?.tagihan;
  const pembayaran = data?.pembayaran;

  // Penentuan status tampilan sesuai Lampiran 1 & 2
  const isLunas =
    tagihan?.status_tagihan === "lunas" ||
    pembayaran?.status_verifikasi === "diterima";

  const isDitolak =
    !isLunas && pembayaran?.status_verifikasi === "ditolak";

  const isMenunggu =
    !isLunas &&
    !isDitolak &&
    (tagihan?.status_tagihan === "menunggu_verifikasi" ||
      pembayaran?.status_verifikasi === "menunggu");

  const nominalTagihan =
    tagihan?.nominal ?? hunian?.harga_sewa ?? hunian?.harga_kamar ?? 1100000;

  let statusVerifikasiText = "Belum Melakukan Pembayaran";
  let statusVerifikasiClass = styles.statusNeutral;

  if (isLunas) {
    statusVerifikasiText = "Berhasil Diverifikasi";
    statusVerifikasiClass = styles.statusSuccess;
  } else if (isDitolak) {
    statusVerifikasiText = "Gagal Diverifikasi";
    statusVerifikasiClass = styles.statusDanger;
  } else if (isMenunggu) {
    statusVerifikasiText = "Menunggu Verifikasi";
    statusVerifikasiClass = styles.statusNeutral;
  }

  return (
    <div className={`${styles.page} ${poppins.variable} ${caveat.variable}`}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/penghuni" className={styles.brand} aria-label="Dashboard Penghuni Kost Aulia">
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
            <a href="#profil-penghuni">Profil</a>
            <Link href="/ulasan">Ulasan</Link>
          </nav>

          <div className={styles.headerActions}>
            <Link href="/" className={styles.backButton}>
              Kembali ke Beranda Publik
            </Link>

            {/* NOTIFIKASI LONCENG */}
            <div className={styles.iconDropdownWrap}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileMenuOpen(false);
                }}
                aria-label="Notifikasi"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {(isMenunggu || isDitolak) && <span className={styles.notifDot} />}
              </button>

              {notifOpen && (
                <div className={styles.popoverCard}>
                  <strong>Notifikasi Tagihan</strong>
                  <p>
                    {isLunas
                      ? "Pembayaran sewa bulan ini telah diverifikasi dan lunas."
                      : isDitolak
                      ? `Verifikasi gagal${
                          pembayaran?.catatan_pemilik
                            ? `: ${pembayaran.catatan_pemilik}`
                            : ". Silakan unggah ulang bukti transfer yang valid."
                        }`
                      : isMenunggu
                      ? "Bukti pembayaran sedang menunggu verifikasi oleh pemilik kost."
                      : "Segera lakukan pembayaran sewa dan unggah bukti transfer."}
                  </p>
                </div>
              )}
            </div>

            {/* AVATAR PROFIL */}
            <div className={styles.iconDropdownWrap}>
              <button
                type="button"
                className={styles.avatarBtn}
                onClick={() => {
                  setProfileMenuOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                aria-label="Menu Akun"
              >
                <Icon name="user" size={20} />
              </button>

              {profileMenuOpen && (
                <div className={styles.popoverCard}>
                  <strong>{profil?.nama || "Penghuni"}</strong>
                  <span>{profil?.gmail || ""}</span>
                  <hr />
                  <button
                    type="button"
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                  >
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN SPLIT SECTION */}
      <main className={styles.mainSplit}>
        {/* SISI KIRI: GAMBAR & SAPAAN */}
        <section className={styles.leftHero}>
          <Image
            src="/image/kost-tampak-luar.png"
            alt="Tampak depan Kost Aulia"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 45vw"
            className={styles.heroBg}
          />
          <div className={styles.heroOverlay} />

          <div className={styles.heroTextWrap}>
            <h1>
              Selamat
              <br />
              Datang
            </h1>
            <p>di Kost Pilihan Terbaikmu.</p>
          </div>
        </section>

        {/* SISI KANAN: KARTU INFORMASI PENGHUNI */}
        <section className={styles.rightDashboard}>
          <div className={styles.decorCircleTop} aria-hidden="true" />
          <div className={styles.decorCircleBottom} aria-hidden="true" />

          <div className={styles.cardsContainer}>
            {error && (
              <div className={styles.errorBanner} role="alert">
                <span>{error}</span>
                <button type="button" onClick={muatDashboard}>
                  Muat Ulang
                </button>
              </div>
            )}

            {/* KARTU 1: NAMA PENGHUNI */}
            <article id="profil-penghuni" className={styles.card}>
              <div className={styles.profileRow}>
                <div className={styles.profileAvatar}>
                  <Icon name="user" size={38} />
                </div>
                <div className={styles.profileInfo}>
                  <h2>{loading ? "Memuat..." : profil?.nama || "Nama Penghuni"}</h2>
                  <p>{profil?.gmail || "akunpenghuni@gmail.com"}</p>
                  <p>{profil?.no_telp || "-"}</p>
                </div>
              </div>
            </article>

            {/* KARTU 2: DETAIL HUNIAN */}
            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Detail Hunian</h3>
              <p className={styles.cardSubtitle}>Jl. Mawar No.14 Bp.Wetan, Gresik</p>

              <div className={styles.hunianGrid}>
                <div className={styles.hunianSubBox}>
                  <span>Nomor Kamar</span>
                  <strong>{loading ? "..." : hunian?.nomor_kamar ?? "-"}</strong>
                </div>

                <div className={styles.hunianSubBox}>
                  <span>Tanggal Masuk</span>
                  <strong>
                    {loading ? "..." : formatTanggalMasuk(hunian?.tanggal_masuk)}
                  </strong>
                </div>
              </div>

              <div className={styles.hunianPriceBox}>
                <span>Tarif Sewa</span>
                <div className={styles.priceLine}>
                  <strong>
                    {loading
                      ? "Memuat..."
                      : formatRupiah(hunian?.harga_sewa ?? hunian?.harga_kamar)}
                  </strong>
                  <span>/bulan</span>
                </div>
              </div>
            </article>

            {/* KARTU 3: TAGIHAN (3 VARIASI STATUS) */}
            <article className={styles.card}>
              <h3 className={styles.cardTitle}>Tagihan</h3>

              {/* KOTAK STATUS NOMINAL / LUNAS */}
              <div
                className={`${styles.tagihanStatusBox} ${
                  isLunas ? styles.boxLunas : styles.boxBelumLunas
                }`}
              >
                <span>Total Tagihan yang belum Dibayar</span>
                <strong>
                  {loading
                    ? "Memuat..."
                    : isLunas
                    ? "Tagihan Lunas"
                    : formatRupiah(nominalTagihan)}
                </strong>
              </div>

              {/* INFORMASI REKENING TRANSFER */}
              <div className={styles.bankBox}>
                <p className={styles.bankHeading}>Lakukan Pembayaran Melalui Transfer</p>
                <div className={styles.bankGrid}>
                  <span>Nama Bank</span>
                  <span>: Bank Mandiri</span>

                  <span>Atas Nama</span>
                  <span>: Bapak Tsabita</span>

                  <span>No. Rekening</span>
                  <span className={styles.rekeningRow}>
                    : {NO_REKENING}
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={handleCopyRekening}
                      title="Salin nomor rekening"
                      aria-label="Salin nomor rekening"
                    >
                      {copied ? (
                        <span className={styles.copiedLabel}>Tersalin!</span>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          width="15"
                          height="15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </span>
                </div>
              </div>

              {/* AREA UPLOAD BUKTI TRANSFER */}
              <div className={styles.uploadSection}>
                <p className={styles.uploadTitle}>Sudah Melakukan Pembayaran?</p>
                <span className={styles.uploadHint}>
                  Upload bukti transfer pada kolom dibawah ini
                </span>

                <div
                  className={`${styles.dropzoneOuter} ${
                    dragActive ? styles.dropzoneActive : ""
                  }`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className={styles.dropzoneInner}>
                    <svg
                      viewBox="0 0 24 24"
                      width="28"
                      height="28"
                      fill="none"
                      stroke="#1677ff"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>

                    <p className={styles.dropMainText}>
                      {uploading
                        ? "Sedang mengunggah bukti..."
                        : "Click or drag file to this area to upload"}
                    </p>
                    <span className={styles.dropSubText}>
                      Support for a single or bulk upload.
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className={styles.hiddenFileInput}
                    disabled={uploading}
                  />
                </div>

                {uploadMsg.text && (
                  <p
                    className={
                      uploadMsg.type === "error"
                        ? styles.uploadFeedbackError
                        : styles.uploadFeedbackSuccess
                    }
                  >
                    {uploadMsg.text}
                  </p>
                )}

                {pembayaran?.bukti_pembayaran && (
                  <a
                    href={pembayaran.bukti_pembayaran}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.lihatBuktiLink}
                  >
                    Lihat bukti transfer terakhir ↗
                  </a>
                )}
              </div>

              {/* STATUS VERIFIKASI OLEH PEMILIK */}
              <div className={styles.verifikasiBox}>
                <span>Status Verifikasi Oleh Pemilik :</span>
                <strong className={statusVerifikasiClass}>
                  {loading ? "Memuat..." : statusVerifikasiText}
                </strong>
                {isDitolak && pembayaran?.catatan_pemilik && (
                  <p className={styles.catatanPemilik}>
                    Catatan: {pembayaran.catatan_pemilik}
                  </p>
                )}
              </div>
            </article>

            {/* KARTU 4: KONTAK PEMILIK */}
            <article className={`${styles.card} ${styles.kontakCard}`}>
              <h3 className={styles.kontakTitle}>Kontak Pemilik</h3>
              <a
                href={WA_PEMILIK}
                target="_blank"
                rel="noreferrer"
                className={styles.waButton}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.02.9 2.17.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.14-.3.3-.13.59.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.65-.14.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.69-.17 1.37Z" />
                </svg>
                WhatsApp
              </a>
            </article>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link href="/penghuni" className={styles.footerLogoCircle}>
              <Image
                src="/image/logo-kost-aulia.png"
                alt="Logo Kost Aulia"
                width={137}
                height={81}
                className={styles.footerLogo}
              />
            </Link>
            <p>
              Kost khusus putri yang terletak di pusat kota Gresik dengan
              fasilitas lengkap, untuk hidup yang lebih tenang.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h4>LINK</h4>
            <a href="#profil-penghuni">Profil</a>
            <Link href="/ulasan">Ulasan</Link>
          </div>

          <div className={styles.footerColumn}>
            <h4>KONTAK</h4>
            <a href={WA_PEMILIK} target="_blank" rel="noreferrer">
              0812 - 5921 - 5140
            </a>

            <div className={styles.socialLinks}>
              <a
                href="https://instagram.com/itsaulia.kost"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Kost Aulia"
              >
                <Icon name="instagram" size={18} />
              </a>
              <a
                href="https://tiktok.com/@auliakost.gresik"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok Kost Aulia"
              >
                <Icon name="tiktok" size={18} />
              </a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h4>LOKASI</h4>
            <p>
              Jl. Mawar No.14
              <br />
              Bp.Wetan, Gresik
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}