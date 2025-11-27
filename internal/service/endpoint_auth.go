package service

import (
	"context"
	"database/sql"
	"log/slog"
	"time"

	"github.com/jljl1337/issho/internal/crypto"
	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/format"
	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
)

func (s *EndpointService) SignUp(ctx context.Context, username, password, languageCode string) error {
	// Validate language code (only allow en-US and zh-HK)
	if languageCode != "en-US" && languageCode != "zh-HK" {
		languageCode = "en-US" // Default to en-US if invalid
	}

	usernameValid, err := checkUsername(username)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to validate username: %v", err)
	}
	if !usernameValid {
		return NewServiceError(ErrCodeUnprocessable, "invalid username format")
	}

	passwordValid, err := checkPassword(password)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to validate password: %v", err)
	}
	if !passwordValid {
		return NewServiceError(ErrCodeUnprocessable, "invalid password format")
	}

	queries := repository.New(s.db)

	users, err := queries.GetUserByUsername(ctx, username)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get user by username: %v", err)
	}

	if len(users) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple users found with the same username")
	}

	if len(users) > 0 {
		return NewServiceError(ErrCodeUsernameTaken, "username already exists")
	}

	passwordHash, err := crypto.HashPassword(password, env.PasswordBcryptCost)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to hash password: %v", err)
	}

	currentTime := generator.NowISO8601()

	ownerCount, err := queries.GetUserCountByRole(ctx, env.OwnerRole)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get owner user count: %v", err)
	}

	role := env.UserRole
	if ownerCount == 0 {
		role = env.OwnerRole
	}

	if err = queries.CreateUser(ctx, repository.User{
		ID:           generator.NewULID(),
		Username:     username,
		PasswordHash: passwordHash,
		Role:         role,
		LanguageCode: languageCode,
		CreatedAt:    currentTime,
		UpdatedAt:    currentTime,
	}); err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create user: %v", err)
	}

	return nil
}

// GetPreSession creates a pre-session with no associated user.
// It returns a non-empty session token and CSRF token.
func (s *EndpointService) GetPreSession(ctx context.Context) (string, string, error) {
	queries := repository.New(s.db)

	sessionID := generator.NewULID()
	sessionToken := generator.NewToken(env.SessionTokenLength, env.SessionTokenCharset)
	CSRFToken := generator.NewToken(env.CSRFTokenLength, env.CSRFTokenCharset)
	currentTime := generator.NowISO8601()
	expiresAt := format.TimeToISO8601(time.Now().Add(time.Duration(env.PreSessionLifetimeMin) * time.Minute))

	if err := queries.CreateSession(ctx, repository.CreateSessionParams{
		ID:        sessionID,
		UserID:    sql.NullString{Valid: false},
		Token:     sessionToken,
		CsrfToken: CSRFToken,
		ExpiresAt: expiresAt,
		CreatedAt: currentTime,
		UpdatedAt: currentTime,
	}); err != nil {
		return "", "", NewServiceErrorf(ErrCodeInternal, "failed to create pre-session: %v", err)
	}

	return sessionToken, CSRFToken, nil
}

