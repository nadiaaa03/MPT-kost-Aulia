
"use client";

import { useEffect, useState } from "react";

export default function InvitationCodesPage() {
  const [codes, setCodes] = useState([]);
  const [method, setMethod] = useState("manual");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCodes() {
    try {
      const response = await fetch("/api/owner/invitation-codes");
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setCodes(result.data);
    } catch (error) {
      setMessage(error.message || "Gagal mengambil kode.");
    }
  }

  useEffect(() => {
    loadCodes();
  }, []);

  async function createCode(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/owner/invitation-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metode: method,
          kode_unik: method === "manual" ? manualCode : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      setManualCode("");
      await loadCodes();
    } catch (error) {
      setMessage(error.message || "Gagal membuat kode.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(
        `/api/owner/invitation-codes/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      await loadCodes();
    } catch (error) {
      setMessage(error.message || "Gagal mengubah status.");
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      padding: "40px 6%",
      background: "#f4efe8",
      color: "#17344d",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>Manajemen Kode Undangan</h1>
      <p>Buat dan kelola kode undangan penghuni Kost Aulia.</p>

      <section style={{
        background: "#fff",
        padding: 24,
        borderRadius: 18,
        maxWidth: 600,
        marginTop: 28
      }}>
        <h2>Buat Kode Undangan</h2>

        <form onSubmit={createCode}>
          <label>Metode pembuatan</label>

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={fieldStyle}
          >
            <option value="manual">Buat kode sendiri</option>
            <option value="otomatis">Generate otomatis</option>
          </select>

          {method === "manual" && (
            <>
              <label>Kode undangan</label>
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: AULIATES2026"
                maxLength={20}
                required
                style={fieldStyle}
              />
            </>
          )}

          <button disabled={loading} style={buttonStyle}>
            {loading ? "Memproses..." : "Buat Kode"}
          </button>
        </form>

        {message && <p>{message}</p>}
      </section>

      <section style={{ marginTop: 35 }}>
        <h2>Daftar Kode Undangan</h2>

        <button onClick={loadCodes} style={buttonStyle}>
          Refresh Daftar
        </button>

        {codes.length === 0 ? (
          <p>Belum ada kode undangan.</p>
        ) : (
          codes.map((code) => (
            <div
              key={code.id_kode}
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 14,
                marginTop: 14,
                maxWidth: 650
              }}
            >
              <h3>{code.kode_unik}</h3>
              <p>Metode: {code.metode}</p>
              <p>Status: {code.status}</p>

              {code.status !== "digunakan" && (
                <button
                  onClick={() =>
                    updateStatus(
                      code.id_kode,
                      code.status === "aktif" ? "nonaktif" : "aktif"
                    )
                  }
                  style={buttonStyle}
                >
                  {code.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                </button>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}

const fieldStyle = {
  display: "block",
  width: "100%",
  padding: 13,
  margin: "10px 0 18px",
  borderRadius: 9,
  border: "1px solid #d6c9bb",
  fontSize: 16,
};

const buttonStyle = {
  padding: "12px 20px",
  border: "none",
  borderRadius: 9,
  background: "#12314d",
  color: "white",
  cursor: "pointer",
  marginTop: 10,
};
