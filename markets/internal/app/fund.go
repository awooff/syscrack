package app

import (
	"errors"
	"fmt"
	"math"
	"sort"
	"sync"
	"time"
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
	CreatedAt               time.Time
	TotalAssets             uint64
	PerformanceHistory      []PerformanceRecord
	IsActive                bool
	MaxInvestors            int
}

type PerformanceRecord struct {
	Date   time.Time
	Value  uint64
	Return Percentage
}

type FundStats struct {
	TotalInvestors    int
	AverageInvestment float64
	TotalAssets       uint64
	AnnualizedReturn  Percentage
	Volatility        float64
	MaxDrawdown       Percentage
}

// Existing functions (keeping your original implementations)
func (f Fund) CreateFund(opts Fund) (*Fund, error) {
	if opts.Id == 0 {
		return nil, errors.New("The ID of the fund cannot be 0!")
	}
	if opts.Name == "" {
		return nil, errors.New("Name of the fund cannot be empty!")
	}
	opts.CreatedAt = time.Now()
	opts.IsActive = true
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
			defer wg.Done()
			charge := float64(inv.AccountValue) * f.TotalFundCharge.ToFloat()
			mu.Lock()
			inv.AccountValue -= uint64(charge)
			results <- fmt.Sprintf("Charged %d: %.2f, New Account Value: %.2f", inv.Id, charge, float64(inv.AccountValue))
			mu.Unlock()
		}(&f.Investors[i])
	}
}

// New enhanced functions

// AddInvestor adds a new investor to the fund with validation
func (f *Fund) AddInvestor(investor User, initialInvestment uint64) error {
	if !f.IsActive {
		return errors.New("fund is not active")
	}

	if f.MaxInvestors > 0 && len(f.Investors) >= f.MaxInvestors {
		return errors.New("fund has reached maximum number of investors")
	}

	if initialInvestment < f.MinimumInvestmentAmount {
		return fmt.Errorf("initial investment %d is below minimum %d", initialInvestment, f.MinimumInvestmentAmount)
	}

	// Check if investor already exists
	for _, inv := range f.Investors {
		if inv.Id == investor.Id {
			return errors.New("investor already exists in this fund")
		}
	}

	f.Investors = append(f.Investors, investor)
	f.TotalAssets += initialInvestment
	return nil
}

// RemoveInvestor removes an investor from the fund
func (f *Fund) RemoveInvestor(investorId ID) error {
	for i, inv := range f.Investors {
		if inv.Id == investorId {
			f.Investors = append(f.Investors[:i], f.Investors[i+1:]...)
			return nil
		}
	}
	return errors.New("investor not found in fund")
}

// CalculateNetAssetValue calculates the current NAV of the fund
func (f *Fund) CalculateNetAssetValue() uint64 {
	totalValue := f.TotalAssets
	// Subtract management fees and other costs
	costs := float64(totalValue) * f.TotalFundCost.ToFloat()
	return uint64(float64(totalValue) - costs)
}

// GetFundStats returns comprehensive statistics about the fund
func (f *Fund) GetFundStats() FundStats {
	stats := FundStats{
		TotalInvestors: len(f.Investors),
		TotalAssets:    f.TotalAssets,
	}

	if len(f.Investors) > 0 {
		var totalInvestment uint64
		for _, inv := range f.Investors {
			totalInvestment += inv.AccountValue
		}
		stats.AverageInvestment = float64(totalInvestment) / float64(len(f.Investors))
	}

	if len(f.PerformanceHistory) > 1 {
		stats.AnnualizedReturn = f.calculateAnnualizedReturn()
		stats.Volatility = f.calculateVolatility()
		stats.MaxDrawdown = f.calculateMaxDrawdown()
	}

	return stats
}

// UpdatePerformance adds a new performance record
func (f *Fund) UpdatePerformance(value uint64) {
	var returnPct Percentage
	if len(f.PerformanceHistory) > 0 {
		lastValue := f.PerformanceHistory[len(f.PerformanceHistory)-1].Value
		if lastValue > 0 {
			returnPct = Percentage((float64(value-lastValue) / float64(lastValue)) * 100)
		}
	}

	record := PerformanceRecord{
		Date:   time.Now(),
		Value:  value,
		Return: returnPct,
	}

	f.PerformanceHistory = append(f.PerformanceHistory, record)
	f.TotalAssets = value
}

// GetTopInvestors returns the top N investors by account value
func (f *Fund) GetTopInvestors(n int) []User {
	// Create a copy to avoid modifying original slice
	investors := make([]User, len(f.Investors))
	copy(investors, f.Investors)

	// Sort by account value in descending order
	sort.Slice(investors, func(i, j int) bool {
		return investors[i].AccountValue > investors[j].AccountValue
	})

	if n > len(investors) {
		n = len(investors)
	}

	return investors[:n]
}

