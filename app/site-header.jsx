
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Icon from "./icons";
import styles from "./site-header.module.css";

export default function SiteHeader({
  variant = "default",
  user = null,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  // =====================================
  // STATUS LOGIN PENGGUNA
  // =====================================

  // Data user harus berasal dari sesi login
  // yang sudah diverifikasi oleh backend.
  // Jika user tersedia, tampilkan Profile.
  const isLoggedIn = Boolean(user);

  // =====================================
  // HEADER SCROLL
  // =====================================

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =====================================
  // MOBILE MENU
  // =====================================

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 600) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  // Tutup menu ketika pindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const openMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =====================================
  // NAVIGASI BERANDA
  // =====================================

  const handleHomeClick = (e) => {
    closeMenu();

    if (pathname === "/") {
      e.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =====================================
  // NAVIGASI FASILITAS
  // =====================================

  const handleFacilitiesClick = (e) => {
    closeMenu();

    if (pathname === "/facilities") {
      e.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =====================================
  // TAMPILAN HEADER
  // =====================================

  return (
    <>
      <header
        className={`${styles.header} ${
          isScrolled || variant === "solid"
            ? styles.scrolled
            : ""
        }`}
      >
        <div className={styles.headerInner}>

          {/* =====================================
              LOGO DESKTOP
              TETAP SEPERTI ASLINYA
          ===================================== */}

          <Link
            href="/"
            className={`${styles.brand} ${styles.desktopBrand}`}
            aria-label="Kost Aulia"
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

          {/* =====================================
              LOGO MOBILE
              KLIK UNTUK MEMBUKA MENU KIRI
          ===================================== */}

          <button
            type="button"
            className={styles.mobileLogoButton}
            onClick={openMenu}
            aria-label="Buka menu Kost Aulia"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <Image
              src="/image/logo-kost-aulia.png"
              alt=""
              width={137}
              height={81}
              className={styles.logo}
              priority
            />
          </button>

          {/* =====================================
              NAVIGASI DESKTOP
              TIDAK DIUBAH
          ===================================== */}

          <nav
            className={styles.nav}
            aria-label="Navigasi utama"
          >
            <Link
              href="/#beranda"
              onClick={handleHomeClick}
            >
              Beranda
            </Link>

            <Link href="/#footer">
              Kontak
            </Link>

            <Link
              href="/facilities"
              onClick={handleFacilitiesClick}
            >
              Fasilitas
            </Link>

            <Link href="/ulasan">
              Ulasan
            </Link>
          </nav>

          {/* =====================================
              SIGN UP / LOGIN / PROFILE
              TETAP DI KANAN HEADER
              DESKTOP DAN MOBILE
          ===================================== */}

          <div className={styles.auth}>
            {isLoggedIn ? (
              <Link
                href="/profile"
                className={styles.btnSolid}
              >
                <Icon name="user" size={17} />
                Profile
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className={styles.btnSolid}
                >
                  <Icon name="user" size={17} />
                  Sign Up
                </Link>

                <Link
                  href="/login"
                  className={styles.btnOutline}
                >
                  <Icon name="login" size={17} />
                  Login
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* =====================================
          OVERLAY GELAP SAAT MENU TERBUKA
      ===================================== */}

      {menuOpen && (
        <button
          type="button"
          className={styles.mobileOverlay}
          onClick={closeMenu}
          aria-label="Tutup menu navigasi"
          tabIndex={-1}
        />
      )}

      {/* =====================================
          SIDE MENU KHUSUS MOBILE
          MUNCUL DARI SISI KIRI
      ===================================== */}

      <aside
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ""
        }`}
        aria-label="Navigasi mobile Kost Aulia"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >

        {/* =====================================
            BAGIAN ATAS MENU
        ===================================== */}

        <div className={styles.mobileTop}>

          {/* LOGO ASLI DAN TOMBOL X */}

          <div className={styles.mobileMenuHeader}>

            <Image
              src="/image/logo-kost-aulia.png"
              alt="Logo Kost Aulia"
              width={137}
              height={81}
              className={styles.mobileMenuLogo}
            />

            <button
              type="button"
              className={styles.mobileClose}
              onClick={closeMenu}
              aria-label="Tutup menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 5L19 19M19 5L5 19" />
              </svg>
            </button>

          </div>

          {/* JUDUL MENU */}

          <h2 className={styles.mobileTitle}>
            Menu
          </h2>

          {/* =====================================
              NAVIGASI UTAMA
          ===================================== */}

          <nav
            className={styles.mobileNav}
            aria-label="Menu utama mobile"
          >

            <Link
              href="/#beranda"
              onClick={handleHomeClick}
            >
              Beranda
            </Link>

            <Link
              href="/#footer"
              onClick={closeMenu}
            >
              Kontak
            </Link>

            <Link
              href="/facilities"
              onClick={handleFacilitiesClick}
            >
              Fasilitas
            </Link>

            <Link
              href="/ulasan"
              onClick={closeMenu}
            >
              Ulasan
            </Link>

          </nav>

        </div>

        {/* =====================================
            BAGIAN BAWAH
            WARNA BIRU TUA
        ===================================== */}

        <div className={styles.mobileBottom}>

          {/* LOGO ASLI DAN DESKRIPSI */}

          <div className={styles.mobileBottomBrand}>

            <Image
              src="/image/logo-kost-aulia.png"
              alt="Kost Aulia"
              width={137}
              height={81}
              className={styles.mobileBottomLogo}
            />

            <p>
              Kost khusus putri yang terletak di pusat
              kota Gresik dengan fasilitas lengkap,
              untuk hidup yang lebih tenang.
            </p>

          </div>

          {/* =====================================
              KONTAK
          ===================================== */}

          <div className={styles.mobileBottomSection}>

            <h3>KONTAK</h3>

            <a
              href="https://wa.me/6281259215140"
              target="_blank"
              rel="noreferrer"
            >
              0812 - 5921 - 5140
            </a>

            <div className={styles.mobileSocialLinks}>

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

          {/* =====================================
              LOKASI
          ===================================== */}

          <div className={styles.mobileBottomSection}>

            <h3>LOKASI</h3>

            <p>
              Jl. Mawar No.14
              <br />
              Bp.Wetan, Gresik
            </p>

          </div>

        </div>

      </aside>
    </>
  );
}
