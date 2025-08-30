package app

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type InstructionNamedType string

type TradeQueue []*Trade

const (
	Buy      InstructionNamedType = "buy"
	Sell     InstructionNamedType = "sell"
	Transfer InstructionNamedType = "transfer"
)

type Trade struct {
	ID                ID                   `gorm:"primaryKey;autoIncrement"`
	UserID            ID                   `gorm:"not null;index"`
	MarketID          ID                   `gorm:"not null;index"`
	PortfolioID       *ID                  `gorm:"index"`
	Type              string               `gorm:"not null;size:10"`
	Quantity          uint64               `gorm:"not null"`
	Price             uint64               `gorm:"not null"`
	TotalValue        uint64               `gorm:"not null"`
	Status            string               `gorm:"not null;default:'pending';size:20"`
	ExecutedAt        *time.Time           `gorm:"index"`
	CreatedAt         time.Time            `gorm:"autoCreateTime"`
	BuyIntoTargetFund Fund                 `gorm:"foreignKey:FundID"`
	InstructionType   InstructionNamedType `gorm:"not null"`

	User      User       `gorm:"foreignKey:UserID"`
	Market    Market     `gorm:"foreignKey:MarketID"`
	Portfolio *Portfolio `gorm:"foreignKey:PortfolioID"`
}

// Error implements error.
func (t Trade) Error() string {
	panic("unimplemented")
}

func (t Trade) CreateNewTrade(id ID, fund Fund, instructionType InstructionNamedType) (*Trade, error) {
	if !isValidInstructionType(instructionType) {
		return nil, errors.New("invalid instruction type")
	}

	if t.BuyIntoTargetFund.ID == 0 {
		return nil, errors.New("Can't buy into fund ID 0!")
	}

	return &Trade{
		ID:                id,
		BuyIntoTargetFund: fund,
		InstructionType:   instructionType,
	}, nil
}

/**
 * In the real game, cancelling a trade needs to be a message that gets distributed
 * among the kafka brokers.
 */
func (t Trade) CancelPendingTrade(trade *Trade) error {
	if !isValidInstructionType(t.InstructionType) {
		return errors.New("The type of this sell isn't even valid, what the hell")
	}

	// delete it
	trade = nil

	return nil
}

func (t Trade) Info() Trade {
	return t
}

func isValidInstructionType(instructionType InstructionNamedType) bool {
	switch instructionType {
	case Buy, Sell, Transfer:
		return true
	}

	return false
}

func (t *Trade) executeBuy() error {
	fmt.Printf("Executing buy for fund: %v\n", t.BuyIntoTargetFund)
	return nil
}

func (t *Trade) executeSell() error {
	fmt.Printf("Executing sell for fund: %v\n", t.BuyIntoTargetFund)
	return nil
}

func (t *Trade) executeTransfer() error {
	fmt.Printf("Executing transfer for fund: %v\n", t.BuyIntoTargetFund)
	return nil
}

func (t Trade) String() string {
	return fmt.Sprintf("Trade ID: %v, Instruction: %s, Fund: %v", t.ID, t.InstructionType, t.BuyIntoTargetFund)
}

func (tq TradeQueue) DequeueTrade(trade Trade) error {
	if tq[trade.ID].ID == trade.ID {
		tq[trade.ID] = nil
	}

	return errors.New("Trade wasn't found")
}

func (tq TradeQueue) QueueTrade(trade *Trade) (*TradeQueue, error) {
	err := append(tq, trade)
	if err != nil {
		return nil, errors.New("failed adding trade to queue!")
	}

	return &tq, nil

}

// PlaceBuyTrade allows a user to buy into a fund or a market item
func PlaceBuyTrade(userID, marketID, fundID ID, quantity, price uint64) (*Trade, error) {
	trade := &Trade{
		UserID:            userID,
		MarketID:          marketID,
		BuyIntoTargetFund: Fund{ID: fundID},
		Type:              "buy",
		Quantity:          quantity,
		Price:             price,
		TotalValue:        quantity * price,
		Status:            "pending",
		InstructionType:   Buy,
	}

	if err := DB.Create(trade).Error; err != nil {
		return nil, err
	}

	return trade, nil
}

// PlaceSellTrade allows a user to sell out of a fund/market
func PlaceSellTrade(userID, marketID, fundID ID, quantity, price uint64) (*Trade, error) {
	trade := &Trade{
		UserID:            userID,
		MarketID:          marketID,
		BuyIntoTargetFund: Fund{ID: fundID},
		Type:              "sell",
		Quantity:          quantity,
		Price:             price,
		TotalValue:        quantity * price,
		Status:            "pending",
		InstructionType:   Sell,
	}

	if err := DB.Create(trade).Error; err != nil {
		return nil, err
	}

	return trade, nil
}

// ExecuteTrade will call the correct execution method
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

func GetTradeByID(id ID) (*Trade, error) {
	var t Trade
	if err := DB.First(&t, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	return &t, nil
}
