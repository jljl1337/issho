package repository

import (
	"context"
)

const createProduct = `
	INSERT INTO product (
		id,
		external_id,
		name,
		description,
		is_active,
		created_at,
		updated_at
	) VALUES (
		:id,
		:external_id,
		:name,
		:description,
		:is_active,
		:created_at,
		:updated_at
	)
`

func (q *Queries) CreateProduct(ctx context.Context, arg Product) error {
	return NamedExecOneRowContext(ctx, q.db, createProduct, arg)
}

const getProductList = `
	SELECT
		*
	FROM
		product
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

type GetProductListParams struct {
	Cursor   *string `db:"cursor"`
	CursorID *string `db:"cursor_id"`
	PageSize int     `db:"page_size"`
}

func (q *Queries) GetProductList(ctx context.Context, arg GetProductListParams) ([]Product, error) {
	items := []Product{}
	err := NamedSelectContext(ctx, q.db, &items, getProductList, arg)
	return items, err
}

const getProductByID = `
	SELECT
		*
	FROM
		product
	WHERE
		id = :id
`

type GetProductByIDParams struct {
	ID string `db:"id"`
}

func (q *Queries) GetProductByID(ctx context.Context, id string) ([]Product, error) {
	items := []Product{}

	err := NamedSelectContext(ctx, q.db, &items, getProductByID, GetProductByIDParams{
		ID: id,
	})
	return items, err
}

const updateProductByID = `
	UPDATE
		product
	SET
		name = :name,
		description = :description,
		is_active = :is_active,
		updated_at = :updated_at
	WHERE
		id = :id
`

type UpdateProductByIDParams struct {
	ID          string `db:"id"`
	Name        string `db:"name"`
	Description string `db:"description"`
	IsActive    bool   `db:"is_active"`
	UpdatedAt   string `db:"updated_at"`
}

func (q *Queries) UpdateProductByID(ctx context.Context, arg UpdateProductByIDParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateProductByID, arg)
}
