package repository

import (
	"context"
)

const createPrice = `
	INSERT INTO price (
		id,
		external_id,
		product_id,
		name,
		description,
		price_amount,
		price_currency,
		is_recurring,
		recurring_interval,
		recurring_interval_count,
		is_active,
		created_at,
		updated_at
	) VALUES (
		:id,
		:external_id,
		:product_id,
		:name,
		:description,
		:price_amount,
		:price_currency,
		:is_recurring,
		:recurring_interval,
		:recurring_interval_count,
		:is_active,
		:created_at,
		:updated_at
	)
`

func (q *Queries) CreatePrice(ctx context.Context, arg Price) error {
	return NamedExecOneRowContext(ctx, q.db, createPrice, arg)
}

const getPriceList = `
	SELECT
		*
	FROM
		price
	WHERE
		:cursor IS NULL OR :cursor_id IS NULL OR 
		updated_at < :cursor OR (
			updated_at = :cursor AND id < :cursor_id
		)
	ORDER BY
		updated_at DESC,
		id DESC
	LIMIT
		:page_size
`

type GetPriceListParams struct {
	Cursor   *string `db:"cursor"`
	CursorID *string `db:"cursor_id"`
	PageSize int     `db:"page_size"`
}

func (q *Queries) GetPriceList(ctx context.Context, arg GetPriceListParams) ([]Price, error) {
	items := []Price{}
	err := NamedSelectContext(ctx, q.db, &items, getPriceList, arg)
	return items, err
}

const getPriceByID = `
	SELECT
		*
	FROM
		price
	WHERE
		id = :id
`

type GetPriceByIDParams struct {
	ID string `db:"id"`
}

func (q *Queries) GetPriceByID(ctx context.Context, id string) ([]Price, error) {
	items := []Price{}
	err := NamedSelectContext(ctx, q.db, &items, getPriceByID, GetPriceByIDParams{ID: id})
	return items, err
}

const updatePrice = `
	UPDATE
		price
	SET
		name = :name,
		description = :description,
		price_amount = :price_amount,
		price_currency = :price_currency,
		is_recurring = :is_recurring,
		recurring_interval = :recurring_interval,
		recurring_interval_count = :recurring_interval_count,
		is_active = :is_active,
		updated_at = :updated_at
	WHERE
		id = :id
`

type UpdatePriceParams struct {
	Name                   string  `db:"name"`
	Description            string  `db:"description"`
	PriceAmount            int     `db:"price_amount"`
	PriceCurrency          string  `db:"price_currency"`
	IsRecurring            int     `db:"is_recurring"`
	RecurringInterval      *string `db:"recurring_interval"`
	RecurringIntervalCount *int    `db:"recurring_interval_count"`
	IsActive               int     `db:"is_active"`
	UpdatedAt              string  `db:"updated_at"`
	ID                     string  `db:"id"`
}

func (q *Queries) UpdatePrice(ctx context.Context, arg UpdatePriceParams) error {
	return NamedExecOneRowContext(ctx, q.db, updatePrice, arg)
}
