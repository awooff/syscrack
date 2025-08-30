package routes

import (
	"github.com/go-chi/chi/v5"
	"markets/internal/handlers"
)

func TradeRoutes(r chi.Router) {
	r.Post("/buy", handlers.PlaceBuyTradeHandler)     // POST /api/trades/buy
	r.Post("/sell", handlers.PlaceSellTradeHandler)   // POST /api/trades/sell
	r.Get("/{tradeID}", handlers.GetTradeByIDHandler) // GET /api/trades/{tradeID}
}
