package repository

import (
	"database/sql"
)

type Migration struct {
	ID            string `json:"id" db:"id"`
	UpStatement   string `json:"upStatement" db:"up_statement"`
	DownStatement string `json:"downStatement" db:"down_statement"`
	ExecutedAt    string `json:"executedAt" db:"executed_at"`
}

type User struct {
	ID           string `json:"id" db:"id"`
	Username     string `json:"username" db:"username"`
	Email        string `json:"email" db:"email"`
	PasswordHash string `json:"passwordHash" db:"password_hash"`
	Role         string `json:"role" db:"role"`
	LanguageCode string `json:"languageCode" db:"language_code"`
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

type Post struct {
	ID          string  `json:"id" db:"id"`
	UserID      *string `json:"userID" db:"user_id"`
	Title       string  `json:"title" db:"title"`
	Description string  `json:"description" db:"description"`
	Content     string  `json:"content" db:"content"`
	PublishedAt *string `json:"publishedAt" db:"published_at"`
	CreatedAt   string  `json:"createdAt" db:"created_at"`
	UpdatedAt   string  `json:"updatedAt" db:"updated_at"`
}

type Price struct {
	ID                     string  `json:"id" db:"id"`
	Name                   string  `json:"name" db:"name"`
	Description            string  `json:"description" db:"description"`
	PriceAmount            int     `json:"priceAmount" db:"price_amount"`
	PriceCurrency          string  `json:"priceCurrency" db:"price_currency"`
	IsRecurring            int     `json:"isRecurring" db:"is_recurring"`
	RecurringInterval      *string `json:"recurringInterval" db:"recurring_interval"`
	RecurringIntervalCount *int    `json:"recurringIntervalCount" db:"recurring_interval_count"`
	IsActive               int     `json:"isActive" db:"is_active"`
	CreatedAt              string  `json:"createdAt" db:"created_at"`
	UpdatedAt              string  `json:"updatedAt" db:"updated_at"`
}

type Queue struct {
	ID        string `json:"id" db:"id"`
	Lane      string `json:"lane" db:"lane"`
	Type      string `json:"type" db:"type"`
	Payload   string `json:"payload" db:"payload"`
	Result    string `json:"result" db:"result"`
	Status    string `json:"status" db:"status"`
	CreatedAt string `json:"createdAt" db:"created_at"`
	UpdatedAt string `json:"updatedAt" db:"updated_at"`
}
