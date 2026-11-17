
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Icon from "./icons";
import styles from "./site-header.module.css";

export default function SiteHeader({ variant = "default" }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

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

  const handleHomeClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Mengembalikan scroll ke hero halaman Fasilitas
  const handleFacilitiesClick = (e) => {
    if (pathname === "/facilities") {
      e.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <header
      className={`${styles.header} ${
        isScrolled || variant === "solid" ? styles.scrolled : ""
      }`}
    >
      <div className={styles.headerInner}>
        {/* Logo */}
        <Link
          href="/"
          className={styles.brand}
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

        {/* Navigasi */}
        <nav className={styles.nav} aria-label="Navigasi utama">
          <Link href="/#beranda" onClick={handleHomeClick}>
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

        {/* Tombol Login dan Sign Up */}
        <div className={styles.auth}>
          <Link href="/sign-up" className={styles.btnSolid}>
            <Icon name="user" size={17} />
            Sign Up
          </Link>

          <Link href="/login" className={styles.btnOutline}>
            <Icon name="login" size={17} />
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
