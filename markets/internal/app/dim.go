package app

import (
	"errors"
	"log"
)

type DIM struct {
	Id                 uint32
	Name               string
	InvestmentManagers []User
	SharedWith         []HedgeFund
}

func NewDIM(id uint32, name string, managers []User, sharedWith []HedgeFund) DIM {
	return DIM{
		Id:                 id,
		Name:               name,
		InvestmentManagers: managers,
		SharedWith:         sharedWith,
	}
}

func (d DIM) ShareWith(hedgeFund HedgeFund) {
	d.SharedWith = append(d.SharedWith, hedgeFund)
}

func (d DIM) Edit(user User) error {
	for _, manager := range d.InvestmentManagers {
		if manager.ID == user.ID {
			log.Printf("DIM %s edited by investment manager %s\n", d.Name, user.Name)
			return nil
		}
	}

	return errors.New("user is not authorized to edit this DIM")
}
