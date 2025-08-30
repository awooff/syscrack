package app

import (
	"errors"
	"fmt"
)

type Percentage struct {
	value float64
}

func NewPercentage(value float64) (Percentage, error) {
	if value < 0 || value > 100 {
		return Percentage{}, errors.New("percentage must be between 0 and 100")
	}

	return Percentage{value: value}, nil
}

func (p Percentage) Value() float64 {
	return p.value
}

func (p Percentage) String() string {
	return fmt.Sprintf("%.2f%%", p.value)
}

func (p Percentage) ToFloat() float64 {
	return float64(p.value) / 100.0
}
