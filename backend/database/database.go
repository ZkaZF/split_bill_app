package database

import (
	"log"
	"os"
	"split_bill_app/models"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB = Inisialisasi koneksi database
func InitDB() {
	var err error

	// Cek apakah ada DATABASE_URL (untuk production/Render)
	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL != "" {
		// Production: Gunakan PostgreSQL
		DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
		if err != nil {
			log.Fatal("Gagal koneksi ke PostgreSQL:", err)
		}
		log.Println("✅ PostgreSQL connected!")
	} else {
		// Development: Gunakan SQLite
		DB, err = gorm.Open(sqlite.Open("splitbill.db"), &gorm.Config{})
		if err != nil {
			log.Fatal("Gagal koneksi ke SQLite:", err)
		}
		log.Println("✅ SQLite connected!")
	}

	// Auto migrate = buat tabel otomatis berdasarkan struct
	err = DB.AutoMigrate(&models.Group{}, &models.Member{}, &models.Expense{}, &models.Settlement{})
	if err != nil {
		log.Fatal("Gagal migrate database:", err)
	}

	log.Println("✅ Database migrated!")
}
