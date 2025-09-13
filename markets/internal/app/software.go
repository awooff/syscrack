package app

import "time"

type Software struct {
	ID         string    `gorm:"primaryKey"`
	UserID     int       `gorm:"not null;index"`
	ComputerID string    `gorm:"not null;index"`
	GameID     string    `gorm:"not null;index"`
	Type       string    `gorm:"not null;size:50"`
	Level      float64   `gorm:"not null"`
	Size       float64   `gorm:"not null"`
	Opacity    float64   `gorm:"not null"`
	Installed  bool      `gorm:"not null"`
	Executed   time.Time `gorm:"autoCreateTime"`
	Created    time.Time `gorm:"autoCreateTime"`
	Updated    time.Time `gorm:"autoUpdateTime"`
	Data       string    `gorm:"type:jsonb"`
}

func (s *Software) Create() error {
	return DB.Create(s).Error
}

func (s *Software) Delete() error {
	return DB.Delete(s).Error
}

func (s *Software) Update(fields map[string]interface{}) error {
	return DB.Model(s).Where("id = ?", s.ID).Updates(fields).Error
}

func (s *Software) Get(computerID, gameID string) ([]Software, error) {
	var software []Software
	err := DB.Where("computer_id = ? AND game_id = ?", computerID, gameID).Find(&software).Error
	return software, err
}
