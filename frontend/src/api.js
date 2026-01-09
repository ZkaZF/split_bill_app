import axios from "axios";

// Base URL untuk API
const API_URL = "/api";

// Buat instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============ GROUP API ============

// Buat grup baru
export const createGroup = async (name, description, password = "") => {
  const response = await api.post("/groups", { name, description, password });
  return response.data;
};

// Ambil detail grup
export const getGroup = async (code) => {
  const response = await api.get(`/groups/${code}`);
  return response.data;
};

// Verifikasi password grup
export const verifyGroupPassword = async (code, password) => {
  const response = await api.post(`/groups/${code}/verify`, { password });
  return response.data;
};

// ============ CATEGORIES API ============

// Ambil daftar kategori
export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

// ============ MEMBER API ============

// Tambah member ke grup
export const addMember = async (code, name) => {
  const response = await api.post(`/groups/${code}/members`, { name });
  return response.data;
};

// Update member
export const updateMember = async (id, name) => {
  const response = await api.put(`/members/${id}`, { name });
  return response.data;
};

// Hapus member
export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};

// ============ EXPENSE API ============

// Tambah expense dengan fitur lengkap
export const addExpense = async (code, data) => {
  const response = await api.post(`/groups/${code}/expenses`, {
    paid_by_id: data.paidById,
    description: data.description,
    amount: parseFloat(data.amount),
    category: data.category || "",
    split_type: data.splitType || "equal",
    split_among: data.splitAmong || [],
  });
  return response.data;
};

// Update expense
export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

// Hapus expense
export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// ============ SUMMARY API ============

// Ambil summary/settlement
export const getSummary = async (code) => {
  const response = await api.get(`/groups/${code}/summary`);
  return response.data;
};

// ============ SETTLEMENT API ============

// Tandai sudah transfer
export const markSettlementPaid = async (groupId, fromMemberId, toMemberId, amount) => {
  const response = await api.post("/settlements/mark-paid", {
    group_id: groupId,
    from_member_id: fromMemberId,
    to_member_id: toMemberId,
    amount: amount,
  });
  return response.data;
};

// Batalkan konfirmasi transfer
export const unmarkSettlementPaid = async (groupId, fromMemberId, toMemberId) => {
  const response = await api.post("/settlements/unmark-paid", {
    group_id: groupId,
    from_member_id: fromMemberId,
    to_member_id: toMemberId,
  });
  return response.data;
};

// ============ EXPORT API ============

// Export ke WhatsApp
export const exportWhatsApp = async (code) => {
  const response = await api.get(`/groups/${code}/export/whatsapp`);
  return response.data;
};

export default api;
