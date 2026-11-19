
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "../icons";
import styles from "./page.module.css";

const WA = "https://wa.me/6281259215140";

const MAPS =
  "https://www.google.com/maps/search/?api=1&query=Jl.+Mawar+No.14+Bp.+Wetan+Gresik";

const DATA_TIPE = [
  {
    id: "standar",
    nama: "Kamar Tipe Standar",
    foto: "/image/tipe-kamar-standar.png",
    deskripsi:
      "Pilihan kamar nyaman untuk kamu yang menginginkan hunian praktis dengan fasilitas yang menunjang kebutuhan sehari-hari.",
    fasilitas: [
      "Kasur spring bed",
      "Free WiFi",
      "Kamar mandi dalam",
      "TV Digital",
      "Teko listrik/kamar",
      "Lemari baju",
      "Meja dan kursi di dalam kamar",
      "AC",
      "Listrik (token) bulanan",
      "Air PDAM Umbulan Pasuruan",
      "Satu jendela yang mengarah keluar",
    ],
  },
  {
    id: "eksklusif",
    nama: "Kamar Tipe Exclusive",
    foto: "/image/kamar-exclusive.png",
    deskripsi:
      "Pilihan kamar dengan kenyamanan ekstra untuk menemani aktivitas dan waktu istirahatmu.",
    fasilitas: [
      "Kasur spring bed",
      "Free WiFi",
      "Kamar mandi dalam",
      "TV Digital",
      "Teko listrik/kamar",
      "Lemari baju",
      "Meja dan kursi di dalam kamar",
      "AC",
      "Listrik (token) bulanan",
      "Air PDAM Umbulan Pasuruan",
      "Dua jendela yang mengarah keluar",
    ],
  },
];

const GALERI = [
  {
    src: "/image/tipe-kamar-standar.png",
    nama: "Kamar Standar",
  },
  {
    src: "/image/kamar-exclusive.png",
    nama: "Kamar Exclusive",
  },
  {
    src: "/image/dapur-bersama.png",
    nama: "Dapur Bersama",
  },
  {
    src: "/image/parkiran-luas.png",
    nama: "Area Parkir",
  },
];

function formatRupiah(angka) {
  if (
    angka === null ||
    angka === undefined ||
    !Number.isFinite(Number(angka))
  ) {
    return "Belum tersedia";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(angka));
}

