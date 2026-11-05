
"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: "",
    gmail: "",
    no_telp: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requirements = [
    {
      label: "Minimal 8 karakter",
      valid: form.password.length >= 8,
    },
    {
      label: "Memiliki huruf besar (A-Z)",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "Memiliki huruf kecil (a-z)",
      valid: /[a-z]/.test(form.password),
    },
    {
      label: "Memiliki angka (0-9)",
      valid: /\d/.test(form.password),
    },
    {
      label: "Memiliki simbol (!@#$%)",
      valid: /[^A-Za-z0-9\s]/.test(form.password),
    },
  ];

  const passwordValid = requirements.every(
    (item) => item.valid
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");
  setMessageType("");

  if (!passwordValid) {
    setMessage("Password belum memenuhi semua persyaratan.");
    setMessageType("error");
    return;
  }

  if (form.password !== form.confirmPassword) {
    setMessage("Konfirmasi password tidak cocok.");
    setMessageType("error");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nama: form.nama,
        gmail: form.gmail,
        no_telp: form.no_telp,
        password: form.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registrasi gagal.");
    }

    setMessage(result.message);
    setMessageType("success");

  } catch (error) {
    setMessage(error.message || "Terjadi kesalahan.");
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};


  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <div className={styles.header}>
          <h1>Sign Up</h1>
          <p>
            Create your account and enjoy a comfortable
            stay with Kost Aulia.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="gmail"
            value={form.gmail}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="no_telp"
            value={form.no_telp}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />

          <label>Password</label>
          <div className={styles.passwordBox}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className={styles.requirements}>
            <p>Password Requirements</p>

            {requirements.map((item, index) => (
              <div
                key={index}
                className={
                  item.valid ? styles.valid : styles.invalid
                }
              >
                <span>{item.valid ? "✓" : "✕"}</span>
                {item.label}
              </div>
            ))}
          </div>

          <label>Confirm Password</label>
          <div className={styles.passwordBox}>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          {form.confirmPassword && (
            <p
              className={
                form.password === form.confirmPassword
                  ? styles.valid
                  : styles.invalid
              }
            >
              {form.password === form.confirmPassword
                ? "✓ Passwords match"
                : "✕ Passwords do not match"}
            </p>
          )}
          {message && (<p className={messageType === "success" ? styles.valid : styles.invalid}>{message}</p>)}

          <button
            type="submit"
            className={styles.submit}
            disabled={
              loading || 
              !passwordValid ||
              !form.confirmPassword ||
              form.password !== form.confirmPassword
            }
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <p className={styles.login}>
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>
      </section>
    </main>
  );
}
