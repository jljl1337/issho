package middleware

import (
	"context"
	"errors"
	"net/http"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/http/common"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const UserRoleKey contextKey = "user_role"

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
			ctx := context.WithValue(r.Context(), UserIDKey, user.ID)
			ctx = context.WithValue(ctx, UserRoleKey, user.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserIDFromContext retrieves the user ID from the context.
//
// It returns an error if the user ID is not found or is of an unexpected type.
func GetUserIDFromContext(ctx context.Context) (string, error) {
	userID, ok := ctx.Value(UserIDKey).(string)
	if !ok {
		return "", errors.New("failed to get user ID from context")
	}
	return userID, nil
}

// GetUserRoleFromContext retrieves the user role from the context.
//
// It returns an error if the user role is not found or is of an unexpected type.
func GetUserRoleFromContext(ctx context.Context) (string, error) {
	userRole, ok := ctx.Value(UserRoleKey).(string)
	if !ok {
		return "", errors.New("failed to get user role from context")
	}
	return userRole, nil
}
