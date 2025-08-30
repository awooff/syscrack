package handlers

import (
	"encoding/json"
	"markets/internal/app"
	"markets/internal/middleware"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type PortfolioResponse struct {
	Success bool            `json:"success"`
	Data    *app.Portfolio  `json:"data,omitempty"`
	Items   []app.Portfolio `json:"items,omitempty"`
	Error   string          `json:"error,omitempty"`
}

func GetUserPortfoliosHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr := chi.URLParam(r, "userID")
	uid, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid user ID", http.StatusBadRequest)
		return
	}

	portfolios, err := app.GetPortfoliosByUser(app.ID(uid))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(PortfolioResponse{Success: true, Items: portfolios})
}

func GetPortfolioByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "portfolioID")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid portfolio ID", http.StatusBadRequest)
		return
	}

	portfolio, err := app.GetPortfolioByID(app.ID(id))
	if err != nil {
		http.Error(w, "portfolio not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(PortfolioResponse{Success: true, Data: portfolio})
}

func CreatePortfolioHandler(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.FromContext(r.Context())
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var p app.Portfolio
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	// tie portfolio to logged-in user
	p.UserID = app.ID(user.ID)

	portfolio, err := app.CreatePortfolio(&p)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(PortfolioResponse{Success: true, Data: portfolio})
}

func UpdatePortfolioHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "portfolioID")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid portfolio ID", http.StatusBadRequest)
		return
	}

	var p app.Portfolio
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	p.ID = app.ID(id)

	portfolio, err := app.UpdatePortfolio(&p)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(PortfolioResponse{Success: true, Data: portfolio})
}

func DeletePortfolioHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "portfolioID")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid portfolio ID", http.StatusBadRequest)
		return
	}

	if err := app.DeletePortfolio(app.ID(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true, "message": "portfolio deleted"})
}
