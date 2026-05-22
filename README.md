# 💰 Split Bill App

Aplikasi untuk menghitung patungan/split bill dengan teman-teman.

## Fitur

- [x] Buat grup patungan
- [x] Tambah, edit, dan hapus anggota grup
- [x] Catat, edit, dan hapus pengeluaran (siapa bayar, untuk apa, berapa)
- [x] Hitung otomatis siapa hutang ke siapa (Summary/Settlement)
- [x] Export ringkasan tagihan ke WhatsApp
- [x] Share link grup ke teman (dengan dukungan proteksi password grup)
- [x] UI interaktif dengan 3D animations (Three.js) & PWA support

## Tech Stack

- **Backend**: Go (Golang) + Gin Framework
- **Frontend**: React + Vite + TailwindCSS + Three.js
- **Database**: SQLite (development) / PostgreSQL (production)

## Cara Menjalankan

### Backend

```bash
cd backend
go run main.go
```

Server akan berjalan di `http://localhost:8081` (atau sesuai dengan *environment variable* `PORT`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## API Endpoints

### Groups
- `GET /api/groups` - Daftar seluruh grup
- `POST /api/groups` - Buat grup baru
- `GET /api/groups/:code` - Detail grup spesifik
- `POST /api/groups/:code/verify` - Verifikasi password grup
- `GET /api/groups/:code/export/whatsapp` - Export tagihan grup ke format WhatsApp
- `GET /api/groups/:code/summary` - Ringkasan perhitungan patungan (*settlement*)

### Members
- `POST /api/groups/:code/members` - Tambah anggota
- `PUT /api/members/:id` - Update anggota
- `DELETE /api/members/:id` - Hapus anggota

### Expenses
- `POST /api/groups/:code/expenses` - Tambah pengeluaran
- `PUT /api/expenses/:id` - Update pengeluaran
- `DELETE /api/expenses/:id` - Hapus pengeluaran

### Categories & Settlements
- `GET /api/categories` - Ambil daftar kategori pengeluaran
- `POST /api/settlements/mark-paid` - Tandai hutang sebagai lunas
- `POST /api/settlements/unmark-paid` - Batalkan status lunas
