package app

type BankAccount struct {
	ID            ID     `gorm:"primaryKey;autoIncrement"`
	UserID        ID     `gorm:"not null;uniqueIndex"`
	AccountNumber string `gorm:"not null;size:20"`
	RoutingNumber string `gorm:"not null;size:9"`
	BankName      string `gorm:"not null;size:100"`

	User UserID `gorm:"foreignKey:UserID"`
}

func (BankAccount) TableName() string {
	return "bank_accounts"
}

// GetBankAccount retrieves the bank account associated with the given user ID.
func GetBankAccount(userID ID) (*BankAccount, error) {
	var account BankAccount
	if err := DB.Where("user_id = ?", userID).First(&account).Error; err != nil {
		return nil, err
	}

	return &account, nil
}

// GetUserBalance returns the latest balance for the user from the ledger.
func GetUserBalance(userID ID) (float64, error) {
	ledgers, err := GetLedgersByUser(userID)
	if err != nil {
		return 0, err
	}
	if len(ledgers) == 0 {
		return 0, nil
	}
	// Assuming the last ledger entry has the latest balance
	return ledgers[len(ledgers)-1].Balance, nil
}
