package handlers

import (
	"net/http"
)

type PaymentResponse struct {
	Success bool `json:"success"`
	Data    *app.Payment  `json:"data,omitempty"`
	Items   []app.Payment `json:"items,omitempty"`
	Error   string          `json:"error,omitempty"`
}

func MakePayment(w http.ResponseWriter, r *http.Request) {
	w.Header.Set("Content-Type", "application/json")
}