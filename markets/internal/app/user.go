package app

import (
	"time"
)

type User struct {
	ID           ID        `gorm:"primaryKey;autoIncrement"`
	Username     string    `gorm:"uniqueIndex;not null;size:255"`
	Email        string    `gorm:"uniqueIndex;not null;size:255"`
	AccountValue uint64    `gorm:"not null;default:0"`
	IsActive     bool      `gorm:"not null;default:true"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`

	ManagedFunds     []Fund          `gorm:"foreignKey:FundManagerID"`
	InvestedFunds    []Fund          `gorm:"many2many:fund_investors;"`
	SentPayments     []PaymentDB     `gorm:"foreignKey:UserSenderID"`
	ReceivedPayments []PaymentDB     `gorm:"foreignKey:RecipientID"`
	Transactions     []TransactionDB `gorm:"foreignKey:UserID"`
	Portfolios       []Portfolio     `gorm:"foreignKey:UserID"`
}

func (User) TableName() string {
	return "users"
}

type TransactionDB struct {
	ID          ID        `gorm:"primaryKey;autoIncrement"`
	UserID      ID        `gorm:"not null;index"`
	FundID      *ID       `gorm:"index"`
	Type        string    `gorm:"not null;size:50"`
	Amount      uint64    `gorm:"not null"`
	Description string    `gorm:"size:500"`
	Status      string    `gorm:"not null;default:'completed';size:50"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`

	User User  `gorm:"foreignKey:UserID"`
	Fund *Fund `gorm:"foreignKey:FundID"`
}

func (TransactionDB) TableName() string {
	return "transactions"
}
