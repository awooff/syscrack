package app

import (
	"errors"
	"time"
)

type Computer struct {
	ID        string
	UserID    ID
	GameID    string
	IP        string
	Data      map[string]interface{} // For title, description, etc.
	Hardware  []Hardware
	Software  []Software
	Processes []Process
}

// Exists checks if a computer exists by ID and game.
func ComputerExists(id string, gameID string) (bool, error) {
	var count int64
	err := DB.Model(&Computer{}).Where("id = ? AND game_id = ?", id, gameID).Count(&count).Error
	return count > 0, err
}

// Load loads the computer and its relations.
func (c *Computer) Load() error {
	if err := DB.Where("id = ? AND game_id = ?", c.ID, c.GameID).First(c).Error; err != nil {
		return err
	}
	// Load hardware
	if err := DB.Where("computer_id = ? AND game_id = ?", c.ID, c.GameID).Find(&c.Hardware).Error; err != nil {
		return err
	}
	// Load software
	if err := DB.Where("computer_id = ? AND game_id = ?", c.ID, c.GameID).Find(&c.Software).Error; err != nil {
		return err
	}
	// Load processes
	if err := DB.Where("computer_id = ? AND game_id = ?", c.ID, c.GameID).Find(&c.Processes).Error; err != nil {
		return err
	}
	return nil
}

// AddMemory adds a memory record for this computer.
func (c *Computer) AddLedger(key, memType string, value *float64, data interface{}) error {
	if c.ID == "" {
		return errors.New("computer not loaded")
	}
	memory := Ledger{
		UserID:     c.UserID,
		GameID:     c.GameID,
		Type:       memType,
		ComputerID: c.ID,
		Key:        key,
		Data:       data,
	}
	if value != nil {
		memory.Value = *value
	}
	return DB.Create(&memory).Error
}

// GetLogs returns logs for this computer.
func (c *Computer) GetLogs(limit, page int) ([]Logs, error) {
	var logs []Logs
	err := DB.Where("game_id = ? AND computer_id = ?", c.GameID, c.ID).
		Order("id desc").
		Limit(limit).
		Offset(page * limit).
		Find(&logs).Error
	return logs, err
}

// Log creates a log entry for this computer.
func (c *Computer) Log(message string, from *Computer) error {
	senderID := c.ID
	senderIP := c.IP
	if from != nil {
		senderID = from.ID
		senderIP = from.IP
	}
	log := Logs{
		UserID:     c.UserID,
		ComputerID: c.ID,
		SenderID:   senderID,
		SenderIp:   senderIP,
		GameID:     c.GameID,
		Message:    message,
		Created:    time.Now(),
	}
	return DB.Create(&log).Error
}

// ChangeIP sets a new IP for the computer.
func (c *Computer) ChangeIP(ip string) error {
	c.IP = ip
	return DB.Model(c).Where("id = ?", c.ID).Update("ip", ip).Error
}

// SetHardware sets or replaces hardware of a given type.
func (c *Computer) SetHardware(hwType string, strength float64) error {
	// Remove previous hardware of this type
	if err := DB.Where("computer_id = ? AND game_id = ? AND type = ?", c.ID, c.GameID, hwType).Delete(&Hardware{}).Error; err != nil {
		return err
	}
	hw := Hardware{
		ComputerID: c.ID,
		GameID:     c.GameID,
		Type:       hwType,
		Strength:   strength,
	}
	return DB.Create(&hw).Error
}

// GetHardware returns all hardware of a given type.
func (c *Computer) GetHardware(hwType string) ([]Hardware, error) {
	var hardware []Hardware
	err := DB.Where("computer_id = ? AND game_id = ? AND type = ?", c.ID, c.GameID, hwType).Find(&hardware).Error
	return hardware, err
}

// GetFirstHardwareType returns the first hardware of a given type.
func (c *Computer) GetFirstHardwareType(hwType string) (*Hardware, error) {
	var hardware Hardware
	err := DB.Where("computer_id = ? AND game_id = ? AND type = ?", c.ID, c.GameID, hwType).First(&hardware).Error
	if err != nil {
		return nil, err
	}
	return &hardware, nil
}

// Update updates the computer with the given data.
func (c *Computer) Update(data map[string]interface{}) error {
	return DB.Model(c).Where("id = ?", c.ID).Updates(data).Error
}
