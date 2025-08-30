package app

import (
	"time"
)

type HedgeFund struct {
	ID                ID         `gorm:"primaryKey;autoIncrement"`
	FundID            ID         `gorm:"not null;uniqueIndex"`
	Strategy          string     `gorm:"not null;size:100"`
	RiskLevel         string     `gorm:"not null;size:20"`
	MinimumLockPeriod int        `gorm:"not null;default:0"`
	ManagementFee     Percentage `gorm:"type:decimal(5,4);not null;default:0"`
	PerformanceFee    Percentage `gorm:"type:decimal(5,4);not null;default:0"`
	HighWaterMark     uint64     `gorm:"not null;default:0"`
	CreatedAt         time.Time  `gorm:"autoCreateTime"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime"`

	Fund Fund `gorm:"foreignKey:FundID"`
}

func (HedgeFund) TableName() string {
	return "hedge_funds"
}
