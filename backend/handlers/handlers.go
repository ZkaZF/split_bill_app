package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"split_bill_app/database"
	"split_bill_app/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// generateCode = Generate kode unik untuk grup (misal: "ABC123")
func generateCode() string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	code := make([]byte, 6)
	for i := range code {
		code[i] = chars[rand.Intn(len(chars))]
	}
	return string(code)
}

// ============ GROUP HANDLERS ============

// CreateGroup = Buat grup baru
// POST /api/groups
func CreateGroup(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Password    string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Data tidak valid",
			"details": err.Error(),
		})
		return
	}

	group := models.Group{
		Code:        generateCode(),
		Name:        input.Name,
		Description: input.Description,
		Password:    input.Password,
		HasPassword: input.Password != "",
	}

	result := database.DB.Create(&group)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal membuat grup",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Grup berhasil dibuat!",
		"data":    group,
	})
}

// GetGroup = Ambil detail grup berdasarkan kode
// GET /api/groups/:code
func GetGroup(c *gin.Context) {
	code := c.Param("code")

	var group models.Group
	result := database.DB.Preload("Members").Preload("Expenses.PaidBy").Preload("Settlements.FromMember").Preload("Settlements.ToMember").Where("code = ?", code).First(&group)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Grup tidak ditemukan",
		})
		return
	}

	// Jika grup punya password, hanya return info dasar
	if group.HasPassword {
		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"id":           group.ID,
				"code":         group.Code,
				"name":         group.Name,
				"description":  group.Description,
				"has_password": group.HasPassword,
				"created_at":   group.CreatedAt,
			},
			"requires_password": true,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": group,
	})
}

// VerifyGroupPassword = Verifikasi password grup
// POST /api/groups/:code/verify
func VerifyGroupPassword(c *gin.Context) {
	code := c.Param("code")

	var input struct {
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password harus diisi",
		})
		return
	}

	var group models.Group
	result := database.DB.Preload("Members").Preload("Expenses.PaidBy").Preload("Settlements.FromMember").Preload("Settlements.ToMember").Where("code = ?", code).First(&group)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Grup tidak ditemukan",
		})
		return
	}

	// Cek password
	if group.Password != input.Password {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Password salah",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password benar!",
		"data":    group,
	})
}

// GetAllGroups = Ambil semua grup
// GET /api/groups
func GetAllGroups(c *gin.Context) {
	var groups []models.Group
	database.DB.Find(&groups)

	c.JSON(http.StatusOK, gin.H{
		"data": groups,
	})
}

// GetCategories = Ambil daftar kategori expense
// GET /api/categories
func GetCategories(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": models.ExpenseCategories,
	})
}

// ============ MEMBER HANDLERS ============

// AddMember = Tambah anggota ke grup
// POST /api/groups/:code/members
func AddMember(c *gin.Context) {
	code := c.Param("code")

	var group models.Group
	if err := database.DB.Where("code = ?", code).First(&group).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Grup tidak ditemukan",
		})
		return
	}

	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Nama harus diisi",
		})
		return
	}

	member := models.Member{
		GroupID: group.ID,
		Name:    input.Name,
	}

	database.DB.Create(&member)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Anggota berhasil ditambahkan!",
		"data":    member,
	})
}

// UpdateMember = Edit nama anggota
// PUT /api/members/:id
func UpdateMember(c *gin.Context) {
	id := c.Param("id")

	var member models.Member
	if err := database.DB.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Member tidak ditemukan",
		})
		return
	}

	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Nama harus diisi",
		})
		return
	}

	member.Name = input.Name
	database.DB.Save(&member)

	c.JSON(http.StatusOK, gin.H{
		"message": "Anggota berhasil diupdate!",
		"data":    member,
	})
}

