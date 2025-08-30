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
	TimeSent         *time.Time
	DateCreated      *time.Time
	DateLastModified *time.Time
}

type PaymentDB struct {
	ID              ID                   `gorm:"primaryKey;autoIncrement"`
	Invoice         string               `gorm:"uniqueIndex;not null;size:255"`
	RecipientID     *ID                  `gorm:"index"`
	UserSenderID    *ID                  `gorm:"index"`
	IsSystemSender  bool                 `gorm:"not null;default:false"`
	InstructionType InstructionNamedType `gorm:"type:varchar(50);not null"`
	Amount          uint64               `gorm:"not null"`
	Status          string               `gorm:"not null;default:'pending';size:50"`
	TimeSent        *time.Time           `gorm:"index"`
	CreatedAt       time.Time            `gorm:"autoCreateTime"`
	UpdatedAt       time.Time            `gorm:"autoUpdateTime"`

	Recipient  *User `gorm:"foreignKey:RecipientID"`
	UserSender *User `gorm:"foreignKey:UserSenderID"`
}

func (PaymentDB) TableName() string {
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

func willOverflow(a, b uint64) bool {
	return a > 0 && b > 0 && (a > (uint64(^b)))
}

