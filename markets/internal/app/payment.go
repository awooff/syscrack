package app

import (
	"errors"
	"time"
)

type Payment struct {
	ID              ID                   `gorm:"primaryKey;autoIncrement"`
	Invoice         string               `gorm:"uniqueIndex;not null;size:255"`
	RecipientID     ID                   `gorm:"index"`
	SenderID        ID                   `gorm:"index"`
	IsSystemSender  bool                 `gorm:"not null;default:false"`
	InstructionType InstructionNamedType `gorm:"type:varchar(50);not null"`
	Amount          float64              `gorm:"not null"`
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
