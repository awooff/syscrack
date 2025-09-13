package app

type Log struct {
	ID        ID     `gorm:"primaryKey;autoIncrement"`
	UserID    ID     `gorm:"not null;index"`
	Action    string `gorm:"not null;size:100"`
	Details   string `gorm:"type:text"`
	Timestamp int64  `gorm:"autoCreateTime"`
}
