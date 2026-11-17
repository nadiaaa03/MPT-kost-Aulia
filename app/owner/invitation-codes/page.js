
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

function CopyIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="13" height="13" rx="1.5" />
      <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M5.6 9a7 7 0 0 1 11.55-2.6L20 12" />
      <path d="M4 12l2.85 5.6A7 7 0 0 0 18.4 15" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function InvitationCodesPage() {
  const [codes, setCodes] = useState([]);
  const [method, setMethod] = useState("manual");
  const [manualCode, setManualCode] = useState("");
  const [namaPenghuni, setNamaPenghuni] = useState("");
  const [nomorKamar, setNomorKamar] = useState("");
  const [tanggalMasuk, setTanggalMasuk] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmCode, setConfirmCode] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Mengambil daftar kode undangan dari database
  async function loadCodes() {
    setRefreshing(true);

    try {
      const response = await fetch("/api/owner/invitation-codes");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil kode.");
      }

      setCodes(result.data || []);
    } catch (error) {
      setMessage(error.message || "Gagal mengambil kode.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCodes();
  }, []);

  // Membuat kode undangan
  function generateCode() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let generated = "AULIA";

    for (let i = 0; i < 5; i++) {
      generated += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    setManualCode(generated);
  }

  // Mengubah metode pembuatan kode
  function handleMethodChange(e) {
    const selectedMethod = e.target.value;

    setMethod(selectedMethod);

    if (selectedMethod === "otomatis") {
      generateCode();
    } else {
      setManualCode("");
    }

    setMessage("");
  }

  // Membuat dan menyimpan kode ke database
  async function createCode(e) {
    e.preventDefault();

    if (!namaPenghuni.trim() || !nomorKamar || !tanggalMasuk) {
      setMessage(
        "Nama penghuni, nomor kamar, dan tanggal masuk wajib diisi."
      );
      return;
    }

    if (
      !Number.isInteger(Number(nomorKamar)) ||
      Number(nomorKamar) < 1 ||
      Number(nomorKamar) > 15
    ) {
      setMessage("Nomor kamar harus berupa angka dari 1 sampai 15.");
      return;
    }

    if (!manualCode.trim()) {
      setMessage("Silakan buat atau generate kode undangan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/owner/invitation-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          metode: method,
          kode_unik: manualCode,
          nama_penghuni: namaPenghuni,
          nomor_kamar: nomorKamar,
          tanggal_masuk: tanggalMasuk,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat kode.");
      }

      const createdCode = result.data?.kode_unik;

      setMessage(
        createdCode
          ? `Kode ${createdCode} berhasil dibuat.`
          : "Kode undangan berhasil dibuat."
      );

      setManualCode("");
      setNamaPenghuni("");
      setNomorKamar("");
      setTanggalMasuk("");
      setMethod("manual");

      await loadCodes();
    } catch (error) {
      setMessage(error.message || "Gagal membuat kode.");
    } finally {
      setLoading(false);
    }
  }

  // Mengaktifkan atau menonaktifkan kode
  async function updateStatus(id, status) {
    setUpdating(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/owner/invitation-codes/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status.");
      }

      setMessage(result.message || "Status kode berhasil diperbarui.");
      setConfirmCode(null);

      await loadCodes();
    } catch (error) {
      setMessage(error.message || "Gagal mengubah status.");
    } finally {
      setUpdating(false);
    }
  }

  // Menyalin kode undangan
  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(`Kode ${code} berhasil disalin.`);
    } catch {
      setMessage("Gagal menyalin kode. Silakan salin secara manual.");
    }
  }

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          <img
            src="/image/logo-kost-aulia.png"
            alt="Logo Kost Aulia"
            className={styles.logo}
          />
        </Link>

        <nav className={styles.navigation}>
          <Link
            href="/owner/invitation-codes"
            className={`${styles.navLink} ${styles.activeLink}`}
          >
            Kode Undangan
          </Link>

          <Link href="/owner/facilities" className={styles.navLink}>
            Fasilitas
          </Link>

          <Link href="/owner/prices" className={styles.navLink}>
            Harga
          </Link>

          <Link href="/owner/reviews" className={styles.navLink}>
            Ulasan
          </Link>

          <Link href="/owner/payments" className={styles.navLink}>
            Pembayaran
          </Link>
        </nav>

        <div className={styles.headerRight}>
          <Link href="/" className={styles.backHomeButton}>
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* HERO DAN FORM */}
      <section className={styles.heroSection}>
        <div className={styles.heroImage}>
          <div className={styles.heroOverlay}>
            <div className={styles.heroText}>
              <h1>
                Manajemen
                <br />
                Kode
                <br />
                Undangan
              </h1>
              <p>Kelola Kode Undangan Penghuni Kost Aulia</p>
            </div>
          </div>
        </div>

        <div className={styles.formArea}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Buat Kode Undangan</h2>

            <form onSubmit={createCode} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="namaPenghuni">Nama Penghuni</label>
                <input
                  id="namaPenghuni"
                  type="text"
                  value={namaPenghuni}
                  onChange={(e) => setNamaPenghuni(e.target.value)}
                  placeholder="Masukkan nama lengkap penghuni"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="nomorKamar">Nomor Kamar</label>
                <input
                  id="nomorKamar"
                  type="number"
                  min="1"
                  max="15"
                  step="1"
                  value={nomorKamar}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (
                      value === "" ||
                      (Number.isInteger(Number(value)) &&
                        Number(value) >= 1 &&
                        Number(value) <= 15)
                    ) {
                      setNomorKamar(value);
                    }
                  }}
                  placeholder="Masukkan nomor kamar (1–15)"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="tanggalMasuk">Tanggal Masuk</label>
                <input
                  id="tanggalMasuk"
                  type="date"
                  value={tanggalMasuk}
                  onChange={(e) => setTanggalMasuk(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="method">Metode Pembuatan</label>
                <select
                  id="method"
                  value={method}
                  onChange={handleMethodChange}
                >
                  <option value="manual">Buat kode sendiri</option>
                  <option value="otomatis">Generate otomatis</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="invitationCode">Kode Undangan</label>

                <div className={styles.codeInputWrapper}>
                  <input
                    id="invitationCode"
                    type="text"
                    value={manualCode}
                    onChange={(e) =>
                      setManualCode(e.target.value.toUpperCase())
                    }
                    placeholder={
                      method === "otomatis"
                        ? "Kode otomatis sudah dibuat"
                        : "Contoh: AULIATES2026"
                    }
                    maxLength={20}
                    required
                    disabled={method === "otomatis"}
                  />

                  <button
                    type="button"
                    className={styles.copyInputButton}
                    onClick={() => manualCode && copyCode(manualCode)}
                    aria-label="Salin kode"
                    disabled={!manualCode}
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>

              <div className={styles.formButtons}>
                <button
                  type="button"
                  onClick={generateCode}
                  className={styles.outlineButton}
                >
                  Generate Ulang
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.primaryButton}
                >
                  {loading ? "Memproses..." : "Buat Kode"}
                </button>
              </div>
            </form>

            {message && (
              <p className={styles.message} role="status">
                {message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* DAFTAR KODE */}
      <section className={styles.listSection}>
        <div className={styles.listContainer}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>Daftar Kode Undangan</h2>

            <button
              type="button"
              onClick={loadCodes}
              disabled={refreshing}
              className={styles.refreshButton}
            >
              <RefreshIcon />
              {refreshing ? "Memuat..." : "Refresh Daftar"}
            </button>
          </div>

          {codes.length === 0 ? (
            <div className={styles.emptyState}>
              Belum ada kode undangan.
            </div>
          ) : (
            <div className={styles.codeList}>
              {codes.map((code) => (
                <article key={code.id_kode} className={styles.codeCard}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.codeText}>{code.kode_unik}</h3>

                    <span
                      className={`${styles.status} ${
                        code.status === "aktif"
                          ? styles.statusActive
                          : code.status === "digunakan"
                          ? styles.statusUsed
                          : styles.statusInactive
                      }`}
                    >
                      {code.status === "aktif"
                        ? "Aktif"
                        : code.status === "digunakan"
                        ? "Digunakan"
                        : "Nonaktif"}
                    </span>
                  </div>

                  <div className={styles.cardInfo}>
                    <p>
                      <span>Nama Penghuni</span>
                      <b>:</b>
                      <span>{code.nama_penghuni || "-"}</span>
                    </p>

                    <p>
                      <span>Nomor Kamar</span>
                      <b>:</b>
                      <span>{code.nomor_kamar || "-"}</span>
                    </p>

                    <p>
                      <span>Tanggal Masuk</span>
                      <b>:</b>
                      <span>
                        {code.tanggal_masuk
                          ? new Date(
                              code.tanggal_masuk
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </p>
                  </div>

                  <div className={styles.cardBottom}>
                    <button
                      type="button"
                      onClick={() => copyCode(code.kode_unik)}
                      className={styles.copyButton}
                    >
                      <CopyIcon />
                      <span>Salin Kode</span>
                    </button>

                    {code.status !== "digunakan" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (code.status === "aktif") {
                            setConfirmCode(code);
                          } else {
                            updateStatus(code.id_kode, "aktif");
                          }
                        }}
                        disabled={updating}
                        className={
                          code.status === "aktif"
                            ? styles.deactivateButton
                            : styles.activateButton
                        }
                      >
                        {code.status === "aktif" ? (
                          <>
                            <BanIcon />
                            Nonaktifkan
                          </>
                        ) : (
                          <>
                            <CheckIcon />
                            Aktifkan
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerAbout}>
            <div className={styles.footerLogoCircle}>
              <img
                src="/image/logo-kost-aulia.png"
                alt="Kost Aulia"
              />
            </div>

            <p>
              Kost khusus putri yang terletak di pusat kota Gresik
              dengan fasilitas lengkap, untuk hidup yang lebih tenang.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h3>LINK</h3>
            <Link href="/">Beranda</Link>
            <Link href="/fasilitas">Fasilitas</Link>
            <Link href="/ulasan">Ulasan</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>KONTAK</h3>
            <a href="tel:081259215140">0812 - 5921 - 5140</a>

            <div className={styles.socialLinks}>
              <a href="#" aria-label="Instagram">◎</a>
              <a href="#" aria-label="TikTok">♪</a>
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

      {/* MODAL KONFIRMASI */}
      {confirmCode && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title" className={styles.modalTitle}>
              Nonaktifkan Kode?
            </h2>

            <p className={styles.modalText}>
              Apakah kamu yakin ingin menonaktifkan kode undangan{" "}
              <strong>{confirmCode.kode_unik}</strong>? Kode ini tidak
              dapat digunakan untuk pendaftaran penghuni selama
              statusnya nonaktif.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setConfirmCode(null)}
                disabled={updating}
                className={styles.cancelButton}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() =>
                  updateStatus(confirmCode.id_kode, "nonaktif")
                }
                disabled={updating}
                className={styles.confirmButton}
              >
                {updating ? "Memproses..." : "Ya, Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
