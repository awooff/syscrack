package app

import (
	"errors"
	"time"
)

type Payment struct {
	Id               ID
	Invoice          string
	Recipient        User
	UserSender       User
	SystemSender     struct{}
	InstructionType  InstructionNamedType
	Amount           uint64
	TimeSent         time.Time
	DateCreated      time.Time
	DateLastModified time.Time
}

func (p Payment) SendPayment(user User) (*Payment, error) {
	if user.ID == 0 {
		return nil, errors.New("UserID payment is going to is 0!")
	}

	if willOverflow(p.Amount, user.AccountValue) {
		return nil, errors.New("Adding these two very big numbers will result in an overflow!\nSplit up these payments!")
	}

	// This will definately never go wrong, ever.
	// Not even if we add two really big numbers together.
	user.AccountValue += p.Amount

	return &p, nil
}

func (p Payment) GenerateInvoice() string {
	return "here"
}

func willOverflow(a, b uint64) bool {
	return a > 0 && b > 0 && (a > (uint64(^b)))
}
