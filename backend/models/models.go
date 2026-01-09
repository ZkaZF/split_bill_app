package models

import (
	"time"

	"gorm.io/gorm"
)

// Kategori expense
var ExpenseCategories = []string{
	"🍔 Makanan",
	"🚗 Transport",
	"🎬 Hiburan",
	"🛒 Belanja",
	"🏠 Akomodasi",
	"💊 Kesehatan",
	"📱 Lainnya",
}

// Group = Grup patungan (misal: "Makan Bareng 10 Jan")
type Group struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Code        string         `json:"code" gorm:"uniqueIndex;size:10"` // Kode unik untuk share
	Name        string         `json:"name" gorm:"size:100"`
	Description string         `json:"description" gorm:"size:255"`
	Password    string         `json:"-" gorm:"size:100"` // Password opsional, tidak di-return ke frontend
	HasPassword bool           `json:"has_password" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relasi
	Members     []Member     `json:"members,omitempty"`
	Expenses    []Expense    `json:"expenses,omitempty"`
	Settlements []Settlement `json:"settlements_data,omitempty"`
}

// Member = Anggota grup (orang yang ikut patungan)
type Member struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	GroupID   uint           `json:"group_id" gorm:"index"`
	Name      string         `json:"name" gorm:"size:100"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relasi
	Group    Group     `json:"-"`
	Expenses []Expense `json:"expenses,omitempty" gorm:"foreignKey:PaidByID"`
}

// Expense = Pengeluaran (siapa bayar apa, berapa)
type Expense struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	GroupID     uint           `json:"group_id" gorm:"index"`
	PaidByID    uint           `json:"paid_by_id"` // Member yang bayar
	Description string         `json:"description" gorm:"size:255"`
	Amount      float64        `json:"amount"`
	Category    string         `json:"category" gorm:"size:50"`         // Kategori expense
	SplitType   string         `json:"split_type" gorm:"default:equal"` // equal atau custom
	SplitAmong  string         `json:"split_among" gorm:"size:500"`     // JSON array of member IDs untuk split tidak rata
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relasi
	Group  Group  `json:"-"`
	PaidBy Member `json:"paid_by" gorm:"foreignKey:PaidByID"`
}

// Settlement = Hasil perhitungan siapa hutang ke siapa (disimpan di DB untuk tracking status)
type Settlement struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	GroupID      uint           `json:"group_id" gorm:"index"`
	FromMemberID uint           `json:"from_member_id"`
	ToMemberID   uint           `json:"to_member_id"`
	Amount       float64        `json:"amount"`
	IsPaid       bool           `json:"is_paid" gorm:"default:false"` // Sudah transfer atau belum
	PaidAt       *time.Time     `json:"paid_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relasi
	FromMember Member `json:"from" gorm:"foreignKey:FromMemberID"`
	ToMember   Member `json:"to" gorm:"foreignKey:ToMemberID"`
}

// SettlementCalc = Untuk perhitungan (tidak disimpan ke DB)
type SettlementCalc struct {
	FromMember Member  `json:"from"`
	ToMember   Member  `json:"to"`
	Amount     float64 `json:"amount"`
}
