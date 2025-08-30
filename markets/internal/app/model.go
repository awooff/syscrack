package app

type Model struct {
	Id                             int64
	Name                           string
	IsOwnDIM                       bool
	DiscretionaryInvestmentManager []User
	FundCollection                 []Fund
}
