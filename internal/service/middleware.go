package service

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/format"
	"github.com/jljl1337/issho/internal/repository"
)

type MiddlewareService struct {
	db *sqlx.DB
}

func NewMiddlewareService(db *sqlx.DB) *MiddlewareService {
	return &MiddlewareService{
		db: db,
	}
}

// GetSessionUserAndRefreshSession validates the session token (and CSRF token),
// refreshes the session expiration, and returns the associated user.
func (s *MiddlewareService) GetSessionUserAndRefreshSession(ctx context.Context, sessionToken, CSRFToken string) (*repository.User, error) {
	queries := repository.New(s.db)

	sessions, err := queries.GetSessionByToken(ctx, sessionToken)

	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get session: %v", err)
	}

	if len(sessions) > 1 {
		return nil, NewServiceError(ErrCodeInternal, "multiple sessions found with the same token")
	}

	if len(sessions) < 1 {
		return nil, NewServiceError(ErrCodeUnauthorized, "unauthorized")
	}

	session := sessions[0]

	// Return unauthorized if the session is a pre session
	if !session.UserID.Valid {
		return nil, NewServiceError(ErrCodeUnauthorized, "unauthorized")
	}

	// CSRF token does not match
	if CSRFToken != "" && session.CsrfToken != CSRFToken {
		return nil, NewServiceError(ErrCodeUnauthorized, "unauthorized")
	}

	// Session expired
	now := time.Now()
	nowISO8601 := format.TimeToISO8601(now)
	if session.ExpiresAt < nowISO8601 {
		return nil, NewServiceError(ErrCodeUnauthorized, "unauthorized")
	}

	// Only refresh session if remaining lifetime is below threshold
	expiresAt, err := format.ISO8601ToTime(session.ExpiresAt)
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to parse session expiration: %v", err)
	}

	remainingLifetimeMin := expiresAt.Sub(now).Minutes()
	if remainingLifetimeMin < float64(env.SessionRefreshThresholdMin) {
		newExpiresAt := format.TimeToISO8601(now.Add(time.Duration(env.SessionLifetimeMin) * time.Minute))
		err := queries.UpdateSessionByToken(ctx, repository.UpdateSessionByTokenParams{
			Token:     sessionToken,
			ExpiresAt: newExpiresAt,
			UpdatedAt: nowISO8601,
		})
		if err != nil {
			return nil, NewServiceErrorf(ErrCodeInternal, "failed to refresh session: %v", err)
		}
	}

	// Get user associated with the session
	user, err := queries.GetUserByID(ctx, session.UserID.String)
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get user by ID: %v", err)
	}

	return &user, nil
}
