package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"markets/internal/app"
)

// Response structures
type FundResponse struct {
	Success bool       `json:"success"`
	Data    []app.Fund `json:"data,omitempty"`
	Message string     `json:"message,omitempty"`
}

type SingleFundResponse struct {
	Success bool     `json:"success"`
	Data    app.Fund `json:"data,omitempty"`
	Message string   `json:"message,omitempty"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// GetFundInfo retrieves all active funds
func GetFundInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	funds, err := app.GetActiveFunds()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := ErrorResponse{
			Success: false,
			Error:   "Failed to retrieve funds: " + err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	response := FundResponse{
		Success: true,
		Data:    funds,
	}

	json.NewEncoder(w).Encode(response)
}

func GetFundByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := r.URL.Path[len("/api/funds/"):]
	if idStr == "" {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Fund ID is required",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Invalid fund ID format",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	fund, err := app.GetFundByID(app.ID(id))
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		response := ErrorResponse{
			Success: false,
			Error:   "Fund not found: " + err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	response := SingleFundResponse{
		Success: true,
		Data:    *fund,
	}

	json.NewEncoder(w).Encode(response)
}

func CreateFund(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		response := ErrorResponse{
			Success: false,
			Error:   "Method not allowed",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	var fund app.Fund
	if err := json.NewDecoder(r.Body).Decode(&fund); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Invalid JSON payload: " + err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	createdFund, err := app.CreateFund(&fund)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := ErrorResponse{
			Success: false,
			Error:   "Failed to create fund: " + err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	w.WriteHeader(http.StatusCreated)
	response := SingleFundResponse{
		Success: true,
		Data:    *createdFund,
		Message: "Fund created successfully",
	}

	json.NewEncoder(w).Encode(response)
}

func UpdateFund(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPut {
		w.WriteHeader(http.StatusMethodNotAllowed)
		response := ErrorResponse{
			Success: false,
			Error:   "Method not allowed",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	idStr := r.URL.Path[len("/api/funds/"):]
	if idStr == "" {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Fund ID is required",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Invalid fund ID format",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	var fund app.Fund
	if err := json.NewDecoder(r.Body).Decode(&fund); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Invalid JSON payload: " + err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	fund.ID = app.ID(id)
	
	updatedFund, err := app.UpdateFund(&fund)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := ErrorResponse{
			Success: false,
			Error:   "Failed to update fund: " + err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	response := SingleFundResponse{
		Success: true,
		Data:    *updatedFund,
		Message: "Fund updated successfully",
	}

	json.NewEncoder(w).Encode(response)
}

func DeleteFund(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodDelete {
		w.WriteHeader(http.StatusMethodNotAllowed)
		response := ErrorResponse{
			Success: false,
			Error:   "Method not allowed",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	idStr := r.URL.Path[len("/api/funds/"):]
	if idStr == "" {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Fund ID is required",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		response := ErrorResponse{
			Success: false,
			Error:   "Invalid fund ID format",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	err = app.DeleteFund(app.ID(id))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := ErrorResponse{
			Success: false,
			Error:   "Failed to delete fund: " + err.Error(),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Fund deleted successfully",
	}

	json.NewEncoder(w).Encode(response)
}
