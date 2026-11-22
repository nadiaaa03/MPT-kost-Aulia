
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "../icons";
import styles from "./page.module.css";

const WA = "https://wa.me/6281259215140";
const MAPS = "https://www.google.com/maps/search/?api=1&query=Jl.+Mawar+No.14+Bp.+Wetan+Gresik";

const DATA_TIPE = [
  {
    id: "standar",
    nama: "Kamar Tipe Standar",
    foto: "/image/tipe-kamar-standar.png",
    deskripsi: "Pilihan kamar nyaman untuk kamu yang menginginkan hunian praktis dengan fasilitas yang menunjang kebutuhan sehari-hari.",
    fasilitas: [
      "Kasur spring bed", "Free WiFi", "Kamar mandi dalam",
      "TV Digital", "Teko listrik/kamar", "Lemari baju",
      "Meja dan kursi di dalam kamar", "AC",
      "Listrik (token) bulanan", "Air PDAM Umbulan Pasuruan",
      "Satu jendela yang mengarah keluar"
    ],
  },
  {
    id: "eksklusif",
    nama: "Kamar Tipe Exclusive",
    foto: "/image/kamar-exclusive.png",
    deskripsi: "Pilihan kamar dengan kenyamanan ekstra untuk menemani aktivitas dan waktu istirahatmu.",
    fasilitas: [
      "Kasur spring bed", "Free WiFi", "Kamar mandi dalam",
      "TV Digital", "Teko listrik/kamar", "Lemari baju",
      "Meja dan kursi di dalam kamar", "AC",
      "Listrik (token) bulanan", "Air PDAM Umbulan Pasuruan",
      "Dua jendela yang mengarah keluar"
    ],
  },
];

const GALERI = [
  { src: "/image/tipe-kamar-standar.png", nama: "Kamar Standar" },
  { src: "/image/kamar-exclusive.png", nama: "Kamar Exclusive" },
  { src: "/image/dapur-bersama.png", nama: "Dapur Bersama" },
  { src: "/image/parkiran-luas.png", nama: "Area Parkir" },
];

