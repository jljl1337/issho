package repository

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
	IsVerified   bool   `json:"isVerified" db:"is_verified"`
	CreatedAt    string `json:"createdAt" db:"created_at"`
	UpdatedAt    string `json:"updatedAt" db:"updated_at"`
}

type Session struct {
	ID        string  `json:"id" db:"id"`
	UserID    *string `json:"userID" db:"user_id"`
	Token     string  `json:"token" db:"token"`
	CsrfToken string  `json:"csrfToken" db:"csrf_token"`
	ExpiresAt string  `json:"expiresAt" db:"expires_at"`
	CreatedAt string  `json:"createdAt" db:"created_at"`
	UpdatedAt string  `json:"updatedAt" db:"updated_at"`
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

type Product struct {
	ID          string  `json:"id" db:"id"`
	ExternalID  *string `json:"externalId" db:"external_id"`
	Name        string  `json:"name" db:"name"`
	Description string  `json:"description" db:"description"`
	IsActive    bool    `json:"isActive" db:"is_active"`
	CreatedAt   string  `json:"createdAt" db:"created_at"`
	UpdatedAt   string  `json:"updatedAt" db:"updated_at"`
}

type Price struct {
	ID                     string  `json:"id" db:"id"`
	ExternalID             string  `json:"externalId" db:"external_id"`
	ProductID              string  `json:"productId" db:"product_id"`
	Name                   string  `json:"name" db:"name"`
	Description            string  `json:"description" db:"description"`
	PriceAmount            int     `json:"priceAmount" db:"price_amount"`
	PriceCurrency          string  `json:"priceCurrency" db:"price_currency"`
	IsRecurring            bool    `json:"isRecurring" db:"is_recurring"`
	RecurringInterval      *string `json:"recurringInterval" db:"recurring_interval"`
	RecurringIntervalCount *int    `json:"recurringIntervalCount" db:"recurring_interval_count"`
	IsActive               bool    `json:"isActive" db:"is_active"`
	CreatedAt              string  `json:"createdAt" db:"created_at"`
	UpdatedAt              string  `json:"updatedAt" db:"updated_at"`
}

type QueueTask struct {
	ID        string `json:"id" db:"id"`
	Lane      string `json:"lane" db:"lane"`
	Payload   string `json:"payload" db:"payload"`
	Status    string `json:"status" db:"status"`
	CreatedAt string `json:"createdAt" db:"created_at"`
	UpdatedAt string `json:"updatedAt" db:"updated_at"`
}

type Email struct {
	ID          string `json:"id" db:"id"`
	Type        string `json:"type" db:"type"`
	ToAddress   string `json:"toAddress" db:"to_address"`
	CcAddress   string `json:"ccAddress" db:"cc_address"`
	BccAddress  string `json:"bccAddress" db:"bcc_address"`
	FromAddress string `json:"fromAddress" db:"from_address"`
	Subject     string `json:"subject" db:"subject"`
	Body        string `json:"body" db:"body"`
	Status      string `json:"status" db:"status"`
	CreatedAt   string `json:"createdAt" db:"created_at"`
	UpdatedAt   string `json:"updatedAt" db:"updated_at"`
}

type EmailVerification struct {
	ID        string `json:"id" db:"id"`
	UserID    string `json:"userID" db:"user_id"`
	Type      string `json:"type" db:"type"`
	Email     string `json:"email" db:"email"`
	Code      string `json:"code" db:"code"`
	Status    string `json:"status" db:"status"`
	ExpiresAt string `json:"expiresAt" db:"expires_at"`
	CreatedAt string `json:"createdAt" db:"created_at"`
	UpdatedAt string `json:"updatedAt" db:"updated_at"`
}
