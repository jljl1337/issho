package middleware

import (
	"context"
	"net/http"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/http/common"
	"github.com/jljl1337/issho/internal/repository"
)

type contextKey string

const UserKey contextKey = "user"

func (m *MiddlewareProvider) Auth() Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip for public routes
			publicRoutes := map[string]bool{
				"/version":          true,
				"/health":           true,
				"/auth/sign-up":     true,
				"/auth/pre-session": true,
				"/auth/sign-in":     true,
				"/auth/csrf-token":  true,
			}
			if publicRoutes[r.URL.Path] {
				next.ServeHTTP(w, r)
				return
			}

			// Get session token from cookie
			cookie, err := r.Cookie(env.SessionCookieName)
			if err != nil {
				// err is not nil only if the cookie is not present
				common.WriteMessageResponse(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Get CSRF token from header
			CSRFToken := r.Header.Get("X-CSRF-Token")

			if CSRFToken == "" && (r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodDelete || r.Method == http.MethodPatch) {
				common.WriteMessageResponse(w, "CSRF token is required", http.StatusUnauthorized)
				return
			}

			// Validate session token (and CSRF token)
			user, err := m.service.GetSessionUserAndRefreshSession(r.Context(), cookie.Value, CSRFToken)
			if err != nil {
				common.WriteErrorResponse(w, err)
				return
			}

			// Add user to context
			ctx := context.WithValue(r.Context(), UserKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext retrieves the authenticated user from the context.
//
// It returns nil if the user is not found or is of an unexpected type.
func GetUserFromContext(ctx context.Context) *repository.User {
	user, ok := ctx.Value(UserKey).(*repository.User)
	if !ok {
		return nil
	}
	return user
}