const TAGIHAN_CONTOH = [
  {
    kamar: 2,
    nama: "Penghuni Kamar 2",
    nomor: "Belum tersedia",
    status: "Belum Bayar",
  },
  {
    kamar: 3,
    nama: "Penghuni Kamar 3",
    nomor: "Belum tersedia",
    status: "Belum Bayar",
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
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data (HTTP ${response.status})`);
  }

  return response.json();
}

function salinDataTipe(tipe) {
  return { ...tipe, fasilitas: [...tipe.fasilitas] };
}

// MENCARI NOMOR KAMAR DARI BERBAGAI KEMUNGKINAN FIELD API
function nomorKamarData(room) {
  return Number(
    room?.nomor_kamar ??
    room?.nomor ??
    room?.no_kamar ??
    room?.room_number ??
    room?.number
  );
}

// MEMBACA STATUS KAMAR DARI DATA API
function statusKamarTerisi(room) {
  if (!room) return false;

  const status = String(
    room.status ??
    room.status_kamar ??
    room.keterangan ??
    room.status_penghuni ??
    ""
  ).toLowerCase().trim();

  if (
    ["terisi", "occupied", "ditempati", "aktif"].some((s) =>
      status.includes(s)
    )
  ) {
    return true;
  }

  if (
    ["kosong", "tersedia", "available", "vacant"].some((s) =>
      status.includes(s)
    )
  ) {
    return false;
  }

  return Boolean(
    room.id_penghuni ??
    room.penghuni_id ??
    room.id_user ??
    room.nama_penghuni ??
    room.nama
  );
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
  const [tagihanOpen, setTagihanOpen] = useState(false);
  const [hoverKamar, setHoverKamar] = useState(null);

  // STATE MODAL PROFIL PENGHUNI / PINTU KAMAR
  const [profilOpen, setProfilOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // AMBIL DATA DATABASE
  async function muatData() {
    try {
      setLoading(true);
      setError("");

      const [dataRingkasan, dataKamar] = await Promise.all([
        ambilJson("/api/rooms/ringkasan"),
        ambilJson("/api/rooms"),
      ]);

      if (
        !Array.isArray(dataRingkasan?.per_tipe) ||
        !Array.isArray(dataKamar)
      ) {
        throw new Error("Format respons API kamar tidak sesuai.");
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

  // KUNCI SCROLL SAAT MODAL/MENU TERBUKA
  useEffect(() => {
    if (!menuOpen && !tagihanOpen && !editId && !profilOpen) return;

    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setTagihanOpen(false);
        setProfilOpen(false);
        setSelectedRoom(null);

        if (editId) batalEdit();
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen, tagihanOpen, editId, profilOpen]);

  // DATA MONITORING
  const total = Number(ringkasan?.total_kamar ?? 0);
  const tersedia = Number(ringkasan?.kamar_tersedia ?? 0);
  const terisi = Number(ringkasan?.kamar_terisi ?? 0);

  const okupansi =
    total > 0
      ? Math.min(100, Math.max(0, Math.round((terisi / total) * 100)))
      : 0;

  // INFORMASI TIPE KAMAR
  function informasiTipe(id) {
    const perTipe = ringkasan?.per_tipe?.find(
      (item) => item.tipe === id
    );

    const kamarSesuai = daftarKamar.filter(
      (item) => item.tipe === id
    );

    const hargaList = kamarSesuai
      .map((item) => Number(item.harga))
      .filter((harga) => Number.isFinite(harga) && harga > 0);

    return {
      harga: hargaList.length ? Math.min(...hargaList) : null,
      tersedia: perTipe ? Number(perTipe.kamar_tersedia) : null,
      total: perTipe ? Number(perTipe.total_kamar) : null,
      terisi: perTipe ? Number(perTipe.kamar_terisi) : null,
    };
  }

  // EDIT TIPE KAMAR
  function bukaEdit(tipe) {
    const info = informasiTipe(tipe.id);

    setDraft({
      ...salinDataTipe(tipe),
      ...preview[tipe.id],
      fasilitas: [
        ...(preview[tipe.id]?.fasilitas ?? tipe.fasilitas),
      ],
      harga: preview[tipe.id]?.harga ?? info.harga ?? "",
    });

    setEditId(tipe.id);
    setPesan("");
  }

  function ubahDraft(field, value) {
    setDraft((old) => ({ ...old, [field]: value }));
  }

  function ubahFasilitas(index, value) {
    setDraft((old) => {
      const arr = [...old.fasilitas];
      arr[index] = value;
      return { ...old, fasilitas: arr };
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
      fasilitas: old.fasilitas.filter((_, i) => i !== index),
    }));
  }

  function simpanPratinjau(e) {
    e.preventDefault();
    if (!draft) return;

    const harga = Number(draft.harga);

    if (!Number.isSafeInteger(harga) || harga <= 0) {
      setPesan("Harga harus berupa angka bulat lebih dari nol.");
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
        .map((x) => x.trim())
        .filter(Boolean),
    };

    setPreview((old) => ({ ...old, [editId]: hasil }));
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

  // PILIH FOTO KAMAR
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

  // TAMBAH FOTO GALERI
  function tambahFotoGaleri(e) {
    const files = Array.from(e.target.files || []);
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
              id: Date.now().toString() + Math.random().toString(36),
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
    setFotoTambahan((old) => old.filter((item) => item.id !== id));
  }

  // AMBIL HARGA TAGIHAN
  function hargaTagihan(kamar) {
    const room = daftarKamar.find(
      (r) =>
        Number(r.nomor_kamar ?? r.nomor ?? r.no_kamar) === kamar
    );

    const val = Number(room?.harga);

    return Number.isFinite(val) && val > 0 ? val : 1100000;
  }

  // DATA 15 PINTU KAMAR
  const dataPintuKamar = Array.from({ length: 15 }, (_, index) => {
    const nomor = index + 1;

    const data = daftarKamar.find(
      (room) => nomorKamarData(room) === nomor
    );

    return {
      nomor,
      data,
      terisi: statusKamarTerisi(data),
    };
  });

  const kamarDipilih = dataPintuKamar.find(
    (room) => room.nomor === selectedRoom
  );

  const penghuniTerpilih = kamarDipilih?.data;

  // NAVIGASI HEADER
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

      <Link href="/ulasan" onClick={() => setMenuOpen(false)}>
        Ulasan
      </Link>
    </>
  );

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

          <nav className={styles.nav}>{navLinks}</nav>

          <Link href="/" className={styles.backButton}>
            Beranda Publik <span aria-hidden="true">↗</span>
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
              aria-label="Tutup menu"
            >
              ×
            </button>
          </div>

          <h2>Menu Pemilik</h2>

          {navLinks}

          <Link href="/" onClick={() => setMenuOpen(false)}>
            Beranda Publik
          </Link>
        </div>

        <div className={styles.mobileMenuBottom}>
          <strong>Kost Aulia Gresik</strong>
          <p>Jl. Mawar No.14, Bp. Wetan, Gresik</p>
          <a href={WA}>0812 - 5921 - 5140</a>
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
              PANEL PEMILIK · KOST AULIA GRESIK
            </span>

            <h1>Manajemen Kost</h1>

            <p className={styles.heroSubtitle}>
              Pantau kamar, kelola informasi hunian, dan lihat ringkasan
              operasional kost.
            </p>

            {error && (
              <div className={styles.apiError} role="alert">
                <span>{error}</span>
                <button type="button" onClick={muatData}>
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
                      className={styles.monitorProgressFill}
                      style={{ width: `${okupansi}%` }}
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
                      {ringkasan ? `${okupansi}% terisi` : ""}
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

                    <div className={styles.billMain}>
                      <svg
                        className={`${styles.lineIcon} ${styles.billLineIcon}`}
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <path d="M6 5h20v22H6zM10 10h12M10 15h12M10 20h12" />
                      </svg>

                      <strong>{TAGIHAN_CONTOH.length} Kamar</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.billButton}
                    onClick={() => setTagihanOpen(true)}
                  >
                    Lihat Detail
                    <span aria-hidden="true">⟶</span>
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
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* INFORMASI KAMAR */}
        <section className={styles.mainSection}>
          <div className={styles.contentInner}>
            <section id="kelola-kamar" className={styles.manageSection}>
              <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>
                  INFORMASI KAMAR
                </span>

                <h2>Kelola Tipe Kamar</h2>

                <p>
                  Harga dan ketersediaan awal berasal dari API. Pengeditan
                  di bawah merupakan pratinjau dan belum menyimpan ke database.
                </p>
              </div>

              {pesan && (
                <div className={styles.notice} role="status">
                  {pesan}
                </div>
              )}

              <div className={styles.roomGrid}>
                {DATA_TIPE.map((tipe) => {
                  const info = informasiTipe(tipe.id);
                  const perubahan = preview[tipe.id] || {};
                  const nama = perubahan.nama || tipe.nama;
                  const deskripsi =
                    perubahan.deskripsi ?? tipe.deskripsi;
                  const foto = perubahan.foto || tipe.foto;
                  const harga = perubahan.harga ?? info.harga;
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
                            {loading && harga === null
                              ? "Memuat..."
                              : formatRupiah(harga)}
                          </strong>
                        </div>

                        {perubahan.harga !== undefined && (
                          <span className={styles.previewBadge}>
                            Pratinjau lokal
                          </span>
                        )}

                        <div className={styles.roomMeta}>
                          <span>
                            Tersedia: <strong>{info.tersedia ?? "—"}</strong>
                          </span>
                          <span>
                            Total: <strong>{info.total ?? "—"}</strong>
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
            <section id="galeri" className={styles.gallerySection}>
              <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>FOTO KOST</span>
                <h2>Galeri Kost Aulia</h2>
                <p>Foto yang sudah tersedia dan pratinjau foto tambahan.</p>
              </div>

              <div className={styles.galleryGrid}>
                {GALERI.map((item) => (
                  <div className={styles.galleryCard} key={item.src}>
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
                  <div className={styles.galleryCard} key={item.id}>
                    <img
                      src={item.src}
                      alt={item.nama}
                      className={styles.galleryImage}
                    />

                    <div className={styles.galleryCardBottom}>
                      <span>{item.nama}</span>
                      <button
                        type="button"
                        onClick={() => hapusFotoTambahan(item.id)}
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
                  Foto tambahan hanya untuk pratinjau lokal. Belum
                  diunggah ke server.
                </p>

                {fotoGalat && <p role="alert">{fotoGalat}</p>}
              </div>
            </section>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Link href="/owner" className={styles.footerLogoWrap}>
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
            <Link href="/owner">Beranda Owner</Link>
            <Link href="/owner/invitation-codes">Kode Undangan</Link>
            <Link href="/">Beranda Publik</Link>
            <Link href="/facilities">Fasilitas</Link>
          </div>

          <div className={styles.footerColumn}>
            <h4>KONTAK</h4>
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

  {/* MODAL TAGIHAN */}
  {tagihanOpen && (
    <div
      className={styles.billModalOverlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setTagihanOpen(false);
          setHoverKamar(null);
        }
      }}
    >
      <div
        className={styles.billModal}
        role="dialog"
        aria-modal="true"
        aria-label="Daftar kamar yang belum bayar"
      >
        <button
          type="button"
          className={styles.billModalClose}
          onClick={() => {
            setTagihanOpen(false);
            setHoverKamar(null);
          }}
          aria-label="Tutup pop-up"
        >
          ×
        </button>

        <div className={styles.unpaidList}>
          {TAGIHAN_CONTOH.map((item) => (
            <div
              className={`${styles.unpaidRoom} ${
                hoverKamar === item.kamar ? styles.unpaidRoomActive : ""
              }`}
              key={item.kamar}
              onMouseEnter={() => setHoverKamar(item.kamar)}
              onMouseLeave={() => setHoverKamar(null)}
              onClick={() =>
                setHoverKamar(
                  hoverKamar === item.kamar ? null : item.kamar
                )
              }
            >
              <div className={styles.unpaidRoomInfo}>
                <h3>Kamar {item.kamar}</h3>
                <span>{item.status}</span>
              </div>

              <button
                type="button"
                className={styles.roomArrow}
                title="Detail kamar akan tersedia pada tahap berikutnya"
                aria-label={`Detail kamar ${item.kamar}`}
                onClick={(e) => e.stopPropagation()}
              >
                →
              </button>

              {hoverKamar === item.kamar && (
                <div className={styles.tenantTooltip} role="tooltip">
                  <button
                    type="button"
                    className={styles.tooltipClose}
                    onClick={() => setHoverKamar(null)}
                    aria-label="Tutup detail"
                  >
                    ×
                  </button>

                  <h4>Total Tagihan</h4>
                  <strong className={styles.tooltipAmount}>
                    {formatRupiah(hargaTagihan(item.kamar))}
                  </strong>

                  <div className={styles.tooltipDivider} />

                  <p>Nama : {item.nama}</p>
                  <p>No. telp : {item.nomor}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* MODAL PROFIL PENGHUNI / PINTU KAMAR */}
  {profilOpen && (
    <div
      className={styles.doorModalOverlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setProfilOpen(false);
          setSelectedRoom(null);
        }
      }}
    >
      <div
        className={styles.doorModal}
        role="dialog"
        aria-modal="true"
        aria-label="Profil penghuni dan status kamar"
      >
        <button
          type="button"
          className={styles.doorModalClose}
          onClick={() => {
            setProfilOpen(false);
            setSelectedRoom(null);
          }}
          aria-label="Tutup pop-up"
        >
          ×
        </button>

        <h2 className={styles.doorTitle}>
          Klik pintu kamar untuk melihat profil penghuni
        </h2>

        <div className={styles.doorLegend}>
          <span>
            <i className={styles.emptyDoorIcon} />
            Kamar Kosong
          </span>
          <span>
            <i className={styles.filledDoorIcon} />
            Kamar Terisi
          </span>
        </div>

        <div className={styles.doorGrid}>
          {dataPintuKamar.map((room) => (
            <button
              type="button"
              key={room.nomor}
              className={`${styles.doorItem} ${
                room.terisi ? styles.doorOccupied : styles.doorEmpty
              } ${
                selectedRoom === room.nomor ? styles.doorSelected : ""
              }`}
              onClick={() =>
                setSelectedRoom(
                  selectedRoom === room.nomor ? null : room.nomor
                )
              }
            >
              <span className={styles.door}>
                <span className={styles.doorKnob} />
              </span>
              <span className={styles.doorBase} />
              <span className={styles.doorNumber}>
                Kamar {room.nomor}
              </span>
            </button>
          ))}
        </div>

        {selectedRoom !== null && (
          <div className={styles.selectedRoomInfo}>
            <button
              type="button"
              className={styles.selectedRoomClose}
              onClick={() => setSelectedRoom(null)}
              aria-label="Tutup detail kamar"
            >
              ×
            </button>

            <h3>Kamar {selectedRoom}</h3>

            <span
              className={
                kamarDipilih?.terisi
                  ? styles.occupiedStatus
                  : styles.emptyStatus
              }
            >
              {kamarDipilih?.terisi
                ? "Kamar Terisi"
                : "Kamar Kosong"}
            </span>

            {kamarDipilih?.terisi && penghuniTerpilih ? (
              <div className={styles.selectedRoomDetails}>
                <p>
                  Nama penghuni:{" "}
                  <strong>
                    {penghuniTerpilih.nama_penghuni ??
                      penghuniTerpilih.nama ??
                      penghuniTerpilih.name ??
                      "Data nama belum tersedia"}
                  </strong>
                </p>

                <p>
                  Nomor telepon:{" "}
                  <strong>
                    {penghuniTerpilih.no_telp ??
                      penghuniTerpilih.nomor_telepon ??
                      penghuniTerpilih.telepon ??
                      penghuniTerpilih.phone ??
                      "Data nomor belum tersedia"}
                  </strong>
                </p>
              </div>
            ) : (
              <p className={styles.selectedRoomMessage}>
                {kamarDipilih?.terisi
                  ? "Informasi penghuni belum tersedia."
                  : "Kamar ini sedang kosong."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )}

  {/* MODAL EDIT TIPE KAMAR */}
  {editId && draft && (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) batalEdit();
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
            <span className={styles.sectionEyebrow}>
              EDIT INFORMASI
            </span>
            <h2 id="modal-edit-title">Edit Tipe Kamar</h2>
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

        <form onSubmit={simpanPratinjau} className={styles.editForm}>
          <div className={styles.formGroup}>
            <label htmlFor="nama-tipe">Nama Tipe Kamar</label>
            <input
              id="nama-tipe"
              value={draft.nama}
              onChange={(e) => ubahDraft("nama", e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="harga-kamar">Harga Sewa Bulanan (Rp)</label>
            <input
              id="harga-kamar"
              type="number"
              min="1"
              step="1"
              value={draft.harga}
              onChange={(e) => ubahDraft("harga", e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deskripsi-kamar">Deskripsi Kamar</label>
            <textarea
              id="deskripsi-kamar"
              rows={4}
              value={draft.deskripsi}
              onChange={(e) => ubahDraft("deskripsi", e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="foto-kamar">Ganti Foto Kamar</label>
            <input
              id="foto-kamar"
              type="file"
              accept="image/*"
              onChange={pilihFotoKamar}
            />
            <p>Foto pilihan hanya digunakan sebagai pratinjau.</p>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.facilityEditorHeader}>
              <label>Fasilitas Kamar</label>
              <button
                type="button"
                onClick={tambahFasilitas}
                className={styles.addFacilityButton}
              >
                + Tambah Fasilitas
              </button>
            </div>

            <div className={styles.facilityInputs}>
              {draft.fasilitas.map((item, index) => (
                <div className={styles.facilityInputRow} key={index}>
                  <input
                    value={item}
                    placeholder={`Fasilitas ${index + 1}`}
                    aria-label={`Fasilitas ${index + 1}`}
                    onChange={(e) =>
                      ubahFasilitas(index, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => hapusFasilitas(index)}
                    aria-label={`Hapus fasilitas ${index + 1}`}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formNotice}>
            Perubahan yang diterapkan hanya ditampilkan sementara.
            Data MySQL dan beranda publik belum diperbarui.
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={batalEdit}
            >
              Batal
            </button>
            <button type="submit" className={styles.saveButton}>
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