async function ambilJson(url) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil data (HTTP ${response.status})`
    );
  }

  return response.json();
}

function salinDataTipe(tipe) {
  return {
    ...tipe,
    fasilitas: [...tipe.fasilitas],
  };
}

export default function OwnerDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [ringkasan, setRingkasan] = useState(null);
  const [daftarKamar, setDaftarKamar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [preview, setPreview] = useState({});
  const [pesan, setPesan] = useState("");

  const [fotoTambahan, setFotoTambahan] = useState([]);
  const [fotoGalat, setFotoGalat] = useState("");

  // ==========================================
  // AMBIL DATA DATABASE
  // ==========================================

  async function muatData() {
    try {
      setLoading(true);
      setError("");

      const [dataRingkasan, dataKamar] =
        await Promise.all([
          ambilJson("/api/rooms/ringkasan"),
          ambilJson("/api/rooms"),
        ]);

      if (
        !Array.isArray(dataRingkasan?.per_tipe) ||
        !Array.isArray(dataKamar)
      ) {
        throw new Error(
          "Format respons API kamar tidak sesuai."
        );
      }

      setRingkasan(dataRingkasan);
      setDaftarKamar(dataKamar);
    } catch (err) {
      console.error("Owner dashboard:", err);
      setError(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  // ==========================================
  // MENU MOBILE
  // ==========================================

  useEffect(() => {
    if (!menuOpen) return;

    const overflowLama =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const tutupEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const tutupResize = () => {
      if (window.innerWidth > 760) {
        setMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      tutupEscape
    );
    window.addEventListener(
      "resize",
      tutupResize
    );

    return () => {
      document.body.style.overflow =
        overflowLama;

      window.removeEventListener(
        "keydown",
        tutupEscape
      );
      window.removeEventListener(
        "resize",
        tutupResize
      );
    };
  }, [menuOpen]);

  // ==========================================
  // HITUNG MONITORING KAMAR
  // ==========================================

  const total = Number(
    ringkasan?.total_kamar ?? 0
  );

  const tersedia = Number(
    ringkasan?.kamar_tersedia ?? 0
  );

  const terisi = Number(
    ringkasan?.kamar_terisi ?? 0
  );

  const okupansi =
    total > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((terisi / total) * 100)
          )
        )
      : 0;

  function informasiTipe(id) {
    const perTipe =
      ringkasan?.per_tipe?.find(
        (item) => item.tipe === id
      );

    const kamarSesuaiTipe =
      daftarKamar.filter(
        (item) => item.tipe === id
      );

    const daftarHarga = kamarSesuaiTipe
      .map((item) => Number(item.harga))
      .filter(
        (harga) =>
          Number.isFinite(harga) && harga > 0
      );

    return {
      harga:
        daftarHarga.length > 0
          ? Math.min(...daftarHarga)
          : null,

      tersedia: perTipe
        ? Number(perTipe.kamar_tersedia)
        : null,

      total: perTipe
        ? Number(perTipe.total_kamar)
        : null,

      terisi: perTipe
        ? Number(perTipe.kamar_terisi)
        : null,
    };
  }

  // ==========================================
  // EDIT DATA (PRATINJAU LOKAL)
  // ==========================================

  function bukaEdit(tipe) {
    const info = informasiTipe(tipe.id);

    setDraft({
      ...salinDataTipe(tipe),
      ...preview[tipe.id],
      fasilitas: [
        ...(preview[tipe.id]?.fasilitas ??
          tipe.fasilitas),
      ],
      harga:
        preview[tipe.id]?.harga ??
        info.harga ??
        "",
    });

    setEditId(tipe.id);
    setPesan("");
  }

  function ubahDraft(field, value) {
    setDraft((lama) => ({
      ...lama,
      [field]: value,
    }));
  }

  function ubahFasilitas(index, value) {
    setDraft((lama) => {
      const fasilitas = [...lama.fasilitas];
      fasilitas[index] = value;

      return {
        ...lama,
        fasilitas,
      };
    });
  }

  function tambahFasilitas() {
    setDraft((lama) => ({
      ...lama,
      fasilitas: [...lama.fasilitas, ""],
    }));
  }

  function hapusFasilitas(index) {
    setDraft((lama) => ({
      ...lama,
      fasilitas: lama.fasilitas.filter(
        (_, i) => i !== index
      ),
    }));
  }

  function simpanPratinjau(event) {
    event.preventDefault();

    if (!draft) return;

    const harga = Number(draft.harga);

    if (
      !Number.isSafeInteger(harga) ||
      harga <= 0
    ) {
      setPesan(
        "Harga harus berupa angka bulat lebih dari nol."
      );
      return;
    }

    if (!draft.nama.trim()) {
      setPesan("Nama tipe kamar wajib diisi.");
      return;
    }

    const hasil = {
      nama: draft.nama.trim(),
      deskripsi: draft.deskripsi.trim(),
      harga,
      foto: draft.foto,
      fasilitas: draft.fasilitas
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setPreview((lama) => ({
      ...lama,
      [editId]: hasil,
    }));

    setEditId(null);
    setDraft(null);

    setPesan(
      "Pratinjau berhasil diperbarui. Perubahan belum disimpan ke database atau website publik."
    );
  }

  function batalEdit() {
    setEditId(null);
    setDraft(null);
    setPesan("");
  }

  // ==========================================
  // PRATINJAU FOTO LOKAL
  // ==========================================

  function pilihFotoKamar(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPesan("Pilih file gambar.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPesan("Ukuran foto maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        ubahDraft("foto", reader.result);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function tambahFotoGaleri(event) {
    const files = Array.from(
      event.target.files || []
    );

    setFotoGalat("");

    const valid = files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    if (valid.length !== files.length) {
      setFotoGalat(
        "Sebagian foto diabaikan. Gunakan gambar maksimal 5 MB."
      );
    }

    valid.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (
          typeof reader.result === "string"
        ) {
          setFotoTambahan((lama) => [
            ...lama,
            {
              id:
                Date.now().toString() +
                Math.random().toString(36),
              src: reader.result,
              nama: file.name,
            },
          ]);
        }
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  }

  function hapusFotoTambahan(id) {
    setFotoTambahan((lama) =>
      lama.filter((item) => item.id !== id)
    );
  }

  return (
    <div className={styles.page}>
      {/* =====================================
          HEADER OWNER
      ===================================== */}

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/owner"
            className={styles.brand}
            aria-label="Beranda Owner Kost Aulia"
          >
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
            <Link
              href="/owner"
              aria-current="page"
            >
              Beranda
            </Link>

            <Link href="/owner/invitation-codes">
              Kode Undangan
            </Link>

            <Link href="#kelola-kamar">
              Kelola Kamar
            </Link>

            <Link href="#galeri">
              Galeri
            </Link>
          </nav>

          <Link
            href="/"
            className={styles.backButton}
          >
            Beranda Publik
            <span aria-hidden="true">↗</span>
          </Link>

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu Owner"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* =====================================
          MENU MOBILE
      ===================================== */}

      {menuOpen && (
        <button
          type="button"
          className={styles.menuOverlay}
          onClick={() => setMenuOpen(false)}
          aria-label="Tutup menu"
        />
      )}

      <aside
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ""
        }`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles.mobileMenuTop}>
          <div className={styles.mobileMenuHead}>
            <Image
              src="/image/logo-kost-aulia.png"
              alt="Kost Aulia"
              width={137}
              height={81}
              className={styles.logo}
            />

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
            >
              ×
            </button>
          </div>

          <h2>Menu Pemilik</h2>

          <Link
            href="/owner"
            onClick={() => setMenuOpen(false)}
          >
            Beranda
          </Link>

          <Link
            href="/owner/invitation-codes"
            onClick={() => setMenuOpen(false)}
          >
            Kode Undangan
          </Link>

          <Link
            href="#kelola-kamar"
            onClick={() => setMenuOpen(false)}
          >
            Kelola Kamar
          </Link>

          <Link
            href="#galeri"
            onClick={() => setMenuOpen(false)}
          >
            Galeri Kost
          </Link>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            Beranda Publik
          </Link>
        </div>

        <div className={styles.mobileMenuBottom}>
          <strong>Kost Aulia Gresik</strong>

          <p>
            Jl. Mawar No.14,
            Bp. Wetan, Gresik
          </p>

          <a href={WA}>
            0812 - 5921 - 5140
          </a>
        </div>
      </aside>

      <main>
        {/* =====================================
            HERO
        ===================================== */}

        <section className={styles.hero}>
          <Image
            src="/image/kost-tampak-luar.png"
            alt="Tampak luar Kost Aulia"
            fill
            priority
            sizes="100vw"
            className={styles.heroBg}
          />

          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              PANEL PEMILIK · KOST AULIA GRESIK
            </span>

            <h1>Manajemen Kost</h1>

            <p className={styles.heroSubtitle}>
              Pantau kamar, kelola informasi hunian,
              dan lihat ringkasan operasional kost.
            </p>

            {error && (
              <div
                className={styles.apiError}
                role="alert"
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={muatData}
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* DUA KOTAK UTAMA */}

            <div className={styles.summaryGrid}>
              {/* MONITORING KAMAR */}

              <article className={styles.summaryCard}>
                <h2>Monitoring Kamar</h2>

                <div className={styles.monitorBox}>
                  <div className={styles.monitorHeader}>
                    <span>
                      <span aria-hidden="true">
                        🛏
                      </span>
                      Okupansi Kamar
                    </span>

                    <strong>
                      {loading
                        ? "Memuat..."
                        : ringkasan
                          ? `${terisi} / ${total} Terisi`
                          : "—"}
                    </strong>
                  </div>

                  <div
                    className={styles.monitorProgress}
                    role="progressbar"
                    aria-label="Okupansi kamar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={okupansi}
                  >
                    <div
                      className={
                        styles.monitorProgressFill
                      }
                      style={{
                        width: `${okupansi}%`,
                      }}
                    />
                  </div>

                  <div className={styles.monitorFooter}>
                    <span>
                      {loading
                        ? "Mengambil data kamar..."
                        : ringkasan
                          ? `${tersedia} kamar tersedia`
                          : "Data belum tersedia"}
                    </span>

                    <span>
                      {ringkasan
                        ? `${okupansi}% terisi`
                        : ""}
                    </span>
                  </div>
                </div>
              </article>

              {/* TAGIHAN */}

              <article className={styles.summaryCard}>
                <h2>Tagihan</h2>

                <div className={styles.billBox}>
                  <div className={styles.billContent}>
                    <span>Belum Bayar</span>

                    <strong>
                      Menunggu Data
                    </strong>

                    <small>
                      Jumlah tagihan belum terhubung
                      ke API pembayaran.
                    </small>
                  </div>
                </div>
              </article>
            </div>

            <div className={styles.heroActions}>
              <Link
                href="/owner/invitation-codes"
                className={styles.heroButton}
              >
                Kelola Kode Undangan
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================
            BAGIAN MANAJEMEN
        ===================================== */}

        <section className={styles.mainSection}>
          <div className={styles.contentInner}>
            <div className={styles.sectionHeading}>
              <span className={styles.sectionEyebrow}>
                MANAJEMEN KOST
              </span>

              <h2>
                Kelola Informasi Hunian
              </h2>

              <p>
                Periksa data kamar dan siapkan
                perubahan informasi kost dengan
                lebih mudah.
              </p>
            </div>

            {/* AKSI CEPAT */}

            <div className={styles.actionGrid}>
              <Link
                href="/owner/invitation-codes"
                className={styles.actionCard}
              >
                <span className={styles.actionNumber}>
                  01
                </span>

                <div>
                  <h3>Kode Undangan</h3>
                  <p>
                    Kelola akses pendaftaran
                    penghuni Kost Aulia.
                  </p>
                </div>

                <span aria-hidden="true">↗</span>
              </Link>

              <a
                href="#kelola-kamar"
                className={styles.actionCard}
              >
                <span className={styles.actionNumber}>
                  02
                </span>

                <div>
                  <h3>Kelola Kamar</h3>
                  <p>
                    Atur pratinjau harga,
                    fasilitas, dan deskripsi.
                  </p>
                </div>

                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="#galeri"
                className={styles.actionCard}
              >
                <span className={styles.actionNumber}>
                  03
                </span>

                <div>
                  <h3>Galeri Kost</h3>
                  <p>
                    Lihat foto dan tambahkan
                    pratinjau gambar baru.
                  </p>
                </div>

                <span aria-hidden="true">↗</span>
              </a>
            </div>

            {/* =====================================
                KELOLA KAMAR
            ===================================== */}

            <section
              id="kelola-kamar"
              className={styles.manageSection}
            >
              <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>
                  INFORMASI KAMAR
                </span>

                <h2>Kelola Tipe Kamar</h2>

                <p>
                  Harga dan ketersediaan awal
                  berasal dari API. Pengeditan
                  di bawah merupakan pratinjau
                  dan belum menyimpan ke database.
                </p>
              </div>

              {pesan && (
                <div
                  className={styles.notice}
                  role="status"
                >
                  {pesan}
                </div>
              )}

              <div className={styles.roomGrid}>
                {DATA_TIPE.map((tipe) => {
                  const info =
                    informasiTipe(tipe.id);

                  const perubahan =
                    preview[tipe.id] || {};

                  const nama =
                    perubahan.nama ||
                    tipe.nama;

                  const deskripsi =
                    perubahan.deskripsi ??
                    tipe.deskripsi;

                  const foto =
                    perubahan.foto ||
                    tipe.foto;

                  const harga =
                    perubahan.harga ??
                    info.harga;

                  const fasilitas =
                    perubahan.fasilitas ??
                    tipe.fasilitas;

                  return (
                    <article
                      key={tipe.id}
                      className={styles.roomCard}
                    >
                      <div className={styles.roomImageWrap}>
                        {foto.startsWith("data:") ? (
                          <img
                            src={foto}
                            alt={nama}
                            className={styles.roomImage}
                          />
                        ) : (
                          <Image
                            src={foto}
                            alt={nama}
                            width={600}
                            height={380}
                            className={styles.roomImage}
                          />
                        )}
                      </div>

                      <div className={styles.roomBody}>
                        <div className={styles.roomHeader}>
                          <div>
                            <span
                              className={styles.roomLabel}
                            >
                              KOST AULIA
                            </span>

                            <h3>{nama}</h3>
                          </div>

                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() =>
                              bukaEdit(tipe)
                            }
                          >
                            ✎ Edit
                          </button>
                        </div>

                        <p
                          className={
                            styles.roomDescription
                          }
                        >
                          {deskripsi}
                        </p>

                        <div className={styles.priceBox}>
                          <span>
                            Tarif Sewa / Bulan
                          </span>

                          <strong>
                            {loading &&
                            harga === null
                              ? "Memuat..."
                              : formatRupiah(harga)}
                          </strong>
                        </div>

                        {perubahan.harga !==
                          undefined && (
                          <span
                            className={
                              styles.previewBadge
                            }
                          >
                            Pratinjau lokal
                          </span>
                        )}

                        <div className={styles.roomMeta}>
                          <span>
                            Tersedia:{" "}
                            <strong>
                              {info.tersedia ??
                                "—"}
                            </strong>
                          </span>

                          <span>
                            Total:{" "}
                            <strong>
                              {info.total ?? "—"}
                            </strong>
                          </span>
                        </div>

                        <div
                          className={
                            styles.facilityBlock
                          }
                        >
                          <h4>
                            Fasilitas Kamar
                          </h4>

                          <ul>
                            {fasilitas.map(
                              (item, index) => (
                                <li
                                  key={
                                    `${item}-${index}`
                                  }
                                >
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* =====================================
                GALERI
            ===================================== */}

            <section
              id="galeri"
              className={styles.gallerySection}
            >
              <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>
                  FOTO KOST
                </span>

                <h2>Galeri Kost Aulia</h2>

                <p>
                  Foto yang sudah tersedia
                  dan pratinjau foto tambahan.
                </p>
              </div>

              <div className={styles.galleryGrid}>
                {GALERI.map((item) => (
                  <div
                    className={styles.galleryCard}
                    key={item.src}
                  >
                    <Image
                      src={item.src}
                      alt={item.nama}
                      width={400}
                      height={280}
                      className={styles.galleryImage}
                    />

                    <span>{item.nama}</span>
                  </div>
                ))}

                {fotoTambahan.map((item) => (
                  <div
                    className={styles.galleryCard}
                    key={item.id}
                  >
                    <img
                      src={item.src}
                      alt={item.nama}
                      className={styles.galleryImage}
                    />

                    <div
                      className={
                        styles.galleryCardBottom
                      }
                    >
                      <span>{item.nama}</span>

                      <button
                        type="button"
                        onClick={() =>
                          hapusFotoTambahan(
                            item.id
                          )
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.galleryActions}>
                <label
                  className={styles.uploadButton}
                  htmlFor="foto-galeri"
                >
                  + Tambahkan Foto
                </label>

                <input
                  id="foto-galeri"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={tambahFotoGaleri}
                  className={styles.hiddenInput}
                />

                <p>
                  Foto tambahan hanya untuk
                  pratinjau lokal. Belum diunggah
                  ke server.
                </p>

                {fotoGalat && (
                  <p role="alert">
                    {fotoGalat}
                  </p>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link
              href="/owner"
              className={styles.footerLogoWrap}
            >
              <Image
                src="/image/logo-kost-aulia.png"
                alt="Logo Kost Aulia"
                width={137}
                height={81}
                className={styles.footerLogo}
              />
            </Link>

            <p>
              Kost khusus putri yang terletak
              di pusat kota Gresik dengan
              fasilitas lengkap, untuk hidup
              yang lebih tenang.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h4>LINK</h4>

            <Link href="/owner">
              Beranda Owner
            </Link>

            <Link href="/owner/invitation-codes">
              Kode Undangan
            </Link>

            <Link href="/">
              Beranda Publik
            </Link>

            <Link href="/facilities">
              Fasilitas
            </Link>
          </div>

          <div className={styles.footerColumn}>
            <h4>KONTAK</h4>

            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
            >
              0812 - 5921 - 5140
            </a>

            <div className={styles.socialLinks}>
              <a
                href="https://instagram.com/itsaulia.kost"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Kost Aulia"
              >
                <Icon
                  name="instagram"
                  size={20}
                />
              </a>

              <a
                href="https://tiktok.com/@auliakost.gresik"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok Kost Aulia"
              >
                <Icon
                  name="tiktok"
                  size={20}
                />
              </a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h4>LOKASI</h4>

            <p>
              Jl. Mawar No.14
              <br />
              Bp. Wetan, Gresik
            </p>

            <a
              href={MAPS}
              target="_blank"
              rel="noreferrer"
            >
              Lihat di Google Maps ↗
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          © Kost Aulia — Panel Pemilik
        </div>
      </footer>

      {/* =====================================
          MODAL EDIT TIPE KAMAR
      ===================================== */}

      {editId && draft && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              batalEdit();
            }
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-edit-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span
                  className={
                    styles.sectionEyebrow
                  }
                >
                  EDIT INFORMASI
                </span>

                <h2 id="modal-edit-title">
                  Edit Tipe Kamar
                </h2>
              </div>

              <button
                type="button"
                className={styles.modalClose}
                onClick={batalEdit}
                aria-label="Tutup editor"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={simpanPratinjau}
              className={styles.editForm}
            >
              <div className={styles.formGroup}>
                <label htmlFor="nama-tipe">
                  Nama Tipe Kamar
                </label>

                <input
                  id="nama-tipe"
                  value={draft.nama}
                  onChange={(event) =>
                    ubahDraft(
                      "nama",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="harga-kamar">
                  Harga Sewa Bulanan (Rp)
                </label>

                <input
                  id="harga-kamar"
                  type="number"
                  min="1"
                  step="1"
                  value={draft.harga}
                  onChange={(event) =>
                    ubahDraft(
                      "harga",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="deskripsi-kamar">
                  Deskripsi Kamar
                </label>

                <textarea
                  id="deskripsi-kamar"
                  rows={4}
                  value={draft.deskripsi}
                  onChange={(event) =>
                    ubahDraft(
                      "deskripsi",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="foto-kamar">
                  Ganti Foto Kamar
                </label>

                <input
                  id="foto-kamar"
                  type="file"
                  accept="image/*"
                  onChange={pilihFotoKamar}
                />

                <p>
                  Foto pilihan hanya digunakan
                  sebagai pratinjau.
                </p>
              </div>

              <div className={styles.formGroup}>
                <div
                  className={
                    styles.facilityEditorHeader
                  }
                >
                  <label>
                    Fasilitas Kamar
                  </label>

                  <button
                    type="button"
                    onClick={tambahFasilitas}
                    className={
                      styles.addFacilityButton
                    }
                  >
                    + Tambah Fasilitas
                  </button>
                </div>

                <div
                  className={styles.facilityInputs}
                >
                  {draft.fasilitas.map(
                    (item, index) => (
                      <div
                        className={
                          styles.facilityInputRow
                        }
                        key={index}
                      >
                        <input
                          value={item}
                          placeholder={`Fasilitas ${
                            index + 1
                          }`}
                          aria-label={`Fasilitas ${
                            index + 1
                          }`}
                          onChange={(event) =>
                            ubahFasilitas(
                              index,
                              event.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            hapusFasilitas(index)
                          }
                          aria-label={`Hapus fasilitas ${
                            index + 1
                          }`}
                        >
                          Hapus
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className={styles.formNotice}>
                Perubahan yang diterapkan hanya
                ditampilkan sementara. Data
                MySQL dan beranda publik belum
                diperbarui.
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={batalEdit}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  Terapkan Pratinjau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
