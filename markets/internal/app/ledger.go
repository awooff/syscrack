package app

type Ledger struct {
	ID          string `gorm:"primaryKey"`
	ComputerID  string `gorm:"not null;index"`
	GameID      string `gorm:"not null;index"`
	UserID      int    `gorm:"not null;index"`
	Type        string `gorm:"not null;size:50"`
	Key         string `gorm:"not null;size:100"`
	Value       *float64
	Data        string      `gorm:"type:jsonb"`
	AccountBook AccountBook `gorm:"foreignKey:UserID;references:ID"`
}

func (Ledger) TableName() string {
	return "ledgers"
}

func (l *Ledger) Create() error {
	return DB.Create(l).Error
}

func (l *Ledger) Update(fields map[string]interface{}) error {
	return DB.Model(l).Where("id = ?", l.ID).Updates(fields).Error
}

func (l *Ledger) Delete() error {
	return DB.Delete(l).Error
}

func GetLedgersByUser(userID ID) ([]Ledger, error) {
	var ledgers []Ledger
	err := DB.Where("user_id = ?", userID).Find(&ledgers).Error
	return ledgers, err
}
