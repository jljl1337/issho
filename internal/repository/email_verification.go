package repository

import (
	"context"
)

const createEmailVerification = `
	INSERT INTO email_verification (
		id,
		user_id,
		type,
		email,
		code,
		status,
		expires_at,
		created_at,
		updated_at
	) VALUES (
		:id,
		:user_id,
		:type,
		:email,
		:code,
		:status,
		:expires_at,
		:created_at,
		:updated_at
	)
`

func (q *Queries) CreateEmailVerification(ctx context.Context, arg EmailVerification) error {
	return NamedExecOneRowContext(ctx, q.db, createEmailVerification, arg)
}

const getValidEmailVerification = `
	SELECT
		*
	FROM
		email_verification
	WHERE
		user_id = :user_id AND
		type = :type AND
		status = :status AND
		expires_at > :now
`

type GetValidEmailVerificationParams struct {
	UserID string `db:"user_id"`
	Type   string `db:"type"`
	Status string `db:"status"`
	Now    string `db:"now"`
}

func (q *Queries) GetValidEmailVerification(ctx context.Context, arg GetValidEmailVerificationParams) ([]EmailVerification, error) {
	items := []EmailVerification{}

	err := NamedSelectContext(ctx, q.db, &items, getValidEmailVerification, arg)

	return items, err
}

const updateEmailVerificationStatusByID = `
	UPDATE
		email_verification
	SET
		status = :status,
		updated_at = :updated_at
	WHERE
		id = :id
`

type UpdateEmailVerificationStatusByIDParams struct {
	ID        string `db:"id"`
	Status    string `db:"status"`
	UpdatedAt string `db:"updated_at"`
}

func (q *Queries) UpdateEmailVerificationStatusByID(ctx context.Context, arg UpdateEmailVerificationStatusByIDParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateEmailVerificationStatusByID, arg)
}
