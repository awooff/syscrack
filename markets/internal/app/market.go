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
	TradingFunds         []Fund
	HedgeFunds           []HedgeFund
	MarketCap            uint64
	Volatility           Volatility
	BidAsk               Percentage
	Buyers               uint64
	Sellers              uint64
	TimeSeriesGraph      struct{}
	TotalRunningLifetime time.Duration
	OpenOfBusinessHours  time.Time
	CloseOfBusinessHours time.Time
	IsClosed             bool
	WillOpen             bool
}

func (m Market) CloseForBusiness(currentTime time.Time) (*Market, error) {
	if currentTime != m.CloseOfBusinessHours {
		return nil, errors.New("This is not yet the close of business!")
	}

	m.IsClosed = true
	return &m, nil
}

func (m Market) OpenForBusiness(currentTime time.Time) (*Market, error) {
	if currentTime != m.OpenOfBusinessHours {
		return nil, errors.New("It's not yet time for business to open!")
	}

	m.IsClosed = false
	return &m, nil
}

func (m Market) SuspendAllMarketTrades() (*Market, *[]Trade, error) {
	// TODO: not yet implemented.
	// Wait until we bring in the Kafka broker to be able to start creating
	// Kafka consumers for the trades and group them to our users.
	return &m, nil, nil
}
