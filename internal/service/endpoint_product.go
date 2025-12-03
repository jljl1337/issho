package service

import (
	"context"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
)

type CreateProductParams struct {
	UserRole    string
	Name        string
	Description string
}

func (s *EndpointService) CreateProduct(ctx context.Context, arg CreateProductParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to create product")
	}

	now := generator.NowISO8601()

	queries := repository.New(s.db)

	product := repository.Product{
		ID:          generator.NewULID(),
		ExternalID:  nil, // TODO: integrate with external systems if needed
		Name:        arg.Name,
		Description: arg.Description,
		IsActive:    1,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	err := queries.CreateProduct(ctx, product)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create product: %v", err)
	}

	return nil
}

type GetProductListParams struct {
	Cursor   *string
	CursorID *string
	PageSize int
}

func (s *EndpointService) GetProductList(ctx context.Context, arg GetProductListParams) ([]repository.Product, error) {
	if arg.PageSize <= 0 || arg.PageSize > env.PageSizeMax {
		arg.PageSize = env.PageSizeDefault
	}

	queries := repository.New(s.db)

	products, err := queries.GetProductList(ctx, repository.GetProductListParams{
		Cursor:   arg.Cursor,
		CursorID: arg.CursorID,
		PageSize: arg.PageSize,
	})
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get product list: %v", err)
	}

	return products, nil
}

type GetProductByIDParams struct {
	ID string `db:"id"`
}

func (s *EndpointService) GetProductByID(ctx context.Context, arg GetProductByIDParams) (*repository.Product, error) {
	queries := repository.New(s.db)

	productList, err := queries.GetProductByID(ctx, arg.ID)
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get product by ID: %v", err)
	}

	if len(productList) == 0 {
		return nil, NewServiceError(ErrCodeNotFound, "product not found")
	}

	if len(productList) > 1 {
		return nil, NewServiceError(ErrCodeInternal, "multiple products found with the same ID")
	}

	product := productList[0]

	return &product, nil
}

type UpdateProductByIDParams struct {
	UserRole    string
	ProductID   string
	Name        string
	Description string
	IsActive    bool
}

func (s *EndpointService) UpdateProductByID(ctx context.Context, arg UpdateProductByIDParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to update product")
	}

	queries := repository.New(s.db)

	productList, err := queries.GetProductByID(ctx, arg.ProductID)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get product by ID: %v", err)
	}

	if len(productList) == 0 {
		return NewServiceError(ErrCodeNotFound, "product not found")
	}

	if len(productList) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple products found with the same ID")
	}

	product := productList[0]

	// Only modify active status if reactivating a product
	if product.IsActive == 0 && boolToInt(arg.IsActive) == 1 {
		arg.Name = product.Name
		arg.Description = product.Description
	}

	now := generator.NowISO8601()

	params := repository.UpdateProductByIDParams{
		ID:          arg.ProductID,
		Name:        arg.Name,
		Description: arg.Description,
		IsActive:    boolToInt(arg.IsActive),
		UpdatedAt:   now,
	}

	err = queries.UpdateProductByID(ctx, params)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update product: %v", err)
	}

	return nil
}
