package app

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitialiseDbConnection() {
	var err error

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Database connection established successfully")
}

func GetDB() *gorm.DB {
	if DB == nil {
		log.Fatal("Database not initialized. Call InitialiseDbConnection() first")
	}
	return DB
}

func CloseDB() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			log.Printf("Error getting database instance: %v", err)
			return
		}
		if err := sqlDB.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		} else {
			log.Println("Database connection closed")
		}
	}
}

func SetupDatabase() {
	InitialiseDbConnection()

	db := GetDB()

	err := db.AutoMigrate(
		&User{},
		&Fund{},
		&PerformanceRecordDB{},
		&FundInvestorDB{},
		&Payment{},
		&Market{},
		&TransactionDB{},
		&Portfolio{},
		&PortfolioHoldingDB{},
		&Trade{},
		&HedgeFund{},
	)

	if err != nil {
		panic(fmt.Sprintf("Failed to migrate database: %v", err))
	}

	createIndexes(db)
	seedInitialData(db)
}

func createIndexes(db *gorm.DB) {
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at)",
		"CREATE INDEX IF NOT EXISTS idx_performance_fund_date ON performance_records(fund_id, date DESC)",
		"CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_funds_active_assets ON funds(is_active, total_assets DESC)",
		"CREATE INDEX IF NOT EXISTS idx_trades_user_created ON trades(user_id, created_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_trades_market_executed ON trades(market_id, executed_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio ON portfolio_holdings(portfolio_id)",
	}

	for _, index := range indexes {
		if err := db.Exec(index).Error; err != nil {
			fmt.Printf("Warning: Failed to create index: %v\n", err)
		}
	}
}

func seedInitialData(db *gorm.DB) {
	var userCount int64
	db.Model(&User{}).Count(&userCount)

	if userCount == 0 {
		users := []User{
			{
				Name:     "admin",
				Email:        "admin@example.com",
				AccountValue: 1000000,
				IsActive:     true,
			},
			{
				Name:     "demo_user",
				Email:        "demo@example.com",
				AccountValue: 50000,
				IsActive:     true,
			},
		}

		for _, user := range users {
			if err := db.Create(&user).Error; err != nil {
				fmt.Printf("Warning: Failed to seed user %s: %v\n", user.Name, err)
			}
		}
	}

	var marketCount int64
	db.Model(&Market{}).Count(&marketCount)

	if marketCount == 0 {
		markets := []Market{
			{Name: "S&P 500", Symbol: "SPY", Price: 45000, IsActive: true, OpenTime: time.Now(), CloseTime: time.Now().Add(8 * time.Hour)},
			{Name: "NASDAQ", Symbol: "QQQ", Price: 38000, IsActive: true, OpenTime: time.Now(), CloseTime: time.Now().Add(8 * time.Hour)},
			{Name: "Bitcoin", Symbol: "BTC", Price: 4500000, IsActive: true, OpenTime: time.Now(), CloseTime: time.Now().Add(24 * time.Hour)},
			{Name: "Apple Inc", Symbol: "AAPL", Price: 15000, IsActive: true, OpenTime: time.Now(), CloseTime: time.Now().Add(8 * time.Hour)},
			{Name: "Tesla Inc", Symbol: "TSLA", Price: 25000, IsActive: true, OpenTime: time.Now(), CloseTime: time.Now().Add(8 * time.Hour)},
		}

		for _, market := range markets {
			if err := db.Create(&market).Error; err != nil {
				fmt.Printf("Warning: Failed to seed market %s: %v\n", market.Symbol, err)
			}
		}
	}
}

