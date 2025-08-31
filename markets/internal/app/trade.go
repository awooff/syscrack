package app

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type InstructionNamedType string

const (
	Buy      InstructionNamedType = "buy"
	Sell     InstructionNamedType = "sell"
	Transfer InstructionNamedType = "transfer"
)

type Trade struct {
	ID          uint `gorm:"primaryKey"`
	UserID      uint
	PortfolioID *uint
	MarketID    uint
	FundID      *uint

	Type       string
	Quantity   float64
	Price      float64
	TotalValue float64
	Status     string
	ExecutedAt *time.Time
	CreatedAt  time.Time
	UpdatedAt  time.Time

	User   User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Fund   *Fund  `gorm:"foreignKey:FundID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Market Market `gorm:"foreignKey:MarketID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	InstructionType InstructionNamedType `gorm:"-:all"`
}

func GetTradeByID(id uint) (*Trade, error) {
	var t Trade
	if err := DB.First(&t, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, err
	}
	return &t, nil
}

func PlaceBuyTrade(userID, marketID uint, fundID *uint, quantity, price float64) (*Trade, error) {
	trade := &Trade{
		UserID:          userID,
		MarketID:        marketID,
		FundID:          fundID,
		Type:            "buy",
		Quantity:        quantity,
		Price:           price,
		TotalValue:      quantity * price,
		Status:          "pending",
		InstructionType: Buy,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := DB.Create(trade).Error; err != nil {
		return nil, err
	}
	return trade, nil
}

func PlaceSellTrade(userID, marketID uint, fundID *uint, quantity, price float64) (*Trade, error) {
	trade := &Trade{
		UserID:          userID,
		MarketID:        marketID,
		FundID:          fundID,
		Type:            "sell",
		Quantity:        quantity,
		Price:           price,
		TotalValue:      quantity * price,
		Status:          "pending",
		InstructionType: Sell,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := DB.Create(trade).Error; err != nil {
		return nil, err
	}
	return trade, nil
}

func (t *Trade) ExecuteTrade() error {
	switch t.InstructionType {
	case Buy:
		return t.executeBuy()
	case Sell:
		return t.executeSell()
	case Transfer:
		return t.executeTransfer()
	default:
		return errors.New("invalid trade instruction")
	}
}

func (t *Trade) executeBuy() error {
	fmt.Printf("Executing buy for fund: %v\n", t.Fund)
	return nil
}

func (t *Trade) executeSell() error {
	fmt.Printf("Executing sell for fund: %v\n", t.Fund)
	return nil
}

func (t *Trade) executeTransfer() error {
	fmt.Printf("Executing transfer for fund: %v\n", t.Fund)
	return nil
}

