package app

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

/**
 * A portfolio is a collection of investments owned by a user.
 * It can contain multiple holdings in different markets.
 */
type Portfolio struct {
	ID         ID        `gorm:"primaryKey;autoIncrement"`
	UserID     ID        `gorm:"not null;index"`
	Name       string    `gorm:"not null;size:255"`
	TotalValue uint64    `gorm:"not null;default:0"`
	IsActive   bool      `gorm:"not null;default:true"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`

	Holdings []PortfolioHolding `gorm:"foreignKey:PortfolioID"`
}

func (Portfolio) TableName() string {
	return "portfolios"
}

type PortfolioHolding struct {
	ID           ID        `gorm:"primaryKey;autoIncrement"`
	PortfolioID  ID        `gorm:"not null;index"`
	FundID       ID        `gorm:"not null;index"`
	Quantity     uint64    `gorm:"not null"`
	AveragePrice uint64    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`

	Portfolio Portfolio `gorm:"foreignKey:PortfolioID"`
	Fund      Fund      `gorm:"foreignKey:FundID"`
}

func (PortfolioHolding) TableName() string {
	return "portfolio_holdings"
}

func GetPortfoliosByUser(userID ID) ([]Portfolio, error) {
	var portfolios []Portfolio
	if err := DB.Where("user_id = ?", userID).Find(&portfolios).Error; err != nil {
		return nil, err
	}
	return portfolios, nil
}

func GetPortfolioByID(id ID) (*Portfolio, error) {
	var portfolio Portfolio
	if err := DB.First(&portfolio, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, err
	}
	return &portfolio, nil
}

func CreatePortfolio(p *Portfolio) (*Portfolio, error) {
	if err := DB.Create(p).Error; err != nil {
		return nil, err
	}
	return p, nil
}

func UpdatePortfolio(p *Portfolio) (*Portfolio, error) {
	if err := DB.Save(p).Error; err != nil {
		return nil, err
	}
	return p, nil
}

func DeletePortfolio(id ID) error {
	return DB.Delete(&Portfolio{}, id).Error
}
