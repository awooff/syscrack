package app

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Fund struct {
	ID                      ID         `gorm:"primaryKey;autoIncrement"`
	FundManagerID           ID         `gorm:"not null;index"`
	Name                    string     `gorm:"not null;size:255"`
	MinimumInvestmentAmount uint64     `gorm:"not null;default:0"`
	TotalFundCharge         Percentage `gorm:"type:decimal(5,4);not null;default:0"`
	TotalFundCost           Percentage `gorm:"type:decimal(5,4);not null;default:0"`
	TotalAssets             uint64     `gorm:"not null;default:0"`
	IsActive                bool       `gorm:"not null;default:true"`
	MaxInvestors            int        `gorm:"not null;default:0"`
	CreatedAt               time.Time  `gorm:"autoCreateTime"`
	UpdatedAt               time.Time  `gorm:"autoUpdateTime"`

	PerformanceHistory []PerformanceRecord `gorm:"foreignKey:FundID"`
	Holdings           []PortfolioHolding  `gorm:"foreignKey:FundID"`
}

func (Fund) TableName() string {
	return "funds"
}

type PerformanceRecord struct {
	ID        ID         `gorm:"primaryKey;autoIncrement"`
	FundID    ID         `gorm:"not null;index"`
	Date      time.Time  `gorm:"not null;index"`
	Value     uint64     `gorm:"not null"`
	Return    Percentage `gorm:"type:decimal(8,4);not null;default:0"`
	CreatedAt time.Time  `gorm:"autoCreateTime"`

	Fund Fund `gorm:"foreignKey:FundID"`
}

func (PerformanceRecord) TableName() string {
	return "performance_records"
}


func GetActiveFunds() ([]Fund, error) {
	var funds []Fund
	result := DB.Where("is_active = ?", true).Find(&funds)
	return funds, result.Error
}

func GetFundByID(id ID) (*Fund, error) {
	var fund Fund
	result := DB.First(&fund, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("fund not found")
	}
	return &fund, result.Error
}

func CreateFund(fund *Fund) (*Fund, error) {
	result := DB.Create(fund)
	return fund, result.Error
}

func UpdateFund(fund *Fund) (*Fund, error) {
	result := DB.Save(fund)
	return fund, result.Error
}

func DeleteFund(id ID) error {
	result := DB.Delete(&Fund{}, id)
	return result.Error
}
