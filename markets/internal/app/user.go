package app

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           ID        `gorm:"primaryKey;autoIncrement"`
	Name         string    `gorm:"uniqueIndex;not null;size:255"`
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

func GetAllUsers() ([]User, error) {
	var users []User
	if err := DB.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func GetUserByID(id ID) (*User, error) {
	var user User
	if err := DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, err
	}
	return &user, nil
}

func CreateUser(user *User) (*User, error) {
	if err := DB.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func UpdateUser(user *User) (*User, error) {
	if err := DB.Save(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func DeleteUser(id ID) error {
	return DB.Delete(&User{}, id).Error
}
