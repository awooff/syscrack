package app

import (
	"time"
)

type Portfolio struct {
	ID         ID        `gorm:"primaryKey;autoIncrement"`
	UserID     ID        `gorm:"not null;index"`
	Name       string    `gorm:"not null;size:255"`
	TotalValue uint64    `gorm:"not null;default:0"`
	IsActive   bool      `gorm:"not null;default:true"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`

	User     User                 `gorm:"foreignKey:UserID"`
	Holdings []PortfolioHoldingDB `gorm:"foreignKey:PortfolioID"`
}

func (Portfolio) TableName() string {
	return "portfolios"
}

type PortfolioHoldingDB struct {
	ID           ID        `gorm:"primaryKey;autoIncrement"`
	PortfolioID  ID        `gorm:"not null;index"`
	MarketID     ID        `gorm:"not null;index"`
	Quantity     uint64    `gorm:"not null"`
	AveragePrice uint64    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`

	Portfolio Portfolio `gorm:"foreignKey:PortfolioID"`
	Market    Market    `gorm:"foreignKey:MarketID"`
}

func (PortfolioHoldingDB) TableName() string {
	return "portfolio_holdings"
}
