import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../api";
import Antigravity from "../components/Antigravity";

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function HomePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [groupHistory, setGroupHistory] = useState([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("groupHistory") || "[]");
    setGroupHistory(history);
  }, []);

  const removeFromHistory = (code) => {
    const history = groupHistory.filter((g) => g.code !== code);
    setGroupHistory(history);
    localStorage.setItem("groupHistory", JSON.stringify(history));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Nama grup harus diisi!"); return; }
    setLoading(true);
    setError("");
    try {
      const result = await createGroup(name, description, password);
      navigate(`/group/${result.data.code}`);
    } catch (err) {
      setError("Gagal membuat grup. Coba lagi!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    if (joinCode.trim()) navigate(`/group/${joinCode.toUpperCase()}`);
  };

  return (
    <main className="dashboard">
      {/* ── Full-page Antigravity Background ── */}
      <div className="page-canvas">
        <Antigravity
          count={700}
          magnetRadius={14}
          ringRadius={9}
          waveSpeed={0.35}
          waveAmplitude={1.0}
          particleSize={1.5}
          lerpSpeed={0.055}
          color={"#19d0e8"}
          autoAnimate={true}
          particleVariance={1.0}
          rotationSpeed={0.08}
          depthFactor={0.6}
          pulseSpeed={2.5}
          particleShape={"capsule"}
          fieldStrength={10}
        />
      </div>

      {/* ── Header ── */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Split Bill</h1>
        <p className="dashboard-subtitle">Hitung patungan dengan mudah!</p>
      </header>

      {/* ── Bento Grid ── */}
      <div className="bento-grid">

        {/* LEFT — Buat Grup Baru */}
        <section className="glass-panel bento-create">
          <div className="section-header">
            <span className="section-icon"><PlusIcon /></span>
            <h2 className="section-title-text">Buat Grup Baru</h2>
          </div>

          <form onSubmit={handleCreateGroup} className="form-stack">
            {error && (
              <div className="error-msg">
                <AlertIcon />
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nama Grup</label>
              <input
                id="group-name"
                className="form-input"
                type="text"
                placeholder="Contoh: Makan Bareng Kantor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi (opsional)</label>
              <input
                id="group-desc"
                className="form-input"
                type="text"
                placeholder="Contoh: Patungan makan siang 10 Januari"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--color-ash)", display: "flex", width: 14, height: 14 }}><LockIcon /></span>
                Password (opsional)
              </label>
              <input
                id="group-password"
                className="form-input"
                type="password"
                placeholder="Kosongkan jika tidak ingin pakai password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              id="btn-create-group"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: "auto" }}
            >
              <span style={{ width: 18, height: 18, display: "flex" }}><RocketIcon /></span>
              {loading ? "Membuat..." : "Buat Grup"}
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN */}
        <div className="bento-right">

          {/* Gabung Grup */}
          <section className="glass-panel bento-join">
            <div className="section-header">
              <span className="section-icon"><LinkIcon /></span>
              <h2 className="section-title-text" style={{ fontSize: 22 }}>Gabung Grup</h2>
            </div>

            <form onSubmit={handleJoinGroup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Kode Grup</label>
                <input
                  id="join-code"
                  className="form-input"
                  type="text"
                  placeholder="MASUKKAN KODE (CONTOH: ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}
                  autoComplete="off"
                  maxLength={8}
                />
              </div>
              <button id="btn-join-group" type="submit" className="btn btn-secondary">
                <span style={{ width: 16, height: 16, display: "flex" }}><SearchIcon /></span>
                Cari Grup
              </button>
            </form>
          </section>

          {/* Riwayat Grup */}
          <section className="glass-panel bento-history">
            <div className="section-header">
              <span className="section-icon"><ClockIcon /></span>
              <h2 className="section-title-text" style={{ fontSize: 22 }}>Riwayat Grup</h2>
            </div>

            <div className="history-scroll">
              {groupHistory.length === 0 ? (
                <p className="history-empty">Belum ada riwayat grup</p>
              ) : (
                groupHistory.map((group) => (
                  <div
                    key={group.code}
                    className="history-item"
                    onClick={() => navigate(`/group/${group.code}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/group/${group.code}`)}
                  >
                    <div className="history-info">
                      <span className="history-name">{group.name}</span>
                      <span className="history-code">{group.code}</span>
                    </div>
                    <button
                      className="history-delete"
                      onClick={(e) => { e.stopPropagation(); removeFromHistory(group.code); }}
                      title="Hapus dari riwayat"
                      aria-label="Hapus dari riwayat"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

export default HomePage;
