package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"time"
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

type ctxKey string

const userCtxKey ctxKey = "authUser"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("connect.sid")
		if err != nil {
			http.Error(w, "unauthorized: missing session cookie", http.StatusUnauthorized)
			return
		}

		baseURL := os.Getenv("AUTH_API_URL")
		if baseURL == "" {
			http.Error(w, "server misconfigured: AUTH_API_URL not set", http.StatusInternalServerError)
			return
		}

		client := &http.Client{Timeout: 5 * time.Second}
		req, _ := http.NewRequest("GET", baseURL+"/auth/valid", nil)
		req.Header.Set("Cookie", cookie.Name+"="+cookie.Value)

		resp, err := client.Do(req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var auth AuthResponse
		if err := json.NewDecoder(resp.Body).Decode(&auth); err != nil {
			http.Error(w, "failed to parse auth response", http.StatusUnauthorized)
			return
		}

		if auth.User.ID == 0 {
			http.Error(w, "unauthorized: no user", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userCtxKey, auth.User)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func FromContext(ctx context.Context) (AuthUser, error) {
	user, ok := ctx.Value(userCtxKey).(AuthUser)
	if !ok {
		return AuthUser{}, errors.New("no user in context")
	}
	return user, nil
}