// DeleteMember = Hapus anggota
// DELETE /api/members/:id
func DeleteMember(c *gin.Context) {
	id := c.Param("id")

	var member models.Member
	if err := database.DB.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Member tidak ditemukan",
		})
		return
	}

	// Cek apakah member punya expense
	var expenseCount int64
	database.DB.Model(&models.Expense{}).Where("paid_by_id = ?", id).Count(&expenseCount)
	if expenseCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Tidak bisa hapus member yang sudah punya pengeluaran",
		})
		return
	}

	database.DB.Delete(&member)

	c.JSON(http.StatusOK, gin.H{
		"message": "Anggota berhasil dihapus!",
	})
}

// ============ EXPENSE HANDLERS ============

// AddExpense = Tambah pengeluaran
// POST /api/groups/:code/expenses
func AddExpense(c *gin.Context) {
	code := c.Param("code")

	var group models.Group
	if err := database.DB.Where("code = ?", code).First(&group).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Grup tidak ditemukan",
		})
		return
	}

	var input struct {
		PaidByID    uint    `json:"paid_by_id" binding:"required"`
		Description string  `json:"description" binding:"required"`
		Amount      float64 `json:"amount" binding:"required,gt=0"`
		Category    string  `json:"category"`
		SplitType   string  `json:"split_type"`
		SplitAmong  []uint  `json:"split_among"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Data tidak valid",
			"details": err.Error(),
		})
		return
	}

	var member models.Member
	if err := database.DB.Where("id = ? AND group_id = ?", input.PaidByID, group.ID).First(&member).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Member tidak ditemukan di grup ini",
		})
		return
	}

	if input.SplitType == "" {
		input.SplitType = "equal"
	}

	splitAmongJSON := ""
	if len(input.SplitAmong) > 0 {
		bytes, _ := json.Marshal(input.SplitAmong)
		splitAmongJSON = string(bytes)
	}

	expense := models.Expense{
		GroupID:     group.ID,
		PaidByID:    input.PaidByID,
		Description: input.Description,
		Amount:      input.Amount,
		Category:    input.Category,
		SplitType:   input.SplitType,
		SplitAmong:  splitAmongJSON,
	}

	database.DB.Create(&expense)
	database.DB.Preload("PaidBy").First(&expense, expense.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pengeluaran berhasil ditambahkan!",
		"data":    expense,
	})
}

// UpdateExpense = Edit pengeluaran
// PUT /api/expenses/:id
func UpdateExpense(c *gin.Context) {
	id := c.Param("id")

	var expense models.Expense
	if err := database.DB.First(&expense, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Pengeluaran tidak ditemukan",
		})
		return
	}

	var input struct {
		PaidByID    uint    `json:"paid_by_id"`
		Description string  `json:"description"`
		Amount      float64 `json:"amount"`
		Category    string  `json:"category"`
		SplitType   string  `json:"split_type"`
		SplitAmong  []uint  `json:"split_among"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Data tidak valid",
		})
		return
	}

	if input.PaidByID > 0 {
		expense.PaidByID = input.PaidByID
	}
	if input.Description != "" {
		expense.Description = input.Description
	}
	if input.Amount > 0 {
		expense.Amount = input.Amount
	}
	if input.Category != "" {
		expense.Category = input.Category
	}
	if input.SplitType != "" {
		expense.SplitType = input.SplitType
	}
	if len(input.SplitAmong) > 0 {
		bytes, _ := json.Marshal(input.SplitAmong)
		expense.SplitAmong = string(bytes)
	}

	database.DB.Save(&expense)
	database.DB.Preload("PaidBy").First(&expense, expense.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Pengeluaran berhasil diupdate!",
		"data":    expense,
	})
}

// DeleteExpense = Hapus pengeluaran
// DELETE /api/expenses/:id
func DeleteExpense(c *gin.Context) {
	id := c.Param("id")

	var expense models.Expense
	if err := database.DB.First(&expense, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Pengeluaran tidak ditemukan",
		})
		return
	}

	database.DB.Delete(&expense)

	c.JSON(http.StatusOK, gin.H{
		"message": "Pengeluaran berhasil dihapus!",
	})
}

// ============ SETTLEMENT HANDLERS ============

