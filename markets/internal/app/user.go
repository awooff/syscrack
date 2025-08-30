package app

import (
	"time"
)

// User model
type User struct {
	ID            uint   `gorm:"primaryKey;autoIncrement"`
	Email         string `gorm:"unique"`
	Name          string `gorm:"default:'User'"`
	Password      string
	Salt          string
	LastAction    time.Time       `gorm:"default:CURRENT_TIMESTAMP"`
	Created       time.Time       `gorm:"default:CURRENT_TIMESTAMP"`
	RefreshToken  *string         `gorm:"default:null"`
	Group         Groups          `gorm:"default:'User'"`
	AccountBook   []AccountBook   `gorm:"foreignKey:UserID"`
	AddressBook   []AddressBook   `gorm:"foreignKey:UserID"`
	Computer      []Computer      `gorm:"foreignKey:UserID"`
	DNS           []DNS           `gorm:"foreignKey:UserID"`
	Logs          []Logs          `gorm:"foreignKey:UserID"`
	Memory        []Memory        `gorm:"foreignKey:UserID"`
	Notifications []Notifications `gorm:"foreignKey:UserID"`
	Process       []Process       `gorm:"foreignKey:UserID"`
	Profile       []Profile       `gorm:"foreignKey:UserID"`
	Session       []Session       `gorm:"foreignKey:UserID"`
	Software      []Software      `gorm:"foreignKey:UserID"`
	UserQuests    []UserQuests    `gorm:"foreignKey:UserID"`
	AccountValue  uint64          `gorm:not null:default:0`
}

func (u User) TakeFundCharge(fund Fund) string {
	charge := float64(u.AccountValue) * fund.TotalFundCharge.ToFloat()
	u.AccountValue -= uint64(charge)
	return "yes"
}
