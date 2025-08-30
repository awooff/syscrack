package app

import (
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitialiseDbConnection() *gorm.DB {
	db, err := gorm.Open(postgres.Open(os.Getenv("DATABASE_URL")))
	if err != nil {
		panic(err)
	}

	// Auto migrate the next things in the market
	db.AutoMigrate(&Market{})

	return db
}
