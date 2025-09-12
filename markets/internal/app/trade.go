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
<<<<<<< HEAD
	ID                  ID                   `gorm:"primaryKey;autoIncrement"`
	UserID              ID                   `gorm:"not null;index"`
	MarketID            ID                   `gorm:"not null;index"`
	PortfolioID         ID                   `gorm:"index"`
	BuyIntoTargetFundID ID                   `gorm:"not null;index"`
	Type                string               `gorm:"not null;size:10"`
	Quantity            uint64               `gorm:"not null"`
	Price               uint64               `gorm:"not null"`
	TotalValue          uint64               `gorm:"not null"`
	Status              string               `gorm:"not null;default:'pending';size:20"`
	ExecutedAt          *time.Time           `gorm:"index"`
	CreatedAt           time.Time            `gorm:"autoCreateTime"`
	BuyIntoTargetFund   Fund                 `gorm:"foreignKey:BuyIntoTargetFundID;references:ID"`
	InstructionType     InstructionNamedType `gorm:"not null"`

	Portfolio *Portfolio `gorm:"foreignKey:PortfolioID"`
	Market    Market     `gorm:"foreignKey:MarketID"`
=======
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
>>>>>>> 7af74f88d5bb9c9aa6642ec7bed83cdda6664d7d
}

func GetTradeByID(id uint) (*Trade, error) {
	var t Trade
	if err := DB.First(&t, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, err
	}
<<<<<<< HEAD

	if t.BuyIntoTargetFund.ID == 0 {
		return nil, errors.New("can't buy into fund ID 0")
	}

	return &Trade{
		ID:                id,
		BuyIntoTargetFund: fund,
		InstructionType:   instructionType,
	}, nil
=======
	return &t, nil
>>>>>>> 7af74f88d5bb9c9aa6642ec7bed83cdda6664d7d
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

