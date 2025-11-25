package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

func main() {
	// Check if migration name argument is provided
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Migration name argument is required\n")
		os.Exit(1)
	}

	migrationName := os.Args[1]

	// Create timestamp (unix timestamp in milliseconds, first 13 digits)
	timestamp := time.Now().UnixMilli()

	// Create migration file paths
	migrationUpFile := filepath.Join("internal", "sql", "migration", fmt.Sprintf("%d_%s.up.sql", timestamp, migrationName))
	migrationDownFile := filepath.Join("internal", "sql", "migration", fmt.Sprintf("%d_%s.down.sql", timestamp, migrationName))

	// Ensure the directory exists
	dir := filepath.Dir(migrationUpFile)
	if err := os.MkdirAll(dir, 0755); err != nil {
		fmt.Fprintf(os.Stderr, "Error creating directory: %v\n", err)
		os.Exit(1)
	}

	// Create the migration up file
	fileUp, err := os.Create(migrationUpFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating migration up file: %v\n", err)
		os.Exit(1)
	}
	fileUp.Close()

	// Create the migration down file
	fileDown, err := os.Create(migrationDownFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error creating migration down file: %v\n", err)
		os.Exit(1)
	}
	fileDown.Close()

	fmt.Printf("Created migration files:\n  %s\n  %s\n", migrationUpFile, migrationDownFile)
}
