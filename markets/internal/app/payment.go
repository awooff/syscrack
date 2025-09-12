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

<<<<<<< HEAD
	Recipient  UserID `gorm:"foreignKey:RecipientID"`
	UserSender UserID `gorm:"foreignKey:UserSenderID"`
=======
	Recipient *User `gorm:"foreignKey:RecipientID"`
	Sender    *User `gorm:"foreignKey:SenderID"`
>>>>>>> 7af74f88d5bb9c9aa6642ec7bed83cdda6664d7d
}

func (Payment) TableName() string {
	return "payments"
}

<<<<<<< HEAD
func (p Payment) SendPayment(user UserID) (*Payment, error) {
	if user == 0 {
		return nil, errors.New("userID payment is going to is 0")
	}

	return &p, nil
=======
func (p *Payment) SendPayment(user User) (*Payment, error) {
	if willOverflow(p.Amount, user.AccountValue) {
		return nil, errors.New("Adding these two very big numbers will result in an overflow!\nSplit up these payments!")
	}

	user.AccountValue += p.Amount
	return p, nil
>>>>>>> 7af74f88d5bb9c9aa6642ec7bed83cdda6664d7d
}

func (p *Payment) GenerateInvoice() string {
	return "here"
}

func (p Payment) CancelPayment(pay *Payment) error {
	if pay != nil {
		return errors.New("payment to cancel does not exist")
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


>>>>>>> 7af74f88d5bb9c9aa6642ec7bed83cdda6664d7d
