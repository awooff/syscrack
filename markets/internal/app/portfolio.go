package app

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Portfolio struct {
	ID         ID `gorm:"primaryKey"`
	UserID     ID
	Name       string
	TotalValue float64
	IsActive   bool
	CreatedAt  time.Time
	UpdatedAt  time.Time

<<<<<<< HEAD
	Holdings []Holding `gorm:"foreignKey:PortfolioID"`
}

type Holding struct {
	ID          ID `gorm:"primaryKey"`
	PortfolioID ID
	FundID      ID
	Amount      float64
=======
	User     User                 `gorm:"foreignKey:UserID"`
	Holdings []PortfolioHolding `gorm:"foreignKey:PortfolioID"`
>>>>>>> 73bba826655655c71cbabb95ead56e27cf93402c
}

func (Portfolio) TableName() string {
	return "portfolios"
}

type PortfolioHolding struct {
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
