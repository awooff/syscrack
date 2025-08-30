package app

import (
	"errors"
	"fmt"
)

type InstructionNamedType string

const (
	Buy      InstructionNamedType = "buy"
	Sell     InstructionNamedType = "sell"
	Transfer InstructionNamedType = "transfer"
)

type Trade struct {
	Id                ID
	BuyIntoTargetFund Fund
	InstructionType   InstructionNamedType
	Owner             User
	PendingPayment    Payment
}

// Error implements error.
func (t Trade) Error() string {
	panic("unimplemented")
}

func (t Trade) CreateNewTrade(id ID, fund Fund, instructionType InstructionNamedType) (*Trade, error) {
	if !isValidInstructionType(instructionType) {
		return nil, errors.New("invalid instruction type")
	}

	if t.BuyIntoTargetFund.Id == 0 {
		return nil, errors.New("Can't buy into fund ID 0!")
	}

	return &Trade{
		Id:                id,
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
	return fmt.Sprintf("Trade ID: %v, Instruction: %s, Fund: %v", t.Id, t.InstructionType, t.BuyIntoTargetFund)
}
