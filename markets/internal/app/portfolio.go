package app

import "errors"

type Portfolio struct {
	Id            ID
	Owner         User
	Value         int64
	OngoingTrades []Trade
	Funds         []Fund
	Models        []Model
}

func (p Portfolio) CreateNewPortfolio(pf Portfolio) (*Portfolio, error) {
	if pf.Id == 0 {
		return nil, errors.New("Can't create a portfolio with ID 0!")
	}

	if pf.Owner.ID == 0 {
		return nil, errors.New("Owner ID of the portfolio cannot be 0!")
	}

	// more disgusting hardcoded values
	return &Portfolio{
			Id:            3884444,
			Owner:         User{},
			Value:         120_000_000,
			OngoingTrades: []Trade{},
			Funds:         []Fund{},
			Models:        []Model{},
		},
		nil
}

func (p Portfolio) DeletePortfolio(pf []*Portfolio) error {
	for i := range pf {
		pf[i] = nil
	}

	return nil
}
