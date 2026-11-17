
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

  // Status login berasal dari sistem autentikasi.
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

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // Tutup menu jika berpindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

          {/* LOGO */}

          <Link
            href="/"
            className={styles.brand}
            aria-label="Kost Aulia"
            onClick={handleHomeClick}
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
              AKUN DESKTOP
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

          {/* =====================================
              HAMBURGER KHUSUS MOBILE
          ===================================== */}

          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu navigasi"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6H20M4 12H20M4 18H20" />
            </svg>
          </button>

        </div>
      </header>

      {/* =====================================
          OVERLAY MOBILE
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
          MENU SAMPING MOBILE
      ===================================== */}

      <aside
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ""
        }`}
        aria-label="Menu navigasi mobile"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >

        {/* TOMBOL TUTUP */}

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

        {/* =====================================
            BAGIAN ATAS MENU
        ===================================== */}

        <div className={styles.mobileTop}>

          {/* JUDUL MENU */}

          <div className={styles.mobileMenuHeader}>
            <Image
              src="/image/logo-kost-aulia.png"
              alt="Logo Kost Aulia"
              width={90}
              height={54}
              className={styles.mobileLogo}
            />

            <h2>Menu</h2>
          </div>

          {/* =====================================
              SIGN UP / LOGIN / PROFILE
              POSISI PALING ATAS
          ===================================== */}

          <div className={styles.mobileAccount}>

            {isLoggedIn ? (
              <Link
                href="/profile"
                className={styles.mobileProfileButton}
                onClick={closeMenu}
              >
                <Icon name="user" size={19} />
                Profile
              </Link>
            ) : (
              <div className={styles.mobileAuthButtons}>

                <Link
                  href="/sign-up"
                  onClick={closeMenu}
                  className={styles.mobileAuthButton}
                >
                  <Icon name="user" size={18} />
                  Sign Up
                </Link>

                <Link
                  href="/login"
                  onClick={closeMenu}
                  className={styles.mobileAuthButton}
                >
                  <Icon name="login" size={18} />
                  Login
                </Link>

              </div>
            )}

          </div>

          {/* =====================================
              NAVIGASI UTAMA MOBILE
          ===================================== */}

          <nav
            className={styles.mobileNav}
            aria-label="Navigasi mobile"
          >

            <Link
              href="/#beranda"
              onClick={handleHomeClick}
            >
              <span className={styles.mobileNavIcon}>
                <Icon name="home" size={20} />
              </span>
              Beranda
            </Link>

            <Link
              href="/#footer"
              onClick={closeMenu}
            >
              <span className={styles.mobileNavIcon}>
                <Icon name="phone" size={20} />
              </span>
              Kontak
            </Link>

            <Link
              href="/facilities"
              onClick={handleFacilitiesClick}
            >
              <span className={styles.mobileNavIcon}>
                <Icon name="building" size={20} />
              </span>
              Fasilitas
            </Link>

            <Link
              href="/ulasan"
              onClick={closeMenu}
            >
              <span className={styles.mobileNavIcon}>
                <Icon name="star" size={20} />
              </span>
              Ulasan
            </Link>

          </nav>

        </div>

        {/* =====================================
            BAGIAN BAWAH WARNA BIRU
        ===================================== */}

        <div className={styles.mobileBottom}>

          {/* LOGO DAN DESKRIPSI */}

          <div className={styles.mobileBottomBrand}>
            <div className={styles.mobileBottomLogo}>
              <Image
                src="/image/logo-kost-aulia.png"
                alt="Kost Aulia"
                width={95}
                height={60}
              />
            </div>

            <p>
              Kost khusus putri yang terletak di pusat
              kota Gresik dengan fasilitas lengkap,
              untuk hidup yang lebih tenang.
            </p>
          </div>

          {/* KONTAK */}

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

          {/* LOKASI */}

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