// DistributeDividends distributes dividends to all investors proportionally
func (f *Fund) DistributeDividends(totalDividend uint64) error {
	if len(f.Investors) == 0 {
		return errors.New("no investors to distribute dividends to")
	}

	totalInvestment := f.getTotalInvestorValue()
	if totalInvestment == 0 {
		return errors.New("total investment is zero")
	}

	var mu sync.Mutex
	var wg sync.WaitGroup

	for i := range f.Investors {
		wg.Add(1)
		go func(inv *User) {
			defer wg.Done()

			// Calculate proportional dividend
			proportion := float64(inv.AccountValue) / float64(totalInvestment)
			dividend := uint64(float64(totalDividend) * proportion)

			mu.Lock()
			inv.AccountValue += dividend
			mu.Unlock()
		}(&f.Investors[i])
	}

	wg.Wait()
	return nil
}

// RebalancePortfolio simulates portfolio rebalancing
func (f *Fund) RebalancePortfolio(targetAllocation map[string]Percentage) error {
	if !f.IsActive {
		return errors.New("cannot rebalance inactive fund")
	}

	// This is a simplified rebalancing simulation
	// In a real implementation, this would interact with actual portfolio holdings

	totalAllocation := Percentage(0)
	for _, allocation := range targetAllocation {
		totalAllocation += allocation
	}

	if totalAllocation.ToFloat() > 1.01 || totalAllocation.ToFloat() < 0.99 {
		return errors.New("target allocation must sum to 100%")
	}

	// Simulate rebalancing costs
	rebalancingCost := float64(f.TotalAssets) * 0.001 // 0.1% rebalancing cost
	f.TotalAssets -= uint64(rebalancingCost)

	return nil
}

// SetFundStatus activates or deactivates the fund
func (f *Fund) SetFundStatus(active bool) {
	f.IsActive = active
}

// GetInvestorCount returns the current number of investors
func (f *Fund) GetInvestorCount() int {
	return len(f.Investors)
}

// CalculateFundGrowth returns the growth percentage since inception
func (f *Fund) CalculateFundGrowth() Percentage {
	if len(f.PerformanceHistory) < 2 {
		return Percentage(0)
	}

	initialValue := f.PerformanceHistory[0].Value
	currentValue := f.PerformanceHistory[len(f.PerformanceHistory)-1].Value

	if initialValue == 0 {
		return Percentage(0)
	}

	growth := (float64(currentValue-initialValue) / float64(initialValue)) * 100
	return Percentage(growth)
}

// Private helper functions

func (f *Fund) getTotalInvestorValue() uint64 {
	var total uint64
	for _, inv := range f.Investors {
		total += inv.AccountValue
	}
	return total
}

func (f *Fund) calculateAnnualizedReturn() Percentage {
	if len(f.PerformanceHistory) < 2 {
		return Percentage(0)
	}

	firstRecord := f.PerformanceHistory[0]
	lastRecord := f.PerformanceHistory[len(f.PerformanceHistory)-1]

	yearsElapsed := lastRecord.Date.Sub(firstRecord.Date).Hours() / (24 * 365)
	if yearsElapsed <= 0 {
		return Percentage(0)
	}

	if firstRecord.Value == 0 {
		return Percentage(0)
	}

	totalReturn := float64(lastRecord.Value) / float64(firstRecord.Value)
	annualizedReturn := (math.Pow(totalReturn, 1/yearsElapsed) - 1) * 100

	return Percentage(annualizedReturn)
}

func (f *Fund) calculateVolatility() float64 {
	if len(f.PerformanceHistory) < 2 {
		return 0
	}

	returns := make([]float64, 0, len(f.PerformanceHistory)-1)
	for i := 1; i < len(f.PerformanceHistory); {
		prev := f.PerformanceHistory[i-1].Value
		curr := f.PerformanceHistory[i].Value
		if prev > 0 {
			ret := (float64(curr) - float64(prev)) / float64(prev)
			returns = append(returns, ret)
		}
	}

	if len(returns) == 0 {
		return 0
	}

	// Calculate standard deviation of returns
	sum := 0.0
	for _, ret := range returns {
		sum += ret
	}
	mean := sum / float64(len(returns))

	variance := 0.0
	for _, ret := range returns {
		variance += (ret - mean) * (ret - mean)
	}
	variance /= float64(len(returns))

	return math.Sqrt(variance) * 100 // Convert to percentage
}

// Utility functions for fund management

func FindFundById(funds []Fund, id ID) (*Fund, error) {
	for i := range funds {
		if funds[i].Id == id {
			return &funds[i], nil
		}
	}
	return nil, errors.New("fund not found")
}

func GetActiveFunds(funds []Fund) []Fund {
	var activeFunds []Fund
	for _, fund := range funds {
		if fund.IsActive {
			activeFunds = append(activeFunds, fund)
		}
	}
	return activeFunds
}

func SortFundsByPerformance(funds []Fund) []Fund {
	fundsCopy := make([]Fund, len(funds))
	copy(fundsCopy, funds)

	sort.Slice(fundsCopy, func(i, j int) bool {
		growthI := fundsCopy[i].CalculateFundGrowth()
		growthJ := fundsCopy[j].CalculateFundGrowth()
		return growthI.value > growthJ.value
	})

	return fundsCopy
}
