export default function LoginPage() {
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
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Login</h1>
        <p style={{ margin: "0 0 24px", color: "#574d43", lineHeight: 1.7 }}>
          Masuk untuk melihat status pemesanan dan mengelola akun Anda.
        </p>
        <div style={{ display: "grid", gap: "14px" }}>
          <input
            aria-label="Email"
            placeholder="Email"
            style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid #d6c9bb", fontSize: "1rem" }}
          />
          <input
            aria-label="Password"
            type="password"
            placeholder="Password"
            style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid #d6c9bb", fontSize: "1rem" }}
          />
          <button
            type="button"
            style={{
              marginTop: "8px",
              padding: "14px 18px",
              border: "none",
              borderRadius: "999px",
              background: "#12314d",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Masuk
          </button>
        </div>
      </div>
    </main>
  );
}
