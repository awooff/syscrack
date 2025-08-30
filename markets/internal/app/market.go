package app

import (
	"errors"
	"time"
)

type Volatility struct {
	Stable      struct{}
	Fluctuating struct{}
	Dangerous   struct{}
}

type Market struct {
	ID          ID         `gorm:"primaryKey;autoIncrement"`
	Name        string     `gorm:"not null;size:255"`
	Symbol      string     `gorm:"uniqueIndex;not null;size:10"`
	Price       uint64     `gorm:"not null"`
	MarketCap   uint64     `gorm:"not null;default:0"`
	BidAsk      Percentage `gorm:"type:decimal(8,4);not null;default:0"`
	Buyers      uint64     `gorm:"not null;default:0"`
	Sellers     uint64     `gorm:"not null;default:0"`
	IsActive    bool       `gorm:"not null;default:true"`
	IsClosed    bool       `gorm:"not null;default:false"`
	OpenTime    time.Time  `gorm:"not null"`
	CloseTime   time.Time  `gorm:"not null"`
	LastUpdated time.Time  `gorm:"autoUpdateTime"`
	CreatedAt   time.Time  `gorm:"autoCreateTime"`

	// Business logic fields (not persisted to DB with gorm:"-")
	TradingFunds         []Fund        `gorm:"-"`
	HedgeFunds           []HedgeFund   `gorm:"-"`
	Volatility           Volatility    `gorm:"-"`
	TimeSeriesGraph      struct{}      `gorm:"-"`
	TotalRunningLifetime time.Duration `gorm:"-"`
	WillOpen             bool          `gorm:"-"`

	// Foreign key relationships
	Trades []Trade `gorm:"foreignKey:MarketID"`
}

// TableName specifies the table name for GORM
func (Market) TableName() string {
	return "markets"
}

// Business logic methods
func (m Market) CloseForBusiness(currentTime time.Time) (*Market, error) {
	if currentTime != m.CloseTime {
		return nil, errors.New("This is not yet the close of business!")
	}
	m.IsClosed = true
	return &m, nil
}

func (m Market) OpenForBusiness(currentTime time.Time) (*Market, error) {
	if currentTime != m.OpenTime {
		return nil, errors.New("It's not yet time for business to open!")
	}
	m.IsClosed = false
	return &m, nil
}

func (m Market) SuspendAllMarketTrades() (*Market, *[]Trade, error) {
	return &m, nil, nil
}

// Helper methods for business hours (using the GORM field names)
func (m Market) OpenOfBusinessHours() time.Time {
	return m.OpenTime
}

func (m Market) CloseOfBusinessHours() time.Time {
	return m.CloseTime
}
