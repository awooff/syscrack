package app

import (
	"errors"
	"time"
)

type Payment struct {
	ID              ID                   `gorm:"primaryKey;autoIncrement"`
	Invoice         string               `gorm:"uniqueIndex;not null;size:255"`
	RecipientID     *ID                  `gorm:"index"`
	UserSenderID    *ID                  `gorm:"index"`
	IsSystemSender  bool                 `gorm:"not null;default:false"`
	InstructionType InstructionNamedType `gorm:"type:varchar(50);not null"`
	Amount          float64              `gorm:"not null"`
	Status          string               `gorm:"not null;default:'pending';size:50"`
	TimeSent        *time.Time           `gorm:"index"`
	CreatedAt       time.Time            `gorm:"autoCreateTime"`
	UpdatedAt       time.Time            `gorm:"autoUpdateTime"`

	Recipient  UserID `gorm:"foreignKey:RecipientID"`
	UserSender UserID `gorm:"foreignKey:UserSenderID"`
}

func (Payment) TableName() string {
	return "payments"
}

func (p Payment) SendPayment(user UserID) (*Payment, error) {
	if user == 0 {
		return nil, errors.New("userID payment is going to is 0")
	}

	return &p, nil
}

func (p Payment) GenerateInvoice() string {
	return "here"
}

func (p Payment) CancelPayment(pay *Payment) error {
	if pay != nil {
		return errors.New("payment to cancel does not exist")
	}
	pay = nil
	return nil
}
