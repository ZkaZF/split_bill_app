import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { getGroup, addMember, updateMember, deleteMember, addExpense, updateExpense, deleteExpense, getSummary, getCategories, markSettlementPaid, unmarkSettlementPaid, exportWhatsApp, verifyGroupPassword } from "../api";
import Statistics from "../components/Statistics";
import Antigravity from "../components/Antigravity";

// SVG Icons as components
const WalletIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UnlockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReceiptIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17.5v-11" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const QrCodeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </svg>
);

const MessageCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const SquareIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const AlertCircleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const LoaderIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const FrownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const UserPlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

// Kategori default jika API belum ready
const DEFAULT_CATEGORIES = ["Makanan", "Transport", "Hiburan", "Belanja", "Akomodasi", "Kesehatan", "Lainnya"];

function GroupPage({ isDarkMode = true }) {
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
      <div className="group-page-wrapper">
        <div className="page-canvas"><Antigravity count={700} magnetRadius={14} ringRadius={9} waveSpeed={0.35} waveAmplitude={1.0} particleSize={1.5} lerpSpeed={0.055} color={"#19d0e8"} autoAnimate={true} particleVariance={1.0} rotationSpeed={0.08} depthFactor={0.6} pulseSpeed={2.5} particleShape={"capsule"} fieldStrength={10} /></div>
        <div className="container">
          <div className="loading">
            <LoaderIcon className="loading-icon" style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
            <span style={{ marginTop: 12 }}>Memuat...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-page-wrapper">
        <div className="page-canvas"><Antigravity count={700} magnetRadius={14} ringRadius={9} waveSpeed={0.35} waveAmplitude={1.0} particleSize={1.5} lerpSpeed={0.055} color={"#19d0e8"} autoAnimate={true} particleVariance={1.0} rotationSpeed={0.08} depthFactor={0.6} pulseSpeed={2.5} particleShape={"capsule"} fieldStrength={10} /></div>
        <div className="container">
          <div className="header">
            <h1><FrownIcon className="logo-icon" /><span>Oops!</span></h1>
            <p>{error}</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            <ArrowLeftIcon className="btn-icon" />
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  // Password required screen
  if (requiresPassword) {
    return (
      <div className="group-page-wrapper">
        <div className="page-canvas"><Antigravity count={700} magnetRadius={14} ringRadius={9} waveSpeed={0.35} waveAmplitude={1.0} particleSize={1.5} lerpSpeed={0.055} color={"#19d0e8"} autoAnimate={true} particleVariance={1.0} rotationSpeed={0.08} depthFactor={0.6} pulseSpeed={2.5} particleShape={"capsule"} fieldStrength={10} /></div>
        <div className="container">
          <div className="header">
            <h1>
              <LockIcon className="logo-icon" />
              <span>{group?.name || "Grup Terkunci"}</span>
            </h1>
            <p>Grup ini dilindungi password</p>
          </div>

          <form onSubmit={handleVerifyPassword}>
            {passwordError && (
              <div className="error-message">
                <AlertCircleIcon className="error-icon" />
                {passwordError}
              </div>
            )}

            <div className="form-group">
              <label>
                <LockIcon className="label-icon" />
                Masukkan Password
              </label>
              <input type="password" placeholder="Password grup" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
            </div>

            <button type="submit" className="btn btn-primary">
              <UnlockIcon className="btn-icon" />
              Buka Grup
            </button>
          </form>

          <button className="btn btn-secondary" onClick={() => navigate("/")} style={{ marginTop: 12 }}>
            <ArrowLeftIcon className="btn-icon" />
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-page-wrapper">
      <div className="page-canvas"><Antigravity count={700} magnetRadius={14} ringRadius={9} waveSpeed={0.35} waveAmplitude={1.0} particleSize={1.5} lerpSpeed={0.055} color={"#19d0e8"} autoAnimate={true} particleVariance={1.0} rotationSpeed={0.08} depthFactor={0.6} pulseSpeed={2.5} particleShape={"capsule"} fieldStrength={10} /></div>
      <div className="container">
      {/* Header */}
      <div className="header">
        <h1>
          <WalletIcon className="logo-icon" />
          <span className="logo-text">{group.name}</span>
        </h1>
        <p>{group.description || "Split Bill"}</p>
      </div>

      {/* Share Box */}
      <div className="share-box">
        <p style={{ marginBottom: "8px", fontSize: "0.9rem", opacity: 0.8 }}>Kode Grup:</p>
        <div className="share-code">{code}</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" style={{ width: "auto", padding: "10px 16px" }} onClick={copyLink}>
            <CopyIcon className="btn-icon" />
            Copy Link
          </button>
          <button className="btn btn-secondary" style={{ width: "auto", padding: "10px 16px" }} onClick={() => setShowQR(!showQR)}>
            <QrCodeIcon className="btn-icon" />
            {showQR ? "Tutup" : "QR Code"}
          </button>
          <button className="btn btn-success" style={{ width: "auto", padding: "10px 16px" }} onClick={handleExportWhatsApp}>
            <MessageCircleIcon className="btn-icon" />
            WhatsApp
          </button>
        </div>

        {/* QR Code */}
        {showQR && (
          <div style={{ marginTop: "20px", background: "white", padding: "16px", borderRadius: "var(--radius-md)", display: "inline-block" }}>
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

      {/* Statistics */}
      {group.expenses && group.expenses.length > 0 && (
        <>
          <Statistics expenses={group.expenses} members={group.members} isDarkMode={isDarkMode} />
          <div className="divider"></div>
        </>
      )}

      {/* Settlements */}
      {summary && summary.settlements && summary.settlements.length > 0 && (
        <>
          <div className="section-title">
            <SendIcon className="section-icon" />
            Yang Harus Transfer
          </div>
          {summary.settlements.map((s, index) => {
            const paid = isSettlementPaid(s.from.id, s.to.id);
            return (
              <div key={index} className={`settlement-item ${paid ? "settlement-paid" : ""}`}>
                <span className="settlement-name">{s.from.name}</span>
                <ArrowRightIcon className="settlement-arrow" />
                <span className="settlement-name">{s.to.name}</span>
                <span className="settlement-amount">{formatRupiah(s.amount)}</span>
                {paid ? (
                  <button className="btn-tiny btn-check-paid" onClick={() => handleUnmarkPaid(s)} title="Batalkan konfirmasi">
                    <CheckCircleIcon className="tiny-icon" />
                  </button>
                ) : (
                  <button className="btn-tiny btn-check-unpaid" onClick={() => handleMarkPaid(s)} title="Konfirmasi sudah transfer">
                    <SquareIcon className="tiny-icon" />
                  </button>
                )}
              </div>
            );
          })}
          <div className="divider"></div>
        </>
      )}

      {/* Members */}
      <div className="section-title">
        <UsersIcon className="section-icon" />
        Anggota ({group.members?.length || 0})
      </div>

      {group.members && group.members.length > 0 ? (
        <div className="members-list">
          {group.members.map((member) => (
            <div key={member.id} className="member-tag-container">
              <span className="member-tag">{member.name}</span>
              <button className="btn-tiny" onClick={() => handleEditMember(member)} title="Edit">
                <PencilIcon className="tiny-icon" style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
              </button>
              <button className="btn-tiny" onClick={() => handleDeleteMember(member.id)} title="Hapus">
                <TrashIcon className="tiny-icon" style={{ width: 16, height: 16 }} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">Belum ada anggota</div>
      )}

      {/* Form Tambah/Edit Member */}
      <form onSubmit={handleAddMember} className="member-form">
        <input
          className="form-input"
          type="text"
          placeholder={editingMember ? "Edit nama anggota..." : "Nama anggota baru"}
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
        />
        <div className="member-form-actions">
          <button type="submit" className="btn btn-primary" style={{ width: "auto", padding: "12px 20px" }}>
            {editingMember ? <SaveIcon className="btn-icon" /> : <UserPlusIcon className="btn-icon" />}
            {editingMember ? "Simpan" : "Tambah"}
          </button>
          {editingMember && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "auto", padding: "12px 16px" }}
              onClick={() => { setEditingMember(null); setMemberName(""); }}
            >
              <XIcon className="btn-icon" />
            </button>
          )}
        </div>
      </form>

      <div className="divider"></div>

      {/* Expenses */}
      <div className="section-title">
        <ReceiptIcon className="section-icon" />
        Pengeluaran ({group.expenses?.length || 0})
      </div>

      {group.expenses && group.expenses.length > 0 ? (
        group.expenses.map((expense) => (
          <div key={expense.id} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="card-title">{expense.description}</span>
                {expense.category && <span className="category-badge">{expense.category}</span>}
              </div>
              <span className="card-amount">{formatRupiah(expense.amount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <small style={{ color: "var(--color-text-muted)" }}>
                Dibayar oleh: {expense.paid_by?.name || "Unknown"}
                {expense.split_type === "custom" && " (split tidak rata)"}
              </small>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-tiny" onClick={() => handleEditExpense(expense)} title="Edit">
                  <PencilIcon className="tiny-icon" style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                </button>
                <button className="btn-tiny" onClick={() => handleDeleteExpense(expense.id)} title="Hapus">
                  <TrashIcon className="tiny-icon" style={{ width: 16, height: 16 }} />
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
          <div className="card" style={{ marginTop: "16px" }}>
            <h4 className="expense-form-title">
              {editingExpense ? <PencilIcon className="expense-form-icon" /> : <PlusIcon className="expense-form-icon" />}
              {editingExpense ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
            </h4>

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

            <button type="submit" className="btn btn-primary">
              <SaveIcon className="btn-icon" />
              {editingExpense ? "Update" : "Simpan"} Pengeluaran
            </button>

            {editingExpense && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: "12px" }}
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
                <XIcon className="btn-icon" />
                Batal Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="divider"></div>

      {/* Back Button */}
      <button className="btn btn-secondary" onClick={() => navigate("/")}>
        <ArrowLeftIcon className="btn-icon" />
        Buat Grup Baru
      </button>
    </div>
    </div>
  );
}

export default GroupPage;
