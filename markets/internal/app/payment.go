package app

import (
	"errors"
	"math"
	"time"
)

type Payment struct {
	ID              ID                   `gorm:"primaryKey;autoIncrement"`
	Invoice         string               `gorm:"uniqueIndex;not null;size:255"`
	RecipientID     ID                   `gorm:"index"`
	SenderID        ID                   `gorm:"index"`
	IsSystemSender  bool                 `gorm:"not null;default:false"`
	InstructionType InstructionNamedType `gorm:"type:varchar(50);not null"`
<<<<<<< HEAD
	Amount          float64              `gorm:"not null"`
=======
	Amount          float64               `gorm:"not null"`
>>>>>>> 73bba826655655c71cbabb95ead56e27cf93402c
	Status          string               `gorm:"not null;default:'pending';size:50"`
	TimeSent        *time.Time           `gorm:"index"`
	CreatedAt       time.Time            `gorm:"autoCreateTime"`
	UpdatedAt       time.Time            `gorm:"autoUpdateTime"`

	Recipient *User `gorm:"foreignKey:RecipientID"`
	Sender    *User `gorm:"foreignKey:SenderID"`
}

func (Payment) TableName() string {
	return "payments"
}

func (p *Payment) SendPayment(user User) (*Payment, error) {
	if user.ID == 0 {
		return nil, errors.New("UserID payment is going to is 0!")
	}

<<<<<<< HEAD
=======
	if willOverflow(p.Amount, user.AccountValue) {
		return nil, errors.New("Adding these two very big numbers will result in an overflow!\nSplit up these payments!")
	}

>>>>>>> 73bba826655655c71cbabb95ead56e27cf93402c
	user.AccountValue += p.Amount
	return p, nil
}

func (p *Payment) GenerateInvoice() string {
	return "here"
}

func (p Payment) CancelPayment(pay *Payment) error {
	if pay == nil {
		return errors.New("Payment to cancel does not exist!")
	}
	pay = nil
	return nil
}
<<<<<<< HEAD
=======

func willOverflow(a, b float64) bool {
    sum := a + b
    return math.IsInf(sum, 0)
}



>>>>>>> 73bba826655655c71cbabb95ead56e27cf93402c
