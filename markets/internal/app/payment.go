package app

import (
	"errors"
	"math"
	"time"
)

type Payment struct {
	ID              ID                   `gorm:"primaryKey;autoIncrement"`
	Invoice         string               `gorm:"uniqueIndex;not null;size:255"`
	RecipientID     *ID                  `gorm:"index"`
	UserSenderID    *ID                  `gorm:"index"`
	IsSystemSender  bool                 `gorm:"not null;default:false"`
	InstructionType InstructionNamedType `gorm:"type:varchar(50);not null"`
	Amount          float64               `gorm:"not null"`
	Status          string               `gorm:"not null;default:'pending';size:50"`
	TimeSent        *time.Time           `gorm:"index"`
	CreatedAt       time.Time            `gorm:"autoCreateTime"`
	UpdatedAt       time.Time            `gorm:"autoUpdateTime"`

	Recipient  *User `gorm:"foreignKey:RecipientID"`
	UserSender *User `gorm:"foreignKey:UserSenderID"`
}

func (Payment) TableName() string {
	return "payments"
}

func (p Payment) SendPayment(user User) (*Payment, error) {
	if user.ID == 0 {
		return nil, errors.New("UserID payment is going to is 0!")
	}

	if willOverflow(p.Amount, user.AccountValue) {
		return nil, errors.New("Adding these two very big numbers will result in an overflow!\nSplit up these payments!")
	}

	user.AccountValue += p.Amount
	return &p, nil
}

func (p Payment) GenerateInvoice() string {
	return "here"
}

func (p Payment) CancelPayment(pay *Payment) error {
	if pay == nil {
		return errors.New("Payment to cancel does not exist!")
	}
	pay = nil
	return nil
}

func willOverflow(a, b float64) bool {
    sum := a + b
    return math.IsInf(sum, 0)
}



