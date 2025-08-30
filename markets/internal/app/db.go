package app

import (
	"time"
)

// DNS model
type DNS struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	UserID      uint   `gorm:"not null"`
	ComputerID  string `gorm:"not null"`
	GameID      string `gorm:"not null"`
	Website     string
	Tags        string
	Description string    `gorm:"default:'No description available'"`
	Updated     time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Created     time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Computer    Computer  `gorm:"foreignKey:ComputerID"`
	Game        Game      `gorm:"foreignKey:GameID"`
	User        User      `gorm:"foreignKey:UserID"`
}

// AccountBook model
type AccountBook struct {
	ID         uint     `gorm:"primaryKey;autoIncrement"`
	UserID     uint     `gorm:"not null"`
	ComputerID string   `gorm:"not null"`
	MemoryID   string   `gorm:"not null"`
	Data       string   `gorm:"default:'{}'"`
	GameID     string   `gorm:"not null"`
	Computer   Computer `gorm:"foreignKey:ComputerID"`
	Game       Game     `gorm:"foreignKey:GameID"`
	Memory     Memory   `gorm:"foreignKey:MemoryID"`
	User       User     `gorm:"foreignKey:UserID"`
}

// Memory model
type Memory struct {
	ID          string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ComputerID  string `gorm:"not null"`
	GameID      string `gorm:"not null"`
	UserID      uint   `gorm:"not null"`
	Type        string
	Key         string
	Value       *float64
	Data        string        `gorm:"default:'{}'"`
	AccountBook []AccountBook `gorm:"foreignKey:MemoryID"`
	Computer    Computer      `gorm:"foreignKey:ComputerID"`
	Game        Game          `gorm:"foreignKey:GameID"`
	User        User          `gorm:"foreignKey:UserID"`
}

// Game model
type Game struct {
	ID          string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Name        string
	Started     time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Ended       *time.Time
	AccountBook []AccountBook `gorm:"foreignKey:GameID"`
	AddressBook []AddressBook `gorm:"foreignKey:GameID"`
	Computer    []Computer    `gorm:"foreignKey:GameID"`
	DNS         []DNS         `gorm:"foreignKey:GameID"`
	Hardware    []Hardware    `gorm:"foreignKey:GameID"`
	Logs        []Logs        `gorm:"foreignKey:GameID"`
	Memory      []Memory      `gorm:"foreignKey:GameID"`
	Process     []Process     `gorm:"foreignKey:GameID"`
	Profile     []Profile     `gorm:"foreignKey:GameID"`
	Quests      []Quests      `gorm:"foreignKey:GameID"`
	Software    []Software    `gorm:"foreignKey:GameID"`
	UserQuests  []UserQuests  `gorm:"foreignKey:GameID"`
}

// Profile model
type Profile struct {
	ID     uint   `gorm:"primaryKey;autoIncrement"`
	UserID uint   `gorm:"not null"`
	GameID string `gorm:"not null"`
	Data   string `gorm:"default:'{}'"`
	Game   Game   `gorm:"foreignKey:GameID"`
	User   User   `gorm:"foreignKey:UserID"`
}

// Quests model
type Quests struct {
	ID         string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	GameID     string `gorm:"not null"`
	Type       string
	Title      string
	Reward     *string
	Open       bool
	Game       Game         `gorm:"foreignKey:GameID"`
	UserQuests []UserQuests `gorm:"foreignKey:QuestID"`
}

// Session model
type Session struct {
	ID         string `gorm:"primaryKey;type:uuid"`
	UserID     uint   `gorm:"not null"`
	Token      string
	LastAction time.Time
	Created    time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Expires    time.Time
	User       User `gorm:"foreignKey:UserID"`
}

// Hardware model
type Hardware struct {
	ID         uint          `gorm:"primaryKey;autoIncrement"`
	ComputerID string        `gorm:"not null"`
	GameID     string        `gorm:"not null"`
	Type       HardwareTypes `gorm:"not null"`
	Strength   float64
	Computer   Computer `gorm:"foreignKey:ComputerID"`
	Game       Game     `gorm:"foreignKey:GameID"`
}

// AddressBook model
type AddressBook struct {
	ID         uint        `gorm:"primaryKey;autoIncrement"`
	UserID     uint        `gorm:"not null"`
	Access     AccessLevel `gorm:"not null"`
	ComputerID string      `gorm:"not null"`
	IP         string
	Data       string   `gorm:"default:'{}'"`
	GameID     string   `gorm:"not null"`
	Computer   Computer `gorm:"foreignKey:ComputerID"`
	Game       Game     `gorm:"foreignKey:GameID"`
	User       User     `gorm:"foreignKey:UserID"`
}