// SignIn authenticates a user and creates a new session.
// It returns non-empty session token and CSRF token if the credentials are valid.
func (s *EndpointService) SignIn(ctx context.Context, preSessionToken, preSessionCSRFToken, username, password string) (string, string, error) {
	queries := repository.New(s.db)

	// Validate pre-session
	sessions, err := queries.GetSessionByToken(ctx, preSessionToken)

	if err != nil {
		return "", "", NewServiceErrorf(ErrCodeInternal, "failed to get pre-session: %v", err)
	}

	if len(sessions) > 1 {
		return "", "", NewServiceError(ErrCodeInternal, "multiple sessions found with the same token")
	}

	if len(sessions) < 1 {
		slog.Debug("Session not found")
		return "", "", NewServiceError(ErrCodeUnauthorized, "invalid pre-session")
	}

	session := sessions[0]

	// Check if the session is already associated with a user
	if session.UserID.Valid {
		slog.Debug("Session is is not a pre-session")
		return "", "", NewServiceError(ErrCodeUnauthorized, "invalid pre-session")
	}

	// CSRF token does not match
	if preSessionCSRFToken != "" && session.CsrfToken != preSessionCSRFToken {
		slog.Debug("CSRF token does not match")
		return "", "", NewServiceError(ErrCodeUnauthorized, "csrf token does not match")
	}

	// Session expired
	now := time.Now()
	nowISO8601 := format.TimeToISO8601(now)
	if session.ExpiresAt < nowISO8601 {
		return "", "", NewServiceError(ErrCodeUnauthorized, "pre-session expired")
	}

	// Validate credentials
	users, err := queries.GetUserByUsername(ctx, username)
	if err != nil {
		return "", "", NewServiceErrorf(ErrCodeInternal, "failed to get user by username: %v", err)
	}

	if len(users) > 1 {
		return "", "", NewServiceError(ErrCodeInternal, "multiple users found with the same username")
	}

	if len(users) < 1 {
		slog.Debug("User not found")
		return "", "", NewServiceError(ErrCodeInvalidCredentials, "invalid credentials")
	}

	user := users[0]

	if !crypto.CheckPasswordHash(password, user.PasswordHash) {
		slog.Debug("Invalid password")
		return "", "", NewServiceError(ErrCodeInvalidCredentials, "invalid credentials")
	}

	cost, err := crypto.Cost(user.PasswordHash)
	if err != nil {
		return "", "", NewServiceErrorf(ErrCodeInternal, "failed to get password hash cost: %v", err)
	}

	// Rehash password if the cost is lower than the current standard
	currentTime := generator.NowISO8601()

	if cost < env.PasswordBcryptCost {
		newHash, err := crypto.HashPassword(password, env.PasswordBcryptCost)
		if err != nil {
			return "", "", NewServiceErrorf(ErrCodeInternal, "failed to hash password: %v", err)
		}

		err = queries.UpdateUserPassword(ctx, repository.UpdateUserPasswordParams{
			PasswordHash: newHash,
			UpdatedAt:    currentTime,
			ID:           user.ID,
		})
		if err != nil {
			return "", "", NewServiceErrorf(ErrCodeInternal, "failed to update user password hash: %v", err)
		}
	}

	sessionID := generator.NewULID()
	sessionToken := generator.NewToken(env.SessionTokenLength, env.SessionTokenCharset)
	CSRFToken := generator.NewToken(env.CSRFTokenLength, env.CSRFTokenCharset)
	expiresAt := format.TimeToISO8601(time.Now().Add(time.Duration(env.SessionLifetimeMin) * time.Hour))

	// Deactivate the pre-session
	err = queries.UpdateSessionByToken(ctx, repository.UpdateSessionByTokenParams{
		Token:     preSessionToken,
		ExpiresAt: nowISO8601,
		UpdatedAt: nowISO8601,
	})
	if err != nil {
		return "", "", NewServiceErrorf(ErrCodeInternal, "failed to update pre-session: %v", err)
	}

	// Create a new session associated with the user
	err = queries.CreateSession(ctx, repository.CreateSessionParams{
		ID:        sessionID,
		UserID:    sql.NullString{String: user.ID, Valid: true},
		Token:     sessionToken,
		CsrfToken: CSRFToken,
		ExpiresAt: expiresAt,
		CreatedAt: currentTime,
		UpdatedAt: currentTime,
	})
	if err != nil {
		return "", "", NewServiceErrorf(ErrCodeInternal, "failed to create session: %v", err)
	}

	return sessionToken, CSRFToken, nil
}

func (s *EndpointService) SignOut(ctx context.Context, sessionToken string) error {
	queries := repository.New(s.db)

	now := generator.NowISO8601()
	err := queries.UpdateSessionByToken(ctx, repository.UpdateSessionByTokenParams{
		Token:     sessionToken,
		ExpiresAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to sign out session: %v", err)
	}

	return nil
}

func (s *EndpointService) SignOutAllSession(ctx context.Context, userID string) error {
	queries := repository.New(s.db)

	now := generator.NowISO8601()
	rows, err := queries.UpdateSessionByUserID(ctx, repository.UpdateSessionByUserIDParams{
		UserID:    sql.NullString{String: userID, Valid: true},
		ExpiresAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to sign out all sessions: %v", err)
	}

	if rows < 1 {
		return NewServiceError(ErrCodeInternal, "no sessions deleted")
	}

	return nil
}

func (s *EndpointService) CSRFToken(ctx context.Context, sessionToken string) (string, error) {
	queries := repository.New(s.db)

	sessions, err := queries.GetSessionByToken(ctx, sessionToken)

	if err != nil {
		return "", NewServiceErrorf(ErrCodeInternal, "failed to get session: %v", err)
	}

	if len(sessions) > 1 {
		return "", NewServiceError(ErrCodeInternal, "multiple sessions found with the same token")
	}

	if len(sessions) < 1 {
		return "", NewServiceError(ErrCodeUnauthorized, "invalid session")
	}

	session := sessions[0]

	// Check if pre-session is expired
	if session.ExpiresAt < generator.NowISO8601() {
		return "", NewServiceError(ErrCodeUnauthorized, "unauthorized")
	}

	return session.CsrfToken, nil
}
