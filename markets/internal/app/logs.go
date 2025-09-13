package app

type Log struct {
	ID        ID     `gorm:"primaryKey;autoIncrement"`
	UserID    ID     `gorm:"not null;index"`
	Action    string `gorm:"not null;size:100"`
	Details   string `gorm:"type:text"`
	Timestamp int64  `gorm:"autoCreateTime"`
	ComputerID int64 `gorm:"not null;index"`
	SenderID int64
	SenderIp int64
	GameID int64
	Message int64
	Created int64
}
