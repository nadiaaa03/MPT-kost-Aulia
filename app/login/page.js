
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          gmail,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login gagal.");
      }

      setMessage("Login berhasil! Selamat datang, " + result.user.nama);

      // Pengalihan dashboard akan ditambahkan
      // setelah halaman dashboard tersedia.

    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#f4efe8",
      color: "#1d2a39",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>
      <div style={{
        width: "min(420px, 90vw)",
        background: "#f8f3ee",
        border: "1px solid rgba(17, 50, 82, 0.08)",
        borderRadius: "24px",
        padding: "32px 28px",
        boxShadow: "0 20px 40px rgba(44, 34, 28, 0.08)",
      }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>
          Login
        </h1>

        <p style={{
          margin: "0 0 24px",
          color: "#574d43",
          lineHeight: 1.7,
        }}>
          Masuk untuk melihat status pemesanan dan mengelola akun Anda.
        </p>

        <form onSubmit={handleLogin} style={{
          display: "grid",
          gap: "14px",
        }}>
          <input
            type="email"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
            placeholder="Email Gmail"
            required
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #d6c9bb",
              fontSize: "1rem",
            }}
          />

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                flex: 1,
                minWidth: 0,
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #d6c9bb",
                fontSize: "1rem",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {message && (
            <p
              role="alert"
              style={{
                color: message.startsWith("Login berhasil")
                  ? "green"
                  : "#c0392b",
                fontSize: "14px",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              padding: "14px 18px",
              border: "none",
              borderRadius: "999px",
              background: "#12314d",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
