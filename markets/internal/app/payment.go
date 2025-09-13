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

func (p *Payment) CanAfford() (bool, error) {
	account, err := p.GetBankAccount(p.SenderID)
	if err != nil {
		return false, err
	}
	if account == nil {
		return false, errors.New("bank account is invalid")
	}
	balance, err := p.GetUserBalance(p.SenderID)
	if err != nil {
		return false, err
	}
	return balance-p.Amount >= 0, nil
}

func (p *Payment) Deposit() (float64, error) {
	balance, err := p.GetUserBalance(p.RecipientID)
	if err != nil {
		return 0, err
	}
	amount := balance + p.Amount
	
	return amount, err
}

func (p *Payment) Withdraw() error {
	balance, err := p.GetUserBalance(p.SenderID)
	if err != nil {
		return err
	}
	newBalance := balance - p.Amount
	if newBalance < 0 {
		newBalance = 0
	}
	return err
}

func (p *Payment) GetBankAccount(userID ID) (*BankAccount, error) {
	var account BankAccount
	if err := DB.Where("user_id = ?", userID).First(&account).Error; err != nil {
		return nil, err
	}
	return &account, nil
}

func (p *Payment) GetUserBalance(userID ID) (float64, error) {
	ledgers, err := GetLedgersByUser(userID)
	if err != nil {
		return 0, err
	}
	if len(ledgers) == 0 {
		return 0, nil
	}

	// assuming the last ledger entry has the latest balance
	return ledgers[len(ledgers)-1].Value, nil
}
