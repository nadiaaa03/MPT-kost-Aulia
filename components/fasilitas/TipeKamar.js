
"use client";

import { useCallback, useEffect, useState } from "react";
import { ambilInfoTipeKamar } from "@/lib/kamar-api";
import styles from "./TipeKamar.module.css";

export default function TipeKamar({ rooms = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mengambil informasi harga dan ketersediaan dari API
  const muatData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const hasil = await ambilInfoTipeKamar();
      setData(hasil);
    } catch (err) {
      console.error("Gagal mengambil data kamar:", err);
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatData();
  }, [muatData]);

  // Format harga ke Rupiah
  function formatRupiah(angka) {
    return Number(angka).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
  }

  // Menampilkan status kamar
  function tampilkanStatus(info) {
    if (loading) {
      return (
        <span className={`${styles.status} ${styles.netral}`}>
          Memuat ketersediaan...
        </span>
      );
    }

    if (!info || !info.ada) {
      return (
        <span className={`${styles.status} ${styles.netral}`}>
          Informasi belum tersedia
        </span>
      );
    }

    if (info.penuh || info.tersedia === 0) {
      return (
        <span className={`${styles.status} ${styles.penuh}`}>
          Kamar Sudah Penuh
        </span>
      );
    }

    return (
      <span className={`${styles.status} ${styles.tersedia}`}>
        Kamar Tersisa: {info.tersedia}
      </span>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            INFORMASI KAMAR
          </span>
          <h3>Harga dan Ketersediaan</h3>
          <p>
            Periksa informasi harga dan jumlah kamar yang masih tersedia.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={muatData}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Perbarui Data"}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <p>Gagal mengambil data kamar: {error}</p>

          <button
            type="button"
            onClick={muatData}
            disabled={loading}
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className={styles.grid}>
        {rooms.map((room) => {
          const info = data?.[room.apiKey];

          return (
            <div className={styles.card} key={room.id}>
              <h4>{room.title}</h4>

              <div className={styles.price}>
                {info?.harga !== null &&
                info?.harga !== undefined
                  ? formatRupiah(info.harga)
                  : "Harga belum tersedia"}
              </div>

              {tampilkanStatus(info)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
