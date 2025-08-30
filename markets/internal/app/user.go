package app

import (
	"time"

	"gorm.io/gorm"
)

/**
 * This is how we're going to refactor the main database.
 * Anything changed here *must* and will be changed in the javascript API.
 * @param ID {uint} - primaryKey, autoincremented
 * @param Email {string} - unique, autoincremented
 */
type User struct {
	gorm.Model
	ID            uint   `gorm:"primaryKey;autoIncrement"`
	Email         string `gorm:"unique"`
	Name          string `gorm:"default:'User'"`
	Password      string
	Salt          string
	LastAction    *time.Time      `gorm:"default:CURRENT_TIMESTAMP"`
	Created       *time.Time      `gorm:"autoCreateTime:"`
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
	AccountValue  uint64          `gorm:"not null"`
	TradeQueue    []Trade         `gorm:"foreignKey:UserID"`
}
