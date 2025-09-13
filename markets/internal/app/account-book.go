package app

type AccountBook struct {
	ID         int    `gorm:"primaryKey;autoIncrement"`
	UserID     int    `gorm:"not null;index"`
	ComputerID string `gorm:"not null;index"`
	MemoryID   string `gorm:"not null;index"`
	GameID     string `gorm:"not null;index"`
	Data       string `gorm:"type:jsonb"`
}

func (AccountBook) TableName() string {
	return "account_book"
}

func (a *AccountBook) Create() error {
	return DB.Create(a).Error
}

func (a *AccountBook) Update(fields map[string]interface{}) error {
	return DB.Model(a).Where("id = ?", a.ID).Updates(fields).Error
}

func (a *AccountBook) Delete() error {
	return DB.Delete(a).Error
}

func GetAccountBooksByUser(userID int, gameID string) ([]AccountBook, error) {
	var books []AccountBook
	err := DB.Where("user_id = ? AND game_id = ?", userID, gameID).Find(&books).Error
	return books, err
}

func GetAccountBookByID(id int) (*AccountBook, error) {
	var book AccountBook
	err := DB.First(&book, id).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}
