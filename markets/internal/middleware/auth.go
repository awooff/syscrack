package middleware

import (
	"context"
	"errors"
	"markets/internal/app"
	"net/http"
	"strings"
)

type AuthUser struct {
	ID      uint64 `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Group   string `json:"group"`
	Created string `json:"created"`
}

type AuthResponse struct {
	User    AuthUser    `json:"user"`
	Session interface{} `json:"session"`
}

type Session struct {
	ID         string `gorm:"primaryKey"`
	UserID     uint64 `gorm:"not null;index"`
	Token      string `gorm:"not null;uniqueIndex"`
	LastAction string `gorm:"not null"`
	Created    string `gorm:"autoCreateTime"`
	Expires    string `gorm:"not null"`
}

func (Session) TableName() string {
	return "Session"
}

type ctxKey string

const userCtxKey ctxKey = "authUser"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		token = strings.TrimSpace(token)
		if token == "" || token == "null" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var session Session
		result := app.DB.Where("token = ?", token).First(&session)
		if result.Error != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func FromContext(ctx context.Context) (AuthUser, error) {
	user, ok := ctx.Value(userCtxKey).(AuthUser)
	if !ok {
		return AuthUser{}, errors.New("no user in context")
	}
	return user, nil
}
