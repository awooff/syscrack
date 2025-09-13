package app

import (
	"errors"
	"fmt"
)

type ID int
type UserID uint32

const (
	InstructionTypeTransfer InstructionNamedType = "transfer"
	InstructionTypeDeposit  InstructionNamedType = "deposit"
	InstructionTypeWithdraw InstructionNamedType = "withdraw"
	InstructionTypeRefund   InstructionNamedType = "refund"
)

type Percentage struct {
	value float64
}

func NewPercentage(value float64) Percentage {
	if value < 0 {
		return Percentage{value: 0}
	}
	if value > 100 {
		return Percentage{value: 100}
	}
	return Percentage{value: value}
}

func NewPercentageFromDecimal(decimal float64) Percentage {
	return NewPercentage(decimal * 100)
}

func (p Percentage) Value() float64 {
	return p.value
}

func (p Percentage) String() string {
	return fmt.Sprintf("%.2f%%", p.value)
}

func (p Percentage) ToFloat() float64 {
	return p.value / 100.0
}

func (p Percentage) ToDecimal() float64 {
	return p.ToFloat()
}

func (p Percentage) Add(other Percentage) Percentage {
	return NewPercentage(p.value + other.value)
}

func (p Percentage) Subtract(other Percentage) Percentage {
	return NewPercentage(p.value - other.value)
}

func (p Percentage) Multiply(factor float64) Percentage {
	return NewPercentage(p.value * factor)
}

func (p Percentage) IsZero() bool {
	return p.value == 0
}

func (p Percentage) IsGreaterThan(other Percentage) bool {
	return p.value > other.value
}

func (p Percentage) IsLessThan(other Percentage) bool {
	return p.value < other.value
}

func (p Percentage) Equals(other Percentage) bool {
	return p.value == other.value
}

func (p *Percentage) Scan(value interface{}) error {
	if value == nil {
		p.value = 0
		return nil
	}

	switch v := value.(type) {
	case float64:
		p.value = v
	case float32:
		p.value = float64(v)
	case int64:
		p.value = float64(v)
	case string:
		var f float64
		if _, err := fmt.Sscanf(v, "%f", &f); err != nil {
			return err
		}
		p.value = f
	default:
		return errors.New("cannot scan into Percentage")
	}
	return nil
}