// GetSummary = Hitung siapa hutang ke siapa
// GET /api/groups/:code/summary
func GetSummary(c *gin.Context) {
	code := c.Param("code")

	var group models.Group
	if err := database.DB.Preload("Members").Preload("Expenses").Preload("Settlements.FromMember").Preload("Settlements.ToMember").Where("code = ?", code).First(&group).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Grup tidak ditemukan",
		})
		return
	}

	var totalExpense float64
	for _, exp := range group.Expenses {
		totalExpense += exp.Amount
	}

	if len(group.Members) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"total_expense":   0,
				"per_person":      0,
				"member_count":    0,
				"settlements":     []models.SettlementCalc{},
				"member_balances": map[string]float64{},
			},
		})
		return
	}

	balances := make(map[uint]float64)
	memberMap := make(map[uint]models.Member)

	for _, member := range group.Members {
		balances[member.ID] = 0
		memberMap[member.ID] = member
	}

	for _, exp := range group.Expenses {
		balances[exp.PaidByID] += exp.Amount

		var splitMembers []uint
		if exp.SplitType == "custom" && exp.SplitAmong != "" {
			json.Unmarshal([]byte(exp.SplitAmong), &splitMembers)
		} else {
			for _, m := range group.Members {
				splitMembers = append(splitMembers, m.ID)
			}
		}

		if len(splitMembers) > 0 {
			share := exp.Amount / float64(len(splitMembers))
			for _, memberID := range splitMembers {
				balances[memberID] -= share
			}
		}
	}

	perPerson := totalExpense / float64(len(group.Members))
	settlements := calculateSettlements(balances, memberMap)

	memberBalances := make(map[string]float64)
	for id, balance := range balances {
		memberBalances[memberMap[id].Name] = balance
	}

	var dbSettlements []models.Settlement
	database.DB.Where("group_id = ?", group.ID).Preload("FromMember").Preload("ToMember").Find(&dbSettlements)

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"total_expense":      totalExpense,
			"per_person":         perPerson,
			"member_count":       len(group.Members),
			"settlements":        settlements,
			"member_balances":    memberBalances,
			"settlement_records": dbSettlements,
		},
	})
}

// MarkSettlementPaid = Tandai settlement sudah dibayar
// POST /api/settlements/mark-paid
func MarkSettlementPaid(c *gin.Context) {
	var input struct {
		GroupID      uint    `json:"group_id" binding:"required"`
		FromMemberID uint    `json:"from_member_id" binding:"required"`
		ToMemberID   uint    `json:"to_member_id" binding:"required"`
		Amount       float64 `json:"amount"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Data tidak valid",
		})
		return
	}

	var settlement models.Settlement
	result := database.DB.Where("group_id = ? AND from_member_id = ? AND to_member_id = ?",
		input.GroupID, input.FromMemberID, input.ToMemberID).First(&settlement)

	now := time.Now()
	if result.Error != nil {
		settlement = models.Settlement{
			GroupID:      input.GroupID,
			FromMemberID: input.FromMemberID,
			ToMemberID:   input.ToMemberID,
			Amount:       input.Amount,
			IsPaid:       true,
			PaidAt:       &now,
		}
		database.DB.Create(&settlement)
	} else {
		settlement.IsPaid = true
		settlement.PaidAt = &now
		database.DB.Save(&settlement)
	}

	database.DB.Preload("FromMember").Preload("ToMember").First(&settlement, settlement.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Transfer berhasil dikonfirmasi!",
		"data":    settlement,
	})
}

// UnmarkSettlementPaid = Batalkan konfirmasi transfer
// POST /api/settlements/unmark-paid
func UnmarkSettlementPaid(c *gin.Context) {
	var input struct {
		GroupID      uint `json:"group_id" binding:"required"`
		FromMemberID uint `json:"from_member_id" binding:"required"`
		ToMemberID   uint `json:"to_member_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Data tidak valid",
		})
		return
	}

	var settlement models.Settlement
	result := database.DB.Where("group_id = ? AND from_member_id = ? AND to_member_id = ?",
		input.GroupID, input.FromMemberID, input.ToMemberID).First(&settlement)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Settlement tidak ditemukan",
		})
		return
	}

	settlement.IsPaid = false
	settlement.PaidAt = nil
	database.DB.Save(&settlement)

	c.JSON(http.StatusOK, gin.H{
		"message": "Konfirmasi transfer dibatalkan!",
	})
}

