package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
)

type SessionValidationResponse struct {
	Valid  bool `json:"valid"`
	UserID uint `json:"user_id"`
}

var host string = os.Getenv("HOST")
var port string = os.Getenv("PORT")

func SessionMiddleware(apiURL string, next http.Handler) http.Handler {
	if host == "" {
		host = "http://localhost"
	}

	apiURL = host + port

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: we need to actually send a cookie to the server and verify it
		// server-side, this needs to be implemented in the JS side!
		// Otherwise, doing this will be a pain going forward!
		cookie, err := r.Cookie("session_token")
		if err != nil {
			http.Error(w, "Unauthorized: No session token provided", http.StatusUnauthorized)
			return
		}

		resp, err := http.Get(apiURL + "?token=" + cookie.Value)
		if err != nil || resp.StatusCode != http.StatusOK {
			http.Error(w, "Unauthorized: Invalid session token", http.StatusUnauthorized)
			return
		}
		defer resp.Body.Close()

		var validationResponse SessionValidationResponse
		if err := json.NewDecoder(resp.Body).Decode(&validationResponse); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		if !validationResponse.Valid {
			http.Error(w, "Unauthorized: Invalid session token", http.StatusUnauthorized)
			return
		}

		ctx := r.Context()
		ctx = context.WithValue(ctx, "userID", validationResponse.UserID)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
