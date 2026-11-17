
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

  // Status login harus berasal dari sesi autentikasi
  // user = null artinya belum login
  const isLoggedIn = Boolean(user);

  // =================================
  // HEADER SCROLL
  // =================================

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

  // =================================
  // MOBILE MENU
  // =================================

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

  // Tutup menu ketika berpindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =================================
  // NAVIGASI BERANDA
  // =================================

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

  // =================================
  // NAVIGASI FASILITAS
  // =================================

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

  return (
    <>
      <header
        className={`${styles.header} ${
          isScrolled || variant === "solid"
            ? styles.scrolled
            : ""
        } ${menuOpen ? styles.menuActive : ""}`}
      >
        <div className={styles.headerInner}>

          {/* =================================
              LOGO
          ================================= */}

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

          {/* =================================
              NAVIGASI DESKTOP
          ================================= */}

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

          {/* =================================
              TOMBOL AKUN DESKTOP
          ================================= */}

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

          {/* =================================
              HAMBURGER MOBILE
          ================================= */}

          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen
                ? "Tutup menu navigasi"
                : "Buka menu navigasi"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? (
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
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6H20M4 12H20M4 18H20" />
              </svg>
            )}
          </button>

        </div>
      </header>

      {/* =================================
          OVERLAY MOBILE
      ================================= */}

      {menuOpen && (
        <button
          type="button"
          className={styles.mobileOverlay}
          onClick={closeMenu}
          aria-label="Tutup menu"
          tabIndex={-1}
        />
      )}

      {/* =================================
          MOBILE SIDE MENU
      ================================= */}

      <aside
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ""
        }`}
        aria-label="Menu navigasi mobile"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles.mobileMenuContent}>
          <button
          type="button"
          className={styles.mobileClose}
          onClick={closeMenu}
          aria-label="Tutup menu"
          >
            ✕
            </button>

          {/* LOGO DAN DESKRIPSI */}

          <div className={styles.mobileBrand}>
            <div className={styles.mobileLogoCircle}>
              <Image
                src="/image/logo-kost-aulia.png"
                alt="Kost Aulia"
                width={100}
                height={65}
                className={styles.mobileLogo}
              />
            </div>

            <p className={styles.mobileDescription}>
              Kost khusus putri yang terletak di pusat
              kota Gresik dengan fasilitas lengkap,
              untuk hidup yang lebih tenang.
            </p>
          </div>

          {/* LINK DAN KONTAK */}

          <div className={styles.mobileColumns}>

            <div className={styles.mobileColumn}>
              <h3>LINK</h3>

              <Link
                href="/#beranda"
                onClick={handleHomeClick}
              >
                Beranda
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

              <Link
                href="/#footer"
                onClick={closeMenu}
              >
                FAQ
              </Link>
            </div>

            <div className={styles.mobileColumn}>
              <h3>KONTAK</h3>

              <a
                href="https://wa.me/6281259215140"
                target="_blank"
                rel="noreferrer"
              >
                0812 - 5921 - 5140
              </a>

              <div className={styles.mobileSocials}>

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

          </div>

          {/* LOKASI */}

          <div className={styles.mobileLocation}>
            <h3>LOKASI</h3>

            <p>
              Jl. Mawar No.14
              <br />
              Bp.Wetan, Gresik
            </p>
          </div>

          {/* =================================
              AKUN MOBILE
          ================================= */}

          <div className={styles.mobileAccount}>

            {isLoggedIn ? (
              <Link
                href="/profile"
                className={styles.mobileAccountButton}
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
                  className={styles.mobileAccountButton}
                >
                  <Icon name="user" size={18} />
                  Sign Up
                </Link>

                <Link
                  href="/login"
                  onClick={closeMenu}
                  className={styles.mobileAccountButton}
                >
                  <Icon name="login" size={18} />
                  Login
                </Link>

              </div>
            )}

          </div>

        </div>
      </aside>
    </>
  );
}
