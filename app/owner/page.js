
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

// ==========================================
// HELPER
// ==========================================

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

function nomorKamarData(room) {
  return Number(
    room?.nomor_kamar ??
      room?.nomor ??
      room?.no_kamar ??
      room?.room_number ??
      room?.number
  );
}

// ==========================================
// DASHBOARD OWNER
// ==========================================

export default function OwnerDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ringkasan, setRingkasan] = useState(null);
  const [daftarKamar, setDaftarKamar] = useState([]);
  const [dataOwner, setDataOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [preview, setPreview] = useState({});
  const [pesan, setPesan] = useState("");
  const [fotoTambahan, setFotoTambahan] = useState([]);
  const [fotoGalat, setFotoGalat] = useState("");

  const [tagihanOpen, setTagihanOpen] = useState(false);
  const [hoverKamar, setHoverKamar] = useState(null);

  const [profilOpen, setProfilOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // ========================================
  // AMBIL DATA DATABASE
  // ========================================

  async function muatData() {
    try {
      setLoading(true);
      setError("");

      const [
        dataRingkasan,
        dataKamar,
        monitoringOwner,
      ] = await Promise.all([
        ambilJson("/api/rooms/ringkasan"),
        ambilJson("/api/rooms"),
        ambilJson("/api/owner/monitoring"),
      ]);

      if (
        !Array.isArray(dataRingkasan?.per_tipe) ||
        !Array.isArray(dataKamar) ||
        monitoringOwner?.success !== true ||
        !Array.isArray(monitoringOwner?.kamar) ||
        !Array.isArray(monitoringOwner?.tagihan)
      ) {
        throw new Error(
          "Format respons monitoring tidak sesuai."
        );
      }

      setRingkasan(dataRingkasan);
      setDaftarKamar(dataKamar);
      setDataOwner(monitoringOwner);
    } catch (err) {
      console.error("Owner dashboard:", err);

      setError(
        err.message || "Gagal memuat data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  // ========================================
  // KUNCI SCROLL SAAT MODAL TERBUKA
  // ========================================

  useEffect(() => {
    if (
      !menuOpen &&
      !tagihanOpen &&
      !editId &&
      !profilOpen
    ) {
      return;
    }

    const old = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setTagihanOpen(false);
        setProfilOpen(false);
        setSelectedRoom(null);

        if (editId) {
          batalEdit();
        }
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = old;

      window.removeEventListener(
        "keydown",
        onEsc
      );
    };
  }, [
    menuOpen,
    tagihanOpen,
    editId,
    profilOpen,
  ]);

  // ========================================
  // DATA MONITORING
  // ========================================

  const total = Number(
    ringkasan?.total_kamar ?? 0
  );

  const tersedia = Number(
    ringkasan?.kamar_tersedia ?? 0
  );

  const terisi = Number(
    ringkasan?.kamar_terisi ?? 0
  );

  const dipesan = Number(
    ringkasan?.kamar_dipesan ?? 0
  );

  const tagihanBelumLunas =
    dataOwner?.tagihan ?? [];

  const jumlahBelumBayar = Number(
    dataOwner?.ringkasan_tagihan
      ?.jumlah_belum_bayar ?? 0
  );

  const jumlahMenunggu = Number(
    dataOwner?.ringkasan_tagihan
      ?.jumlah_menunggu_verifikasi ?? 0
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

  // ========================================
  // INFORMASI TIPE KAMAR
  // ========================================

  function informasiTipe(id) {
    const perTipe =
      ringkasan?.per_tipe?.find(
        (item) => item.tipe === id
      );

    const kamarSesuai = daftarKamar.filter(
      (item) => item.tipe === id
    );

    const hargaList = kamarSesuai
      .map((item) => Number(item.harga))
      .filter(
        (harga) =>
          Number.isFinite(harga) && harga > 0
      );

    return {
      harga: hargaList.length
        ? Math.min(...hargaList)
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

  // ========================================
  // EDIT TIPE KAMAR
  // ========================================

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
    setDraft((old) => ({
      ...old,
      [field]: value,
    }));
  }

  function ubahFasilitas(index, value) {
    setDraft((old) => {
      const arr = [...old.fasilitas];
      arr[index] = value;

      return {
        ...old,
        fasilitas: arr,
      };
    });
  }

  function tambahFasilitas() {
    setDraft((old) => ({
      ...old,
      fasilitas: [...old.fasilitas, ""],
    }));
  }

  function hapusFasilitas(index) {
    setDraft((old) => ({
      ...old,
      fasilitas: old.fasilitas.filter(
        (_, i) => i !== index
      ),
    }));
  }

  function simpanPratinjau(e) {
    e.preventDefault();

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
      setPesan(
        "Nama tipe kamar wajib diisi."
      );
      return;
    }

    const hasil = {
      nama: draft.nama.trim(),
      deskripsi: draft.deskripsi.trim(),
      harga,
      foto: draft.foto,
      fasilitas: draft.fasilitas
        .map((x) => x.trim())
        .filter(Boolean),
    };

    setPreview((old) => ({
      ...old,
      [editId]: hasil,
    }));

    setEditId(null);
    setDraft(null);

    setPesan(
      "Pratinjau berhasil diperbarui. Perubahan belum disimpan ke database atau website publik."
    );
  }

  // ========================================
  // BATAL EDIT
  // ========================================

  function batalEdit() {
    setEditId(null);
    setDraft(null);
    setPesan("");
  }

  // ========================================
  // PILIH FOTO KAMAR
  // ========================================

  function pilihFotoKamar(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPesan("Pilih file gambar.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPesan("Ukuran foto maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        ubahDraft("foto", reader.result);
      }
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // ========================================
  // TAMBAH FOTO GALERI
  // ========================================

  function tambahFotoGaleri(e) {
    const files = Array.from(
      e.target.files || []
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
        if (typeof reader.result === "string") {
          setFotoTambahan((old) => [
            ...old,
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

    e.target.value = "";
  }

  function hapusFotoTambahan(id) {
    setFotoTambahan((old) =>
      old.filter((item) => item.id !== id)
    );
  }

  // ========================================
  // DATA PINTU KAMAR
  // ========================================

  const dataPintuKamar = daftarKamar
    .map((room) => {
      const nomor = nomorKamarData(room);

      const profil = dataOwner?.kamar?.find(
        (item) =>
          Number(item.id_kamar) ===
          Number(room.id)
      );

      return {
        nomor,
        data: room,
        profil,
        status: room.status,
        terisi: room.status === "terisi",
        dipesan: room.status === "dipesan",
      };
    })
    .sort((a, b) => a.nomor - b.nomor);

  const kamarDipilih = dataPintuKamar.find(
    (room) => room.nomor === selectedRoom
  );

  const penghuniTerpilih =
    kamarDipilih?.profil;

  // ========================================
  // NAVIGASI HEADER
  // ========================================

  const navLinks = (
    <>
      <Link
        href="/owner"
        aria-current="page"
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
        href="/ulasan"
        onClick={() => setMenuOpen(false)}
      >
        Ulasan
      </Link>
    </>
  );

  // ========================================
  // TAMPILAN DASHBOARD OWNER
  // ========================================

  return (
    <div className={styles.page}>
      {/* HEADER */}
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
            {navLinks}
          </nav>

          <Link
            href="/"
            className={styles.backButton}
          >
            Beranda Publik{" "}
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

      {/* MENU MOBILE */}
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
            >
              ×
            </button>
          </div>

          <h2>Menu Pemilik</h2>

          {navLinks}

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
            Jl. Mawar No.14, Bp. Wetan, Gresik
          </p>

          <a href={WA}>
            0812 - 5921 - 5140
          </a>
        </div>
      </aside>

      {/* HERO DASHBOARD */}
      <main>
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
              OWNER DASHBOARD
              <br />
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

            {/* KARTU RINGKASAN */}
            <div className={styles.summaryGrid}>
              {/* MONITORING KAMAR */}
              <article className={styles.summaryCard}>
                <h2>Monitoring Kamar</h2>

                <div className={styles.monitorBox}>
                  <div className={styles.monitorHeader}>
                    <span>
                      <svg
                        className={styles.lineIcon}
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <path d="M5 23V10m0 8h21v5M8 13h7a4 4 0 0 1 4 4v1H8zM5 25h23" />
                        <path d="M8 10h7" />
                      </svg>
                      Okupansi Kamar
                    </span>

                    <strong>
                      {loading
                        ? "Memuat..."
                        : `${terisi} / ${total} Terisi`}
                    </strong>
                  </div>

                  <div
                    className={styles.monitorProgress}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={okupansi}
                  >
                    <div
                      className={styles.monitorProgressFill}
                      style={{
                        width: `${okupansi}%`,
                      }}
                    />
                  </div>

                  <div className={styles.monitorFooter}>
                    <span>
                      {tersedia} tersedia · {dipesan} dipesan
                    </span>
                    <span>{okupansi}% terisi</span>
                  </div>
                </div>
              </article>

              {/* TAGIHAN */}
              <article className={styles.summaryCard}>
                <h2>Tagihan</h2>

                <div className={styles.billBox}>
                  <div className={styles.billContent}>
                    <span>
                      Belum Bayar · {jumlahMenunggu} menunggu verifikasi
                    </span>

                    <div className={styles.billMain}>
                      <svg
                        className={`${styles.lineIcon} ${styles.billLineIcon}`}
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <path d="M6 5h20v22H6zM10 10h12M10 15h12M10 20h12" />
                      </svg>

                      <strong>
                        {loading
                          ? "Memuat..."
                          : `${jumlahBelumBayar} Tagihan`}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.billButton}
                    onClick={() => setTagihanOpen(true)}
                  >
                    Lihat Detail
                    <span>⟶</span>
                  </button>
                </div>
              </article>
            </div>

            {/* TOMBOL PROFIL PENGHUNI */}
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.heroButton}
                onClick={() => {
                  setProfilOpen(true);
                  setSelectedRoom(null);
                }}
              >
                Lihat Profil Penghuni
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* INFORMASI KAMAR */}
        <section className={styles.mainSection}>
          <div className={styles.contentInner}>
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
                  Kelola informasi harga, deskripsi, foto,
                  dan fasilitas kamar Kost Aulia.
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
                  const info = informasiTipe(tipe.id);
                  const perubahan = preview[tipe.id] || {};

                  const nama =
                    perubahan.nama || tipe.nama;

                  const deskripsi =
                    perubahan.deskripsi ?? tipe.deskripsi;

                  const foto =
                    perubahan.foto || tipe.foto;

                  const harga =
                    perubahan.harga ?? info.harga;

                  const fasilitas =
                    perubahan.fasilitas ?? tipe.fasilitas;

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
                            <span className={styles.roomLabel}>
                              KOST AULIA
                            </span>

                            <h3>{nama}</h3>
                          </div>

                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={() => bukaEdit(tipe)}
                          >
                            ✎ Edit
                          </button>
                        </div>

                        <p className={styles.roomDescription}>
                          {deskripsi}
                        </p>

                        <div className={styles.priceBox}>
                          <span>Tarif Sewa / Bulan</span>

                          <strong>
                            {formatRupiah(harga)}
                          </strong>
                        </div>

                        {perubahan.harga !== undefined && (
                          <span className={styles.previewBadge}>
                            Pratinjau lokal
                          </span>
                        )}

                        <div className={styles.roomMeta}>
                          <span>
                            Tersedia:{" "}
                            <strong>
                              {info.tersedia ?? "—"}
                            </strong>
                          </span>

                          <span>
                            Total:{" "}
                            <strong>
                              {info.total ?? "—"}
                            </strong>
                          </span>
                        </div>

                        <div className={styles.facilityBlock}>
                          <h4>Fasilitas Kamar</h4>

                          <ul>
                            {fasilitas.map((item, index) => (
                              <li key={`${item}-${index}`}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* GALERI */}
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
                  Dokumentasi fasilitas dan lingkungan
                  Kost Aulia.
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

                    <div className={styles.galleryCardBottom}>
                      <span>{item.nama}</span>

                      <button
                        type="button"
                        onClick={() =>
                          hapusFotoTambahan(item.id)
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
                  Foto tambahan masih berupa pratinjau
                  lokal dan belum diunggah ke server.
                </p>

                {fotoGalat && (
                  <p role="alert">{fotoGalat}</p>
                )}
              </div>
            </section>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <Link href="/owner">
                <Image
                  src="/image/logo-kost-aulia.png"
                  alt="Logo Kost Aulia"
                  width={137}
                  height={81}
                  className={styles.logo}
                />
              </Link>

              <p>
                Kost khusus putri yang terletak di pusat kota
                Gresik dengan fasilitas lengkap untuk hidup
                yang lebih tenang.
              </p>
            </div>

            <div className={styles.footerColumn}>
              <h4>LINK</h4>
              <Link href="/owner">Beranda Owner</Link>
              <Link href="/owner/invitation-codes">
                Kode Undangan
              </Link>
              <Link href="/">Beranda Publik</Link>
              <Link href="/facilities">Fasilitas</Link>
            </div>

            <div className={styles.footerColumn}>
              <h4>KONTAK</h4>
              <a href={WA}>0812 - 5921 - 5140</a>

              <div className={styles.socialLinks}>
                <a
                  href="https://instagram.com/itsaulia.kost"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram Kost Aulia"
                >
                  <Icon name="instagram" size={20} />
                </a>
                <a
                  href="https://tiktok.com/@auliakost.gresik"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok Kost Aulia"
                >
                  <Icon name="tiktok" size={20} />
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
              <a href={MAPS} target="_blank" rel="noreferrer">
                Lihat di Google Maps ↗
              </a>
            </div>
          </div>

          <div className={styles.footerBottom}>
            © Kost Aulia — Panel Pemilik
          </div>
        </footer>
      </main>

      {/* ================================== */}
      {/* MODAL EDIT TIPE KAMAR */}
      {/* ================================== */}

      {editId && draft && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              batalEdit();
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  PENGELOLAAN KAMAR
                </span>
                <h2 id="edit-title">
                  Edit {draft.nama}
                </h2>
              </div>

              <button
                type="button"
                onClick={batalEdit}
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={simpanPratinjau}
              className={styles.editForm}
            >
              <label>
                Nama Tipe Kamar
                <input
                  type="text"
                  value={draft.nama}
                  onChange={(e) =>
                    ubahDraft("nama", e.target.value)
                  }
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Harga Sewa per Bulan
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={draft.harga}
                  onChange={(e) =>
                    ubahDraft("harga", e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Deskripsi
                <textarea
                  rows={4}
                  value={draft.deskripsi}
                  onChange={(e) =>
                    ubahDraft("deskripsi", e.target.value)
                  }
                />
              </label>

              <div className={styles.editPhoto}>
                <span>Foto Tipe Kamar</span>

                {draft.foto?.startsWith("data:") ? (
                  <img
                    src={draft.foto}
                    alt="Pratinjau foto kamar"
                    className={styles.editPreviewImage}
                  />
                ) : (
                  <Image
                    src={draft.foto}
                    alt="Foto kamar"
                    width={400}
                    height={250}
                    className={styles.editPreviewImage}
                  />
                )}

                <label className={styles.uploadButton}>
                  Ganti Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={pilihFotoKamar}
                    className={styles.hiddenInput}
                  />
                </label>
              </div>

              <div className={styles.editFacilities}>
                <div className={styles.facilityEditHeader}>
                  <strong>Daftar Fasilitas</strong>

                  <button
                    type="button"
                    onClick={tambahFasilitas}
                  >
                    + Tambah Fasilitas
                  </button>
                </div>

                {draft.fasilitas.map((item, index) => (
                  <div
                    className={styles.facilityEditRow}
                    key={index}
                  >
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        ubahFasilitas(index, e.target.value)
                      }
                      placeholder="Nama fasilitas"
                    />

                    <button
                      type="button"
                      onClick={() => hapusFasilitas(index)}
                      aria-label="Hapus fasilitas"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {pesan && (
                <p className={styles.formMessage} role="alert">
                  {pesan}
                </p>
              )}

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={batalEdit}
                >
                  Batal
                </button>

                <button type="submit">
                  Simpan Pratinjau
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ================================== */}
      {/* MODAL TAGIHAN */}
      {/* ================================== */}

      {tagihanOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setTagihanOpen(false);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tagihan-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  KEUANGAN
                </span>
                <h2 id="tagihan-title">
                  Daftar Tagihan
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setTagihanOpen(false)}
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <div className={styles.billSummary}>
              <div>
                <span>Belum Bayar</span>
                <strong>{jumlahBelumBayar}</strong>
              </div>

              <div>
                <span>Menunggu Verifikasi</span>
                <strong>{jumlahMenunggu}</strong>
              </div>
            </div>

            {loading ? (
              <p>Memuat data tagihan...</p>
            ) : tagihanBelumLunas.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>Tidak ada tagihan tertunda</h3>
                <p>
                  Semua tagihan yang tercatat sudah tidak
                  memiliki status tertunda.
                </p>
              </div>
            ) : (
              <div className={styles.billList}>
                {tagihanBelumLunas.map((item) => (
                  <article
                    key={item.id_tagihan}
                    className={styles.billItem}
                  >
                    <div>
                      <strong>{item.nama_penghuni}</strong>

                      <span>
                        Kamar {item.nomor_kamar}
                      </span>

                      <span>
                        Jatuh tempo: {item.tanggal_jatuh_tempo}
                      </span>

                      <span>
                        Periode: {item.periode_mulai} –{" "}
                        {item.periode_selesai}
                      </span>
                    </div>

                    <div className={styles.billItemRight}>
                      <strong>
                        {formatRupiah(item.nominal)}
                      </strong>

                      <span
                        className={
                          item.status_tagihan ===
                          "menunggu_verifikasi"
                            ? styles.statusWaiting
                            : styles.statusUnpaid
                        }
                      >
                        {item.status_tagihan ===
                        "menunggu_verifikasi"
                          ? "Menunggu Verifikasi"
                          : "Belum Bayar"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setTagihanOpen(false)}
              >
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ================================== */}
      {/* MODAL PROFIL PENGHUNI */}
      {/* ================================== */}

      {profilOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setProfilOpen(false);
              setSelectedRoom(null);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profil-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.sectionEyebrow}>
                  DATA PENGHUNI
                </span>
                <h2 id="profil-title">
                  Profil Penghuni
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfilOpen(false);
                  setSelectedRoom(null);
                }}
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <p className={styles.modalDescription}>
              Pilih nomor kamar untuk melihat informasi
              penempatan dan penghuni.
            </p>

            <div className={styles.roomDoorGrid}>
              {dataPintuKamar.map((room) => (
                <button
                  key={room.data.id}
                  type="button"
                  className={`${styles.roomDoor} ${
                    room.status === "terisi"
                      ? styles.roomDoorOccupied
                      : room.status === "dipesan"
                      ? styles.roomDoorReserved
                      : styles.roomDoorEmpty
                  } ${
                    selectedRoom === room.nomor
                      ? styles.roomDoorSelected
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedRoom(room.nomor)
                  }
                >
                  <span>KAMAR</span>
                  <strong>{room.nomor}</strong>

                  <small>
                    {room.status === "terisi"
                      ? "Terisi"
                      : room.status === "dipesan"
                      ? "Dipesan"
                      : "Kosong"}
                  </small>
                </button>
              ))}
            </div>

            {selectedRoom !== null && (
              <div className={styles.occupantDetail}>
                <h3>
                  Detail Kamar {selectedRoom}
                </h3>

                {penghuniTerpilih?.nama_penghuni ? (
                  <>
                    <div className={styles.occupantRow}>
                      <span>Nama Penghuni</span>
                      <strong>
                        {penghuniTerpilih.nama_penghuni}
                      </strong>
                    </div>

                    <div className={styles.occupantRow}>
                      <span>Email</span>
                      <strong>
                        {penghuniTerpilih.gmail || "—"}
                      </strong>
                    </div>

                    <div className={styles.occupantRow}>
                      <span>Nomor Telepon</span>
                      <strong>
                        {penghuniTerpilih.no_telp || "—"}
                      </strong>
                    </div>

                    <div className={styles.occupantRow}>
                      <span>Tanggal Masuk</span>
                      <strong>
                        {penghuniTerpilih.tanggal_masuk || "—"}
                      </strong>
                    </div>

                    <div className={styles.occupantRow}>
                      <span>Tanggal Keluar</span>
                      <strong>
                        {penghuniTerpilih.tanggal_keluar ||
                          "Belum ditentukan"}
                      </strong>
                    </div>
                  </>
                ) : kamarDipilih?.dipesan ? (
                  <p>
                    Kamar ini sudah dipesan, tetapi penghuni
                    belum memasuki tanggal mulai sewa.
                  </p>
                ) : (
                  <p>
                    Kamar ini belum memiliki penghuni.
                  </p>
                )}
              </div>
            )}

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setProfilOpen(false);
                  setSelectedRoom(null);
                }}
              >
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