// ExportWhatsApp = Generate text untuk share ke WhatsApp
// GET /api/groups/:code/export/whatsapp
func ExportWhatsApp(c *gin.Context) {
	code := c.Param("code")

	var group models.Group
	if err := database.DB.Preload("Members").Preload("Expenses.PaidBy").Where("code = ?", code).First(&group).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Grup tidak ditemukan",
		})
		return
	}

	var totalExpense float64
	for _, exp := range group.Expenses {
		totalExpense += exp.Amount
	}

	balances := make(map[uint]float64)
	memberMap := make(map[uint]models.Member)

	for _, member := range group.Members {
		balances[member.ID] = 0
		memberMap[member.ID] = member
	}

	for _, exp := range group.Expenses {
		balances[exp.PaidByID] += exp.Amount
		var splitMembers []uint
		if exp.SplitType == "custom" && exp.SplitAmong != "" {
			json.Unmarshal([]byte(exp.SplitAmong), &splitMembers)
		} else {
			for _, m := range group.Members {
				splitMembers = append(splitMembers, m.ID)
			}
		}
		if len(splitMembers) > 0 {
			share := exp.Amount / float64(len(splitMembers))
			for _, memberID := range splitMembers {
				balances[memberID] -= share
			}
		}
	}

	settlements := calculateSettlements(balances, memberMap)

	text := "💰 *" + group.Name + "*\n"
	if group.Description != "" {
		text += group.Description + "\n"
	}
	text += "\n"
	text += "📊 *Ringkasan*\n"
	text += "• Total: Rp " + formatNumber(totalExpense) + "\n"
	text += "• Peserta: " + strconv.Itoa(len(group.Members)) + " orang\n"
	if len(group.Members) > 0 {
		text += "• Per orang: Rp " + formatNumber(totalExpense/float64(len(group.Members))) + "\n"
	}
	text += "\n"

	if len(settlements) > 0 {
		text += "💸 *Yang Harus Transfer*\n"
		for _, s := range settlements {
			text += "• " + s.FromMember.Name + " → " + s.ToMember.Name + ": Rp " + formatNumber(s.Amount) + "\n"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": text,
	})
}

func formatNumber(n float64) string {
	str := strconv.FormatFloat(n, 'f', 0, 64)
	result := ""
	for i, c := range str {
		if i > 0 && (len(str)-i)%3 == 0 {
			result += "."
		}
		result += string(c)
	}
	return result
}

func calculateSettlements(balances map[uint]float64, memberMap map[uint]models.Member) []models.SettlementCalc {
	var settlements []models.SettlementCalc

	var debtors []struct {
		ID     uint
		Amount float64
	}
	var creditors []struct {
		ID     uint
		Amount float64
	}

	for id, balance := range balances {
		if balance < -0.01 {
			debtors = append(debtors, struct {
				ID     uint
				Amount float64
			}{id, -balance})
		} else if balance > 0.01 {
			creditors = append(creditors, struct {
				ID     uint
				Amount float64
			}{id, balance})
		}
	}

	i, j := 0, 0
	for i < len(debtors) && j < len(creditors) {
		debtor := &debtors[i]
		creditor := &creditors[j]

		amount := debtor.Amount
		if creditor.Amount < amount {
			amount = creditor.Amount
		}

		if amount > 0.01 {
			settlements = append(settlements, models.SettlementCalc{
				FromMember: memberMap[debtor.ID],
				ToMember:   memberMap[creditor.ID],
				Amount:     float64(int(amount*100)) / 100,
			})
		}

		debtor.Amount -= amount
		creditor.Amount -= amount

		if debtor.Amount < 0.01 {
			i++
		}
		if creditor.Amount < 0.01 {
			j++
		}
	}

	return settlements
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
