package routes

import (
	"fmt"
	mdw "markets/internal/middleware"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Init() chi.Router {
	r := chi.NewRouter()

	// On our index route, let's just display the routes we have.
	r.Get("/", func(w http.ResponseWriter, req *http.Request) {
		chi.Walk(r, func(method string, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
			fmt.Printf("[%s]: '%s' has %d middlewares\n", method, route, len(middlewares))
			return nil
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Group(func(protected chi.Router) {
		protected.Use(mdw.AuthMiddleware)

		protected.Route("/funds", FundRoutes)
		protected.Route("/trades", TradeRoutes)
		protected.Route("/users", UserRoutes)
	})

	// errors and stuff
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(404)
		w.Write([]byte("route does not exist"))
	})

	r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(405)
		w.Write([]byte("method is not valid"))
	})

	return r
}
