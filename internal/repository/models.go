package repository

import (
	"database/sql"
)

type User struct {
	ID           string `json:"id" db:"id"`
	Username     string `json:"username" db:"username"`
	PasswordHash string `json:"passwordHash" db:"password_hash"`
	CreatedAt    string `json:"createdAt" db:"created_at"`
	UpdatedAt    string `json:"updatedAt" db:"updated_at"`
}

type Session struct {
	ID        string         `json:"id" db:"id"`
	UserID    sql.NullString `json:"userID" db:"user_id"`
	Token     string         `json:"token" db:"token"`
	CsrfToken string         `json:"csrfToken" db:"csrf_token"`
	ExpiresAt string         `json:"expiresAt" db:"expires_at"`
	CreatedAt string         `json:"createdAt" db:"created_at"`
	UpdatedAt string         `json:"updatedAt" db:"updated_at"`
}
