package env

import "net/http"

var (
	Version   = "dev"
	OwnerRole = "owner"
	UserRole  = "user"

	DBType                     string
	PostgresURL                string
	SQLiteDbPath               string
	SQLiteDbBusyTimeout        string
	SQLiteBackupDbPath         string
	SQLiteBackupCronSchedule   string
	SessionCleanupCronSchedule string
	PaymentProvider            string
	PolarAccessToken           string
	PolarIsSandbox             bool
	LogLevel                   int
	LogHealthCheck             bool
	Port                       string
	CORSOrigins                string
	PasswordBcryptCost         int
	SessionCookieName          string
	SessionCookieHttpOnly      bool
	SessionCookieSecure        bool
	SessionTokenLength         int
	SessionTokenCharset        string
	SessionLifetimeMin         int
	SessionRefreshThresholdMin int
	PreSessionLifetimeMin      int
	CSRFTokenLength            int
	CSRFTokenCharset           string
	PageSizeMax                int
	PageSizeDefault            int

	SessionCookieSameSiteMode http.SameSite
)

func MustSetConstants() {
	mustLoadOptionalEnvFile()

	dBType := MustGetString("DB_TYPE", "sqlite")
	PostgresURL = MustGetString("POSTGRES_URL", "")
	SQLiteDbPath = MustGetString("SQLITE_DB_PATH", "data/live/db/live.db")
	SQLiteDbBusyTimeout = MustGetString("SQLITE_BUSY_TIMEOUT", "30000")
	SQLiteBackupDbPath = MustGetString("SQLITE_BACKUP_DB_PATH", "data/backup/db/backup.db")
	SQLiteBackupCronSchedule = MustGetString("SQLITE_BACKUP_CRON_SCHEDULE", "0 0 * * *")
	SessionCleanupCronSchedule = MustGetString("SESSION_CLEANUP_CRON_SCHEDULE", "0 0 * * 0")
	paymentProvider := MustGetString("PAYMENT_PROVIDER", "polar")
	PolarAccessToken = MustGetString("POLAR_ACCESS_TOKEN", "")
	PolarIsSandbox = MustGetBool("POLAR_IS_SANDBOX", false)
	LogLevel = MustGetInt("LOG_LEVEL", 0)
	LogHealthCheck = MustGetBool("LOG_HEALTH_CHECK", false)
	Port = MustGetString("PORT", "3000")
	CORSOrigins = MustGetString("CORS_ORIGINS", "*")
	PasswordBcryptCost = MustGetInt("PASSWORD_BCRYPT_COST", 12)
	SessionCookieName = MustGetString("SESSION_COOKIE_NAME", "issho_session_token")
	SessionCookieHttpOnly = MustGetBool("SESSION_COOKIE_HTTP_ONLY", true)
	SessionCookieSecure = MustGetBool("SESSION_COOKIE_SECURE", false)
	sessionCookieSameSite := MustGetString("SESSION_COOKIE_SAME_SITE_MODE", "lax")
	SessionTokenLength = MustGetInt("SESSION_TOKEN_LENGTH", 32)
	SessionTokenCharset = MustGetString("SESSION_TOKEN_CHARSET", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	SessionLifetimeMin = MustGetInt("SESSION_LIFETIME_MIN", 60*24*7)
	SessionRefreshThresholdMin = MustGetInt("SESSION_REFRESH_THRESHOLD_MIN", 60*24)
	PreSessionLifetimeMin = MustGetInt("PRE_SESSION_LIFETIME_MIN", 15)
	CSRFTokenLength = MustGetInt("CSRF_TOKEN_LENGTH", 32)
	CSRFTokenCharset = MustGetString("CSRF_TOKEN_CHARSET", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	PageSizeMax = MustGetInt("PAGE_SIZE_MAX", 100)
	PageSizeDefault = MustGetInt("PAGE_SIZE_DEFAULT", 10)

	switch dBType {
	case "postgres":
		DBType = "postgres"
	case "sqlite":
		DBType = "sqlite"
	default:
		DBType = "sqlite"
	}

	switch paymentProvider {
	case "polar":
		PaymentProvider = "polar"
	default:
		PaymentProvider = "polar"
	}

	switch sessionCookieSameSite {
	case "lax":
		SessionCookieSameSiteMode = http.SameSiteLaxMode
	case "strict":
		SessionCookieSameSiteMode = http.SameSiteStrictMode
	default:
		SessionCookieSameSiteMode = http.SameSiteNoneMode
	}
}
