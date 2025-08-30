package app

import "time"

type Model struct {
	Id                             int64
	Name                           string
	IsOwnDIM                       bool
	DiscretionaryInvestmentManager []User
	FundCollection                 []Fund
	DateCreated                    time.Time
	DateLastModified               time.Time
}
