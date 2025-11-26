package db

import (
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

func NewDB(dbType, sqliteDbPath, sqliteDbBusyTimeout, postgresURL string) (*sqlx.DB, error) {
	switch dbType {
	case "postgres":
		if postgresURL == "" {
			return nil, fmt.Errorf("POSTGRES_URL is required when DB_TYPE is postgresql")
		}
		return sqlx.Open("pgx", postgresURL)

	case "sqlite":
		// Create parent directories if they don't exist
		if err := os.MkdirAll(filepath.Dir(sqliteDbPath), os.ModePerm); err != nil {
			return nil, err
		}

		dsn := "file:" + sqliteDbPath
		dsn = dsn + "?_journal=WAL"
		dsn = dsn + "&_foreign_keys=true"
		dsn = dsn + "&_busy_timeout=" + sqliteDbBusyTimeout
		return sqlx.Open("sqlite3", dsn)

	default:
		return nil, fmt.Errorf("unsupported database type: %s (must be 'sqlite' or 'postgresql')", dbType)
	}
}
