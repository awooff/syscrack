package app

import (
	"errors"
	"fmt"
	"sync"
)

type ID uint32

type Fund struct {
	Id                      ID
	FundManager             User
	Name                    string
	MinimumInvestmentAmount uint64
	TotalFundCharge         Percentage
	TotalFundCost           Percentage
	Investors               []User
}

func (f Fund) CreateFund(opts Fund) (*Fund, error) {
	if opts.Id == 0 {
		return nil, errors.New("The ID of the fund cannot be 0!")
	}

	if opts.Name == "" {
		return nil, errors.New("Name of the fund cannot be empty!")
	}

	return &opts, nil
}

func DeleteFund(funds []Fund, id ID) ([]Fund, error) {
	for i, fund := range funds {
		if fund.Id == id {
			return append(funds[:i], funds[i+1:]...), nil
		}
	}

	return funds, errors.New("Fund not found")
}

func (f Fund) Invest(amount uint64, fund Fund) (*Fund, error) {

	if amount < fund.MinimumInvestmentAmount {
		return nil, errors.New("You cannot invest less than the minimum investment amount!")
	}

	return &fund, nil
}

func (f *Fund) TakeCharges(wg *sync.WaitGroup, results chan<- string) {
	defer wg.Done()

	var mu sync.Mutex
	for i := range f.Investors {
		wg.Add(1)
		go func(inv *User) {
			defer wg.Done() // Signal that this goroutine is done
			charge := float64(inv.AccountValue) * f.TotalFundCharge.ToFloat()
			mu.Lock()                          // Lock to prevent race conditions
			inv.AccountValue -= uint64(charge) // Deduct the charge from the user's account value
			results <- fmt.Sprintf("Charged %d: %.2f, New Account Value: %.2f", inv.Id, charge, float64(inv.AccountValue))
			mu.Unlock() // Unlock after sending the result
		}(&f.Investors[i]) // Pass the address of the current investor
	}
}
