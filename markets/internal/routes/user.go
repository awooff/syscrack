package routes

import (
	"github.com/go-chi/chi/v5"
	"markets/internal/handlers"
)

func UserRoutes(r chi.Router) {
	r.Get("/", handlers.GetAllUsersHandler) // GET /api/users
	r.Post("/", handlers.CreateUserHandler) // POST /api/users
	r.Get("/{userID}", handlers.GetUserByIDHandler)
	r.Put("/{userID}", handlers.UpdateUserHandler)
	r.Delete("/{userID}", handlers.DeleteUserHandler)

	r.Route("/{userID}/portfolios", func(sr chi.Router) {
		// sub-router
		sr.Get("/", handlers.GetUserPortfoliosHandler)
		sr.Post("/", handlers.CreatePortfolioHandler)
	})
}
