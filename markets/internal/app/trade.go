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
}

func NewTrade(id ID, fund Fund, instructionType InstructionNamedType) (Trade, error) {
	if !isValidInstructionType(instructionType) {
		return Trade{}, errors.New("invalid instruction type")
	}

	return Trade{
		Id:                id,
		BuyIntoTargetFund: fund,
		InstructionType:   instructionType,
	}, nil
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
