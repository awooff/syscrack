package routes

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

func InitializeRoutes() http.Handler {
	r := chi.NewRouter()

	return r
}

