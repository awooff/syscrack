package routes

import (
	"github.com/go-chi/chi/v5"
	"markets/internal/handlers"
)

func TradeRoutes(r chi.Router) {
	r.Post("/", handlers.CreateTradeHandler)          // POST /api/trades
	r.Get("/{tradeID}", handlers.GetTradeByIDHandler) // GET /api/trades/{tradeID}
}
