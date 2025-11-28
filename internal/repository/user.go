package repository

import (
	"context"
)

const createUser = `
INSERT INTO "user" (
    id,
    username,
    email,
    password_hash,
	role,
	language_code,
    created_at,
    updated_at
) VALUES (
	:id,
	:username,
	:email,
	:password_hash,
	:role,
	:language_code,
	:created_at,
	:updated_at
)
`

func (q *Queries) CreateUser(ctx context.Context, arg User) error {
	return NamedExecOneRowContext(ctx, q.db, createUser, arg)
}

const getUserCountByRole = `
SELECT
	COUNT(*) AS count
FROM
	"user"
WHERE
	role = :role
`

type GetUserCountByRoleParams struct {
	Role string `db:"role"`
}

func (q *Queries) GetUserCountByRole(ctx context.Context, role string) (int, error) {
	var count int
	err := NamedGetContext(ctx, q.db, &count, getUserCountByRole, GetUserCountByRoleParams{Role: role})
	return count, err
}

const getUserByID = `
SELECT
    *
FROM
    "user"
WHERE
    id = :id
`

type GetUserByIDParams struct {
	ID string `db:"id"`
}

func (q *Queries) GetUserByID(ctx context.Context, id string) (User, error) {
	user := User{}
	err := NamedGetContext(ctx, q.db, &user, getUserByID, GetUserByIDParams{ID: id})
	return user, err
}

const getUserByUsername = `
SELECT
    *
FROM
    "user"
WHERE
    username = :username
`

type GetUserByUsernameParams struct {
	Username string `db:"username"`
}

func (q *Queries) GetUserByUsername(ctx context.Context, username string) ([]User, error) {
	items := []User{}
	err := NamedSelectContext(ctx, q.db, &items, getUserByUsername, GetUserByUsernameParams{Username: username})
	return items, err
}

const getUserByEmail = `
SELECT
    *
FROM
    "user"
WHERE
    email = :email
`

type GetUserByEmailParams struct {
	Email string `db:"email"`
}

func (q *Queries) GetUserByEmail(ctx context.Context, email string) ([]User, error) {
	items := []User{}
	err := NamedSelectContext(ctx, q.db, &items, getUserByEmail, GetUserByEmailParams{Email: email})
	return items, err
}

const updateUserPassword = `
UPDATE
    "user"
SET
    password_hash = :password_hash,
    updated_at = :updated_at
WHERE
    id = :id
`

type UpdateUserPasswordParams struct {
	PasswordHash string `db:"password_hash"`
	UpdatedAt    string `db:"updated_at"`
	ID           string `db:"id"`
}

func (q *Queries) UpdateUserPassword(ctx context.Context, arg UpdateUserPasswordParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateUserPassword, arg)
}

const updateUserUsername = `
UPDATE
    "user"
SET
    username = :username,
    updated_at = :updated_at
WHERE
    id = :id
`

type UpdateUserUsernameParams struct {
	Username  string `db:"username"`
	UpdatedAt string `db:"updated_at"`
	ID        string `db:"id"`
}

func (q *Queries) UpdateUserUsername(ctx context.Context, arg UpdateUserUsernameParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateUserUsername, arg)
}

const updateUserEmail = `
UPDATE
    "user"
SET
    email = :email,
    updated_at = :updated_at
WHERE
    id = :id
`

type UpdateUserEmailParams struct {
	Email     string `db:"email"`
	UpdatedAt string `db:"updated_at"`
	ID        string `db:"id"`
}

func (q *Queries) UpdateUserEmail(ctx context.Context, arg UpdateUserEmailParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateUserEmail, arg)
}

const updateUserLanguage = `
UPDATE
    "user"
SET
    language_code = :language_code,
    updated_at = :updated_at
WHERE
    id = :id
`

type UpdateUserLanguageParams struct {
	LanguageCode string `db:"language_code"`
	UpdatedAt    string `db:"updated_at"`
	ID           string `db:"id"`
}

func (q *Queries) UpdateUserLanguage(ctx context.Context, arg UpdateUserLanguageParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateUserLanguage, arg)
}

const deleteUser = `
DELETE FROM
    "user"
WHERE
    id = :id
`

type DeleteUserParams struct {
	ID string `db:"id"`
}

func (q *Queries) DeleteUser(ctx context.Context, id string) error {
	return NamedExecOneRowContext(ctx, q.db, deleteUser, DeleteUserParams{ID: id})
}
