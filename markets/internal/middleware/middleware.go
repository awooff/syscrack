package middleware

import (
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"

	"markets/internal/logx"
)

func Init(r *chi.Mux) {
	r.Use(chimw.Recoverer) // recovers from panics
	r.Use(chimw.RequestID) // adds a request ID to context
	r.Use(chimw.RealIP)    // resolves real IP from proxy headers

	r.Use(LoggerMiddleware)

	r.Use(AuthMiddleware)

	logx.Logger.Info().Msg("middleware initialised")
}
