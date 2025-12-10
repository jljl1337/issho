package repository

import "context"

const createEmail = `
	INSERT INTO email (
		id,
		type,
		to_address,
		cc_address,
		bcc_address,
		from_address,
		subject,
		body,
		status,
		created_at,
		updated_at
	) VALUES (
		:id,
		:type,
		:to_address,
		:cc_address,
		:bcc_address,
		:from_address,
		:subject,
		:body,
		:status,
		:created_at,
		:updated_at
	)
	RETURNING
		*
`

func (q *Queries) CreateEmail(ctx context.Context, arg Email) (Email, error) {
	var item Email
	err := NamedGetContext(ctx, q.db, &item, createEmail, arg)
	return item, err
}

const getEmailByID = `
	SELECT
		*
	FROM
		email
	WHERE
		id = :id
`

type GetEmailByIDParams struct {
	ID string `db:"id"`
}

func (q *Queries) GetEmailByID(ctx context.Context, arg GetEmailByIDParams) (Email, error) {
	var item Email
	err := NamedGetContext(ctx, q.db, &item, getEmailByID, arg)
	return item, err
}

const updateEmailStatusByID = `
	UPDATE
		email
	SET
		status = :status,
		updated_at = :updated_at
	WHERE
		id = :id
`

type UpdateEmailStatusByIDParams struct {
	ID        string `db:"id"`
	Status    string `db:"status"`
	UpdatedAt string `db:"updated_at"`
}

func (q *Queries) UpdateEmailStatusByID(ctx context.Context, arg UpdateEmailStatusByIDParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateEmailStatusByID, arg)
}
