package routes

import (
	"github.com/go-chi/chi/v5"
	"markets/internal/handlers"
)

func FundRoutes(r chi.Router) {
	r.Get("/", handlers.GetFundInfo)
	r.Post("/", handlers.CreateFund)
	r.Get("/{fundID}", handlers.GetFundByID)
	r.Put("/{fundID}", handlers.UpdateFund)
	r.Delete("/{fundID}", handlers.DeleteFund)
}