// UserQuests model
type UserQuests struct {
	ID        string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	QuestsID  string `gorm:"not null"`
	UserID    uint   `gorm:"not null"`
	GameID    string `gorm:"not null"`
	Completed bool
	Created   time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Updated   time.Time `gorm:"default:CURRENT_TIMESTAMP;autoUpdateTime"`
	Game      Game      `gorm:"foreignKey:GameID"`
	Quest     Quests    `gorm:"foreignKey:QuestsID"`
	User      User      `gorm:"foreignKey:UserID"`
}

// Computer model
type Computer struct {
	ID          string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID      uint   `gorm:"not null"`
	Type        string `gorm:"default:'npc'"`
	GameID      string `gorm:"not null"`
	IP          string
	Data        string        `gorm:"default:'{}'"`
	Created     time.Time     `gorm:"default:CURRENT_TIMESTAMP"`
	Updated     time.Time     `gorm:"default:CURRENT_TIMESTAMP;autoUpdateTime"`
	AccountBook []AccountBook `gorm:"foreignKey:ComputerID"`
	AddressBook []AddressBook `gorm:"foreignKey:ComputerID"`
	Game        Game          `gorm:"foreignKey:GameID"`
	User        User          `gorm:"foreignKey:UserID"`
	DNS         []DNS         `gorm:"foreignKey:ComputerID"`
	Hardware    []Hardware    `gorm:"foreignKey:ComputerID"`
	Logs        []Logs        `gorm:"foreignKey:ComputerID"`
	Memory      []Memory      `gorm:"foreignKey:ComputerID"`
	Process     []Process     `gorm:"foreignKey:ComputerID"`
	Software    []Software    `gorm:"foreignKey:ComputerID"`
}

// Software model
type Software struct {
	ID         string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID     uint   `gorm:"not null"`
	ComputerID string `gorm:"not null"`
	GameID     string `gorm:"not null"`
	Type       string
	Level      float64
	Size       float64
	Opacity    float64
	Installed  bool
	Executed   time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Created    time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Updated    time.Time `gorm:"default:CURRENT_TIMESTAMP;autoUpdateTime"`
	Data       string    `gorm:"default:'{}'"`
	Computer   Computer  `gorm:"foreignKey:ComputerID"`
	Game       Game      `gorm:"foreignKey:GameID"`
	User       User      `gorm:"foreignKey:UserID"`
}

// Process model
type Process struct {
	ID         string `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID     uint   `gorm:"not null"`
	ComputerID string `gorm:"not null"`
	IP         *string
	GameID     string `gorm:"not null"`
	Type       string
	Started    time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Completion time.Time
	Data       string
	Computer   Computer `gorm:"foreignKey:ComputerID"`
	Game       Game     `gorm:"foreignKey:GameID"`
	User       User     `gorm:"foreignKey:UserID"`
}

// Notifications model
type Notifications struct {
	ID      uint `gorm:"primaryKey;autoIncrement"`
	UserID  uint `gorm:"not null"`
	Type    string
	Content string
	Read    bool `gorm:"default:false"`
	User    User `gorm:"foreignKey:UserID"`
}

// Logs model
type Logs struct {
	ID         uint   `gorm:"primaryKey;autoIncrement"`
	UserID     uint   `gorm:"not null"`
	ComputerID string `gorm:"not null"`
	SenderID   string
	SenderIP   string
	GameID     string `gorm:"not null"`
	Message    string
	Created    time.Time `gorm:"default:CURRENT_TIMESTAMP"`
	Computer   Computer  `gorm:"foreignKey:ComputerID"`
	Game       Game      `gorm:"foreignKey:GameID"`
	User       User      `gorm:"foreignKey:UserID"`
}

// Define Enums
type Groups string

const (
	Guest Groups = "Guest"
	Admin Groups = "Admin"
)

type HardwareTypes string

const (
	CPU      HardwareTypes = "CPU"
	GPU      HardwareTypes = "GPU"
	RAM      HardwareTypes = "RAM"
	HDD      HardwareTypes = "HDD"
	Upload   HardwareTypes = "Upload"
	Download HardwareTypes = "Download"
)

type AccessLevel string

const (
	GOD AccessLevel = "GOD"
	FTP AccessLevel = "FTP"
)
