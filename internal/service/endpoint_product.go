package service

import (
	"context"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
)

type CreateProductParams struct {
	UserRole               string
	Name                   string
	Description            string
	PriceAmount            int
	PriceCurrency          string
	IsRecurring            bool
	RecurringInterval      *string
	RecurringIntervalCount *int
}

func (s *EndpointService) CreateProduct(ctx context.Context, arg CreateProductParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to create product")
	}

	err := checkAmountAndCurrency(arg.PriceAmount, arg.PriceCurrency)
	if err != nil {
		return err
	}

	err = checkRecurringParams(arg.IsRecurring, arg.RecurringInterval, arg.RecurringIntervalCount)
	if err != nil {
		return err
	}

	now := generator.NowISO8601()

	queries := repository.New(s.db)

	product := repository.Product{
		ID:                     generator.NewULID(),
		Name:                   arg.Name,
		Description:            arg.Description,
		PriceAmount:            arg.PriceAmount,
		PriceCurrency:          arg.PriceCurrency,
		IsRecurring:            boolToInt(arg.IsRecurring),
		RecurringInterval:      arg.RecurringInterval,
		RecurringIntervalCount: arg.RecurringIntervalCount,
		IsActive:               1,
		CreatedAt:              now,
		UpdatedAt:              now,
	}

	err = queries.CreateProduct(ctx, product)
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
	ProductID string
}

func (s *EndpointService) GetProductByID(ctx context.Context, arg GetProductByIDParams) (*repository.Product, error) {
	queries := repository.New(s.db)

	productList, err := queries.GetProductByID(ctx, arg.ProductID)
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
	UserRole               string
	ProductID              string
	Name                   string
	Description            string
	PriceAmount            int
	PriceCurrency          string
	IsRecurring            bool
	RecurringInterval      *string
	RecurringIntervalCount *int
	IsActive               bool
}

func (s *EndpointService) UpdateProductByID(ctx context.Context, arg UpdateProductByIDParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to update product")
	}

	err := checkAmountAndCurrency(arg.PriceAmount, arg.PriceCurrency)
	if err != nil {
		return err
	}

	err = checkRecurringParams(arg.IsRecurring, arg.RecurringInterval, arg.RecurringIntervalCount)
	if err != nil {
		return err
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
	if product.IsActive == 0 && arg.IsActive {
		arg.Name = product.Name
		arg.Description = product.Description
		arg.PriceAmount = product.PriceAmount
		arg.PriceCurrency = product.PriceCurrency
		arg.IsRecurring = intToBool(product.IsRecurring)
		arg.RecurringInterval = product.RecurringInterval
		arg.RecurringIntervalCount = product.RecurringIntervalCount
	}

	now := generator.NowISO8601()

	params := repository.UpdateProductParams{
		Name:                   arg.Name,
		Description:            arg.Description,
		PriceAmount:            arg.PriceAmount,
		PriceCurrency:          arg.PriceCurrency,
		IsRecurring:            boolToInt(arg.IsRecurring),
		RecurringInterval:      arg.RecurringInterval,
		RecurringIntervalCount: arg.RecurringIntervalCount,
		UpdatedAt:              now,
		IsActive:               boolToInt(arg.IsActive),
		ID:                     arg.ProductID,
	}

	err = queries.UpdateProduct(ctx, params)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update product: %v", err)
	}

	return nil
}

var mapCurrencyAllowed = map[string]bool{
	"usd": true,
}

func checkAmountAndCurrency(amount int, currency string) error {
	if amount < 0 {
		return NewServiceError(ErrCodeUnprocessable, "amount must be non-negative")
	}

	if _, ok := mapCurrencyAllowed[currency]; !ok {
		return NewServiceError(ErrCodeUnprocessable, "currency is not supported")
	}

	return nil
}

var mapRecurringIntervalsAllowed = map[string]bool{
	"day":   true,
	"week":  true,
	"month": true,
	"year":  true,
}

func checkRecurringParams(isRecurring bool, interval *string, intervalCount *int) error {
	if isRecurring {
		if interval == nil || *interval == "" {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval is required for recurring products")
		}
		if intervalCount == nil || *intervalCount <= 0 {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval count must be greater than 0 for recurring products")
		}

		if _, ok := mapRecurringIntervalsAllowed[*interval]; !ok {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval is not supported")
		}
	} else {
		if interval != nil {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval must be nil for non-recurring products")
		}
		if intervalCount != nil {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval count must be nil for non-recurring products")
		}
	}
	return nil
}
