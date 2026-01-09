import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../api";

function HomePage() {
  const navigate = useNavigate();

  // State untuk form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State untuk join grup
  const [joinCode, setJoinCode] = useState("");

  // State untuk riwayat grup
  const [groupHistory, setGroupHistory] = useState([]);

  // Load riwayat dari localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("groupHistory") || "[]");
    setGroupHistory(history);
  }, []);

  // Hapus grup dari riwayat
  const removeFromHistory = (code) => {
    const history = groupHistory.filter((g) => g.code !== code);
    setGroupHistory(history);
    localStorage.setItem("groupHistory", JSON.stringify(history));
  };

  // Handle buat grup baru
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nama grup harus diisi!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createGroup(name, description, password);
      // Redirect ke halaman grup
      navigate(`/group/${result.data.code}`);
    } catch (err) {
      setError("Gagal membuat grup. Coba lagi!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle join grup
  const handleJoinGroup = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/group/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>
          <span className="logo-emoji">💰</span> <span className="logo-text">Split Bill</span>
        </h1>
        <p>Hitung patungan dengan mudah!</p>
      </div>

      {/* Form Buat Grup Baru */}
      <form onSubmit={handleCreateGroup}>
        <div className="section-title">📝 Buat Grup Baru</div>

        {error && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label>Nama Grup</label>
          <input type="text" placeholder="Contoh: Makan Bareng Kantor" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Deskripsi (opsional)</label>
          <input type="text" placeholder="Contoh: Patungan makan siang 10 Januari" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label>🔒 Password (opsional)</label>
          <input type="password" placeholder="Kosongkan jika tidak ingin pakai password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Membuat..." : "🚀 Buat Grup"}
        </button>
      </form>

      <div className="divider"></div>

      {/* Form Join Grup */}
      <form onSubmit={handleJoinGroup}>
        <div className="section-title">🔗 Gabung Grup</div>

        <div className="form-group">
          <label>Kode Grup</label>
          <input type="text" placeholder="Masukkan kode (contoh: ABC123)" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} style={{ textTransform: "uppercase" }} />
        </div>

        <button type="submit" className="btn btn-secondary">
          🔍 Cari Grup
        </button>
      </form>

      {/* Riwayat Grup */}
      {groupHistory.length > 0 && (
        <>
          <div className="divider"></div>
          <div className="section-title">📜 Riwayat Grup</div>
          <div className="history-list">
            {groupHistory.map((group) => (
              <div key={group.code} className="history-item">
                <div className="history-info" onClick={() => navigate(`/group/${group.code}`)}>
                  <span className="history-name">{group.name}</span>
                  <span className="history-code">{group.code}</span>
                </div>
                <button
                  className="btn-tiny"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(group.code);
                  }}
                  title="Hapus dari riwayat"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
