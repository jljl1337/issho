package db

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"

	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
	"github.com/jljl1337/issho/internal/sql"
)

func Migrate(db *sqlx.DB) error {
	ctx := context.Background()

	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	queries := repository.New(tx)

	// Create the migrations table if it doesn't exist
	err = queries.CreateMigrationTable(ctx)
	if err != nil {
		return fmt.Errorf("failed to create migration table: %w", err)
	}

	// Get the list of applied migrations
	appliedMigrations, err := queries.GetAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Get all migrations from the embedded filesystem
	entryList, err := sql.MigrationDir.ReadDir("migration")
	if err != nil {
		return fmt.Errorf("failed to read migration directory: %w", err)
	}

	embeddedMigrationMap := make(map[string]repository.Migration)
	embeddedMigrationList := make([]repository.Migration, 0)

	now := generator.NowISO8601()

	for _, entry := range entryList {
		// Skip directories
		if entry.IsDir() {
			slog.Warn("Skipping directory in migrations: " + entry.Name())
			continue
		}

		// Get the migration statement
		filename := entry.Name()

		// Remove .up.sql or .down.sql suffix to get the migration ID
		if len(filename) < 7 || (filename[len(filename)-7:] != ".up.sql" && filename[len(filename)-9:] != ".down.sql") {
			slog.Warn("Skipping file with invalid migration filename: " + filename)
			continue
		}

		// Read the migration file
		statementBytes, err := sql.MigrationDir.ReadFile("migration/" + filename)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}
		statement := string(statementBytes)

		// Determine if it's an up or down migration
		var migrationID string
		isUp := false

		if filename[len(filename)-7:] == ".up.sql" {
			migrationID = filename[:len(filename)-7]
			isUp = true
		} else if filename[len(filename)-9:] == ".down.sql" {
			migrationID = filename[:len(filename)-9]
		}

		// Update or create the migration entry
		migration, exists := embeddedMigrationMap[migrationID]
		if !exists {
			migration = repository.Migration{
				ID:         migrationID,
				ExecutedAt: now,
			}
		}

		if isUp {
			migration.UpStatement = statement
		} else {
			migration.DownStatement = statement
		}

		embeddedMigrationMap[migrationID] = migration
		if exists {
			embeddedMigrationList = append(embeddedMigrationList, migration)
		}
	}

	if len(appliedMigrations) > len(embeddedMigrationList) {
		slog.Debug("Going to rollback applied migrations")
	} else if len(appliedMigrations) < len(embeddedMigrationList) {
		slog.Debug("Going to apply new migrations")
	} else {
		slog.Debug("Going to verify existing migrations")
	}

	minLen := min(len(appliedMigrations), len(embeddedMigrationList))

	// Verify overlap migrations
	for i := range minLen {
		if appliedMigrations[i].ID != embeddedMigrationList[i].ID ||
			appliedMigrations[i].UpStatement != embeddedMigrationList[i].UpStatement ||
			appliedMigrations[i].DownStatement != embeddedMigrationList[i].DownStatement {
			return fmt.Errorf("migration mismatch at index %d: applied migration %v does not match embedded migration %v", i, appliedMigrations[i], embeddedMigrationList[i])
		}
		slog.Debug("Verified migration: " + appliedMigrations[i].ID)
	}

	if len(appliedMigrations) < len(embeddedMigrationList) {
		// Apply new migrations
		for i := minLen; i < len(embeddedMigrationList); i++ {
			slog.Info("Applying migration: " + embeddedMigrationList[i].ID)
			_, err := tx.ExecContext(ctx, embeddedMigrationList[i].UpStatement)
			if err != nil {
				return fmt.Errorf("failed to apply migration %s: %w", embeddedMigrationList[i].ID, err)
			}

			err = queries.InsertMigration(ctx, embeddedMigrationList[i])
			if err != nil {
				return fmt.Errorf("failed to record applied migration %s: %w", embeddedMigrationList[i].ID, err)
			}
		}
	} else if len(appliedMigrations) > len(embeddedMigrationList) {
		// Rollback applied migrations
		for i := len(appliedMigrations) - 1; i >= minLen; i-- {
			slog.Info("Rolling back migration: " + appliedMigrations[i].ID)
			_, err := tx.ExecContext(ctx, appliedMigrations[i].DownStatement)
			if err != nil {
				return fmt.Errorf("failed to rollback migration %s: %w", appliedMigrations[i].ID, err)
			}

			err = queries.DeleteMigration(ctx, appliedMigrations[i].ID)
			if err != nil {
				return fmt.Errorf("failed to remove migration record %s: %w", appliedMigrations[i].ID, err)
			}
		}
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
