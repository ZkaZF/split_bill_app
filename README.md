# 💰 Split Bill App

Aplikasi untuk menghitung patungan/split bill dengan teman-teman.

## Fitur

- [ ] Buat grup patungan
- [ ] Tambah anggota ke grup
- [ ] Catat pengeluaran (siapa bayar, untuk apa, berapa)
- [ ] Hitung otomatis siapa hutang ke siapa
- [ ] Share link grup ke teman

## Tech Stack

- **Backend**: Go (Golang) + Gin Framework
- **Frontend**: React + TailwindCSS
- **Database**: SQLite (development) / PostgreSQL (production)

## Cara Menjalankan

### Backend

```bash
cd backend
go run main.go
```

Server akan berjalan di http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di http://localhost:5173

## API Endpoints (akan dibuat)

- `GET /api/groups` - Daftar grup
- `POST /api/groups` - Buat grup baru
- `GET /api/groups/:id` - Detail grup
- `POST /api/groups/:id/members` - Tambah anggota
- `POST /api/groups/:id/expenses` - Tambah pengeluaran
- `GET /api/groups/:id/summary` - Ringkasan hutang
