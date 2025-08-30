package app

import (
	"fmt"
	"markets/internal/logx"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	models := []interface{}{
		&User{},
		&Trade{},
		&Fund{},
		&Portfolio{},
		&HedgeFund{},
	}

	logx.Logger.Info().Msg("Starting database migration...")
	if err := db.AutoMigrate(models...); err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	logx.Logger.Info().Msg("Database migration completed :)")
	return nil
}
