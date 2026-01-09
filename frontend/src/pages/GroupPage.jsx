import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { getGroup, addMember, updateMember, deleteMember, addExpense, updateExpense, deleteExpense, getSummary, getCategories, markSettlementPaid, unmarkSettlementPaid, exportWhatsApp, verifyGroupPassword } from "../api";

// Kategori default jika API belum ready
const DEFAULT_CATEGORIES = ["🍔 Makanan", "🚗 Transport", "🎬 Hiburan", "🛒 Belanja", "🏠 Akomodasi", "💊 Kesehatan", "📱 Lainnya"];

function GroupPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  // State untuk data grup
  const [group, setGroup] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk password
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // State untuk form tambah member
  const [memberName, setMemberName] = useState("");
  const [editingMember, setEditingMember] = useState(null);

  // State untuk form tambah expense
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePaidBy, setExpensePaidBy] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splitAmong, setSplitAmong] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

  // State untuk QR Code
  const [showQR, setShowQR] = useState(false);

  // Load data grup
  const loadGroup = async () => {
    try {
      const groupRes = await getGroup(code);

      // Cek apakah grup butuh password
      if (groupRes.requires_password) {
        // Cek apakah sudah pernah verifikasi (simpan di sessionStorage)
        const verified = sessionStorage.getItem(`verified_${code}`);
        if (verified) {
          // Sudah terverifikasi, ambil data lengkap via verify endpoint
          try {
            const fullData = await verifyGroupPassword(code, verified);
            setGroup(fullData.data);
            const summaryRes = await getSummary(code);
            setSummary(summaryRes.data);
            saveToHistory(fullData.data);
          } catch (err) {
            // Password berubah atau tidak valid lagi
            sessionStorage.removeItem(`verified_${code}`);
            setRequiresPassword(true);
            setGroup(groupRes.data);
          }
        } else {
          setRequiresPassword(true);
          setGroup(groupRes.data);
        }
        setLoading(false);
        return;
      }

      // Load summary
      const summaryRes = await getSummary(code);
      setGroup(groupRes.data);
      setSummary(summaryRes.data);

      // Load categories
      try {
        const catRes = await getCategories();
        if (catRes.data) setCategories(catRes.data);
      } catch (e) {
        console.log("Using default categories");
      }

      // Simpan ke riwayat
      saveToHistory(groupRes.data);
    } catch (err) {
      setError("Grup tidak ditemukan!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle verifikasi password
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    try {
      const result = await verifyGroupPassword(code, passwordInput);
      setGroup(result.data);
      setRequiresPassword(false);

      // Simpan PASSWORD ke session (bukan hanya "true") agar bisa reload
      sessionStorage.setItem(`verified_${code}`, passwordInput);

      // Load summary
      const summaryRes = await getSummary(code);
      setSummary(summaryRes.data);

      // Simpan ke riwayat
      saveToHistory(result.data);
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Password salah!");
    }
  };

  // Simpan grup ke localStorage (riwayat)
  const saveToHistory = (groupData) => {
    const history = JSON.parse(localStorage.getItem("groupHistory") || "[]");
    const exists = history.find((g) => g.code === groupData.code);
    if (!exists) {
      history.unshift({
        code: groupData.code,
        name: groupData.name,
        visitedAt: new Date().toISOString(),
      });
      // Simpan max 10 grup terakhir
      localStorage.setItem("groupHistory", JSON.stringify(history.slice(0, 10)));
    }
  };

  useEffect(() => {
    loadGroup();
  }, [code]);

  // ============ MEMBER HANDLERS ============

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    try {
      if (editingMember) {
        await updateMember(editingMember.id, memberName);
        setEditingMember(null);
      } else {
        await addMember(code, memberName);
      }
      setMemberName("");
      loadGroup();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal!");
      console.error(err);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberName(member.name);
  };

  const handleDeleteMember = async (id) => {
    if (!confirm("Yakin hapus anggota ini?")) return;
    try {
      await deleteMember(id);
      loadGroup();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal hapus!");
    }
  };

  // ============ EXPENSE HANDLERS ============

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount || !expensePaidBy) {
      alert("Lengkapi semua field!");
      return;
    }

    try {
      const data = {
        paidById: parseInt(expensePaidBy),
        description: expenseDesc,
        amount: expenseAmount,
        category: expenseCategory,
        splitType: splitType,
        splitAmong: splitType === "custom" ? splitAmong : [],
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          paid_by_id: data.paidById,
          description: data.description,
          amount: parseFloat(data.amount),
          category: data.category,
          split_type: data.splitType,
          split_among: data.splitAmong,
        });
        setEditingExpense(null);
      } else {
        await addExpense(code, data);
      }

      // Reset form
      setExpenseDesc("");
      setExpenseAmount("");
      setExpensePaidBy("");
      setExpenseCategory("");
      setSplitType("equal");
      setSplitAmong([]);
      loadGroup();
    } catch (err) {
      alert("Gagal menambah pengeluaran!");
      console.error(err);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseDesc(expense.description);
    setExpenseAmount(expense.amount.toString());
    setExpensePaidBy(expense.paid_by_id.toString());
    setExpenseCategory(expense.category || "");
    setSplitType(expense.split_type || "equal");
    if (expense.split_among) {
      try {
        setSplitAmong(JSON.parse(expense.split_among));
      } catch {
        setSplitAmong([]);
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("Yakin hapus pengeluaran ini?")) return;
    try {
      await deleteExpense(id);
      loadGroup();
    } catch (err) {
      alert("Gagal hapus!");
    }
  };

  // ============ SETTLEMENT HANDLERS ============

  const handleMarkPaid = async (settlement) => {
    try {
      await markSettlementPaid(group.id, settlement.from.id, settlement.to.id, settlement.amount);
      loadGroup();
    } catch (err) {
      alert("Gagal konfirmasi!");
    }
  };

  const handleUnmarkPaid = async (settlement) => {
    try {
      await unmarkSettlementPaid(group.id, settlement.from.id, settlement.to.id);
      loadGroup();
    } catch (err) {
      alert("Gagal batalkan!");
    }
  };

  // Check if settlement is paid
  const isSettlementPaid = (fromId, toId) => {
    if (!summary?.settlement_records) return false;
    return summary.settlement_records.some((r) => r.from_member_id === fromId && r.to_member_id === toId && r.is_paid);
  };

  // ============ EXPORT HANDLERS ============

  const handleExportWhatsApp = async () => {
    try {
      const res = await exportWhatsApp(code);
      const text = res.data;
      // Open WhatsApp with pre-filled text
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      // Fallback: copy to clipboard
      const text = generateWhatsAppText();
      navigator.clipboard.writeText(text);
      alert("Text disalin ke clipboard! Paste ke WhatsApp.");
    }
  };

  const generateWhatsAppText = () => {
    if (!group || !summary) return "";
    let text = `💰 *${group.name}*\n`;
    if (group.description) text += `${group.description}\n`;
    text += `\n📊 *Ringkasan*\n`;
    text += `• Total: ${formatRupiah(summary.total_expense)}\n`;
    text += `• Peserta: ${summary.member_count} orang\n`;
    text += `• Per orang: ${formatRupiah(summary.per_person)}\n\n`;

    if (summary.settlements?.length > 0) {
      text += `💸 *Yang Harus Transfer*\n`;
      summary.settlements.forEach((s) => {
        text += `• ${s.from.name} → ${s.to.name}: ${formatRupiah(s.amount)}\n`;
      });
    }
    text += `\n🔗 Link: ${window.location.href}`;
    return text;
  };

  // Toggle split among member
  const toggleSplitMember = (memberId) => {
    if (splitAmong.includes(memberId)) {
      setSplitAmong(splitAmong.filter((id) => id !== memberId));
    } else {
      setSplitAmong([...splitAmong, memberId]);
    }
  };

  // Format rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Copy link ke clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link berhasil disalin!");
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">⏳ Memuat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>😢 Oops!</h1>
          <p>{error}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          ← Kembali ke Home
        </button>
      </div>
    );
  }

  // Password required screen
  if (requiresPassword) {
    return (
      <div className="container">
        <div className="header">
          <h1>🔒 {group?.name || "Grup Terkunci"}</h1>
          <p>Grup ini dilindungi password</p>
        </div>

        <form onSubmit={handleVerifyPassword}>
          {passwordError && (
            <div
              style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "10px",
                borderRadius: "10px",
                marginBottom: "15px",
              }}
            >
              {passwordError}
            </div>
          )}

          <div className="form-group">
            <label>Masukkan Password</label>
            <input type="password" placeholder="Password grup" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
          </div>

          <button type="submit" className="btn btn-primary">
            🔓 Buka Grup
          </button>
        </form>

        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          ← Kembali ke Home
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>💰 {group.name}</h1>
        <p>{group.description || "Split Bill"}</p>
      </div>

      {/* Share Box */}
      <div className="share-box">
        <p style={{ marginBottom: "5px", fontSize: "0.9rem" }}>Kode Grup:</p>
        <div className="share-code">{code}</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" style={{ width: "auto", padding: "8px 15px" }} onClick={copyLink}>
            📋 Copy Link
          </button>
          <button className="btn btn-secondary" style={{ width: "auto", padding: "8px 15px" }} onClick={() => setShowQR(!showQR)}>
            📱 {showQR ? "Tutup" : "QR Code"}
          </button>
          <button className="btn btn-success" style={{ width: "auto", padding: "8px 15px" }} onClick={handleExportWhatsApp}>
            💬 WhatsApp
          </button>
        </div>

        {/* QR Code */}
        {showQR && (
          <div style={{ marginTop: "15px", background: "white", padding: "15px", borderRadius: "10px", display: "inline-block" }}>
            <QRCode value={window.location.href} size={150} />
          </div>
        )}
      </div>

      {/* Summary Box */}
      {summary && summary.total_expense > 0 && (
        <div className="summary-box">
          <div className="summary-row">
            <span>Total Pengeluaran</span>
            <span>{formatRupiah(summary.total_expense)}</span>
          </div>
          <div className="summary-row">
            <span>Jumlah Orang</span>
            <span>{summary.member_count} orang</span>
          </div>
          <div className="summary-row">
            <span>Per Orang (rata-rata)</span>
            <span>{formatRupiah(summary.per_person)}</span>
          </div>
        </div>
      )}

      {/* Settlements */}
      {summary && summary.settlements && summary.settlements.length > 0 && (
        <>
          <div className="section-title">💸 Yang Harus Transfer</div>
          {summary.settlements.map((s, index) => {
            const paid = isSettlementPaid(s.from.id, s.to.id);
            return (
              <div key={index} className={`settlement-item ${paid ? "settlement-paid" : ""}`}>
                <span>{s.from.name}</span>
                <span className="settlement-arrow">→</span>
                <span>{s.to.name}</span>
                <span className="settlement-amount">{formatRupiah(s.amount)}</span>
                {paid ? (
                  <button className="btn-icon btn-paid" onClick={() => handleUnmarkPaid(s)} title="Batalkan konfirmasi">
                    ✅
                  </button>
                ) : (
                  <button className="btn-icon" onClick={() => handleMarkPaid(s)} title="Konfirmasi sudah transfer">
                    ⬜
                  </button>
                )}
              </div>
            );
          })}
          <div className="divider"></div>
        </>
      )}

      {/* Members */}
      <div className="section-title">👥 Anggota ({group.members?.length || 0})</div>

      {group.members && group.members.length > 0 ? (
        <div className="members-list">
          {group.members.map((member) => (
            <div key={member.id} className="member-tag-container">
              <span className="member-tag">{member.name}</span>
              <button className="btn-tiny" onClick={() => handleEditMember(member)} title="Edit">
                ✏️
              </button>
              <button className="btn-tiny" onClick={() => handleDeleteMember(member.id)} title="Hapus">
                🗑️
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">Belum ada anggota</div>
      )}

      {/* Form Tambah Member */}
      <form onSubmit={handleAddMember} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder={editingMember ? "Edit nama..." : "Nama anggota baru"}
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "2px solid #e0e0e0" }}
        />
        <button type="submit" className="btn btn-success" style={{ width: "auto", padding: "10px 20px" }}>
          {editingMember ? "💾 Simpan" : "+ Tambah"}
        </button>
        {editingMember && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "auto", padding: "10px 15px" }}
            onClick={() => {
              setEditingMember(null);
              setMemberName("");
            }}
          >
            ✕
          </button>
        )}
      </form>

      <div className="divider"></div>

      {/* Expenses */}
      <div className="section-title">📝 Pengeluaran ({group.expenses?.length || 0})</div>

      {group.expenses && group.expenses.length > 0 ? (
        group.expenses.map((expense) => (
          <div key={expense.id} className="card">
            <div className="card-header">
              <div>
                <span className="card-title">{expense.description}</span>
                {expense.category && <span className="category-badge">{expense.category}</span>}
              </div>
              <span className="card-amount">{formatRupiah(expense.amount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <small style={{ color: "#888" }}>
                Dibayar oleh: {expense.paid_by?.name || "Unknown"}
                {expense.split_type === "custom" && " (split tidak rata)"}
              </small>
              <div>
                <button className="btn-tiny" onClick={() => handleEditExpense(expense)} title="Edit">
                  ✏️
                </button>
                <button className="btn-tiny" onClick={() => handleDeleteExpense(expense.id)} title="Hapus">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">Belum ada pengeluaran</div>
      )}

      {/* Form Tambah Expense */}
      {group.members && group.members.length > 0 && (
        <form onSubmit={handleAddExpense}>
          <div className="card" style={{ marginTop: "15px" }}>
            <h4 style={{ marginBottom: "15px" }}>{editingExpense ? "✏️ Edit Pengeluaran" : "➕ Tambah Pengeluaran"}</h4>

            <div className="form-group">
              <label>Deskripsi</label>
              <input type="text" placeholder="Contoh: Bayar makan" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Jumlah (Rp)</label>
              <input type="number" placeholder="Contoh: 150000" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Dibayar oleh</label>
              <select value={expensePaidBy} onChange={(e) => setExpensePaidBy(e.target.value)}>
                <option value="">-- Pilih --</option>
                {group.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Kategori</label>
              <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipe Split</label>
              <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
                <option value="equal">Bagi Rata (semua ikut)</option>
                <option value="custom">Pilih siapa yang ikut</option>
              </select>
            </div>

            {/* Custom Split Selection */}
            {splitType === "custom" && (
              <div className="form-group">
                <label>Siapa yang ikut split?</label>
                <div className="split-selection">
                  {group.members.map((member) => (
                    <label key={member.id} className="checkbox-label">
                      <input type="checkbox" checked={splitAmong.includes(member.id)} onChange={() => toggleSplitMember(member.id)} />
                      {member.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-success">
              💾 {editingExpense ? "Update" : "Simpan"} Pengeluaran
            </button>

            {editingExpense && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: "10px" }}
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseDesc("");
                  setExpenseAmount("");
                  setExpensePaidBy("");
                  setExpenseCategory("");
                  setSplitType("equal");
                  setSplitAmong([]);
                }}
              >
                ✕ Batal Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="divider"></div>

      {/* Back Button */}
      <button className="btn btn-secondary" onClick={() => navigate("/")}>
        ← Buat Grup Baru
      </button>
    </div>
  );
}

export default GroupPage;
