package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"markets/internal/app"

	"github.com/go-chi/chi/v5"
)

// keep it simple: one DTO for all trade types
type TradeRequest struct {
	UserID   uint64 `json:"user_id"`
	MarketID uint64 `json:"market_id"`
	FundID   uint64 `json:"fund_id"`
	Quantity uint64 `json:"quantity"`
	Price    uint64 `json:"price"`
	Type     string `json:"type"` // "buy" | "sell" | "transfer"
}

type TradeResponse struct {
	Success bool       `json:"success"`
	Data    *app.Trade `json:"data,omitempty"`
	Error   string     `json:"error,omitempty"`
}

func CreateTradeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req TradeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TradeResponse{Success: false, Error: "invalid payload"})
		return
	}

	var (
		trade *app.Trade
		err   error
	)

	switch req.Type {
	case "buy":
		trade, err = app.PlaceBuyTrade(app.ID(req.UserID), app.ID(req.MarketID), app.ID(req.FundID), req.Quantity, req.Price)
	case "sell":
		trade, err = app.PlaceSellTrade(app.ID(req.UserID), app.ID(req.MarketID), app.ID(req.FundID), req.Quantity, req.Price)
	case "transfer":
		w.WriteHeader(http.StatusNotImplemented)
		json.NewEncoder(w).Encode(TradeResponse{Success: false, Error: "transfer not implemented yet"})
		return
	default:
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TradeResponse{Success: false, Error: "invalid trade type"})
		return
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TradeResponse{Success: false, Error: err.Error()})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(TradeResponse{Success: true, Data: trade})
}

func GetTradeByIDHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := chi.URLParam(r, "tradeID")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(TradeResponse{Success: false, Error: "invalid trade ID"})
		return
	}

	trade, err := app.GetTradeByID(app.ID(id)) // see app helper below
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(TradeResponse{Success: false, Error: "trade not found"})
		return
	}

	json.NewEncoder(w).Encode(TradeResponse{Success: true, Data: trade})
}

