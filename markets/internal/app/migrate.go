package app

import (
	"fmt"
	log  "markets/internal/logx"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	models := []interface{}{
		&Trade{},
		&Fund{},
		&Portfolio{},
		&HedgeFund{},
	}

	log.Info().Msg("Starting database migration...")
	if err := db.AutoMigrate(models...); err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	log.Info().Msg("Database migration completed :)")
	return nil
}
