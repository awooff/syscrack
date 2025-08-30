package handlers

import (
	"encoding/json"
	"markets/internal/app"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type UserResponse struct {
	Success bool       `json:"success"`
	Data    *app.User  `json:"data,omitempty"`
	Items   []app.User `json:"items,omitempty"`
	Error   string     `json:"error,omitempty"`
}

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := app.GetAllUsers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(UserResponse{Success: true, Items: users})
}

func GetUserByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "userID")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid user ID", http.StatusBadRequest)
		return
	}

	user, err := app.GetUserByID(app.ID(id))
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(UserResponse{Success: true, Data: user})
}

func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var u app.User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	user, err := app.CreateUser(&u)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(UserResponse{Success: true, Data: user})
}

func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "userID")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid user ID", http.StatusBadRequest)
		return
	}

	var u app.User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	u.ID = app.ID(id)

	user, err := app.UpdateUser(&u)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(UserResponse{Success: true, Data: user})
}

func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "userID")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid user ID", http.StatusBadRequest)
		return
	}

	if err := app.DeleteUser(app.ID(id)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true, "message": "user deleted"})
}
