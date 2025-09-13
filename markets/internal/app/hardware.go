package app

type Hardware struct {
	ID         int     `gorm:"primaryKey;autoIncrement"`
	ComputerID string  `gorm:"not null;index"`
	GameID     string  `gorm:"not null;index"`
	Type       string  `gorm:"not null;size:20"`
	Strength   float64 `gorm:"not null"`
}

func (h *Hardware) Create() error {
	return DB.Create(h).Error
}

func (h *Hardware) Delete() error {
	return DB.Delete(h).Error
}

func (h *Hardware) Update(fields map[string]interface{}) error {
	return DB.Model(h).Where("id = ?", h.ID).Updates(fields).Error
}

func (h *Hardware) Get(computerID, gameID string) ([]Hardware, error) {
	var hardware []Hardware
	err := DB.Where("computer_id = ? AND game_id = ?", computerID, gameID).Find(&hardware).Error
	return hardware, err
}
