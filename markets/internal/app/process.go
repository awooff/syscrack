package app

import "time"

type Process struct {
	ID         string    `gorm:"primaryKey"`
	UserID     int       `gorm:"not null;index"`
	ComputerID string    `gorm:"not null;index"`
	GameID     string    `gorm:"not null;index"`
	IP         *string   `gorm:"size:45"`
	Type       string    `gorm:"not null;size:50"`
	Started    time.Time `gorm:"autoCreateTime"`
	Completion time.Time `gorm:"not null"`
	Data       string    `gorm:"type:jsonb"`
}

func (p *Process) Create() error {
	return DB.Create(p).Error
}

func (p *Process) Delete() error {
	return DB.Delete(p).Error
}

func (p *Process) Update(fields map[string]interface{}) error {
	return DB.Model(p).Where("id = ?", p.ID).Updates(fields).Error
}

func (p *Process) GetByType(procType string) error {
	return DB.Where("computer_id = ? AND game_id = ? AND type = ?", p.ComputerID, p.GameID, procType).First(p).Error
}

func (p *Process) GetProcessesByComputer(computerID, gameID string) ([]Process, error) {
	var processes []Process
	err := DB.Where("computer_id = ? AND game_id = ?", computerID, gameID).Find(&processes).Error
	return processes, err
}

