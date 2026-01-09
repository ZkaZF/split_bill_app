package main

import (
	"log"
	"net/http"
	"os"
	"split_bill_app/database"
	"split_bill_app/handlers"
	"strings"

	"github.com/gin-gonic/gin"
)

func main() {
	// Inisialisasi database
	database.InitDB()

	// Set Gin mode berdasarkan environment
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Buat Gin router
	r := gin.Default()

	// Middleware CORS (agar React bisa akses API)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Route untuk health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Split Bill API berjalan dengan baik! 🎉",
		})
	})

	// API Routes
	api := r.Group("/api")
	{
		// Categories
		api.GET("/categories", handlers.GetCategories)

		// Groups
		api.GET("/groups", handlers.GetAllGroups)
		api.POST("/groups", handlers.CreateGroup)
		api.GET("/groups/:code", handlers.GetGroup)
		api.POST("/groups/:code/verify", handlers.VerifyGroupPassword)
		api.GET("/groups/:code/export/whatsapp", handlers.ExportWhatsApp)

		// Members
		api.POST("/groups/:code/members", handlers.AddMember)
		api.PUT("/members/:id", handlers.UpdateMember)
		api.DELETE("/members/:id", handlers.DeleteMember)

		// Expenses
		api.POST("/groups/:code/expenses", handlers.AddExpense)
		api.PUT("/expenses/:id", handlers.UpdateExpense)
		api.DELETE("/expenses/:id", handlers.DeleteExpense)

		// Summary/Settlement
		api.GET("/groups/:code/summary", handlers.GetSummary)
		api.POST("/settlements/mark-paid", handlers.MarkSettlementPaid)
		api.POST("/settlements/unmark-paid", handlers.UnmarkSettlementPaid)
	}

	// Serve static files (React build) di production
	r.Static("/assets", "./static/assets")
	r.StaticFile("/vite.svg", "./static/vite.svg")
	
	// Serve index.html untuk semua route lain (SPA)
	r.NoRoute(func(c *gin.Context) {
		// Jika request ke API, return 404
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.JSON(404, gin.H{"error": "Not found"})
			return
		}
		// Untuk route lain, serve index.html (React SPA)
		c.File("./static/index.html")
	})

	// Dapatkan port dari environment variable (Render set ini)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	// Jalankan server
	log.Printf("🚀 Server berjalan di http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Server error:", err)
	}
}
