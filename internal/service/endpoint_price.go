package service

import (
	"context"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
)

type CreatePriceParams struct {
	UserRole               string
	ProductID              string
	Name                   string
	Description            string
	PriceAmount            int
	PriceCurrency          string
	IsRecurring            bool
	RecurringInterval      *string
	RecurringIntervalCount *int
}

func (s *EndpointService) CreatePrice(ctx context.Context, arg CreatePriceParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to create price")
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

	price := repository.Price{
		ID:                     generator.NewULID(),
		ExternalID:             generator.NewULID(), // TODO: change to external ID generation method
		ProductID:              arg.ProductID,
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

	err = queries.CreatePrice(ctx, price)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create price: %v", err)
	}

	return nil
}

type GetPriceListParams struct {
	Cursor   *string
	CursorID *string
	PageSize int
}

func (s *EndpointService) GetPriceList(ctx context.Context, arg GetPriceListParams) ([]repository.Price, error) {
	if arg.PageSize <= 0 || arg.PageSize > env.PageSizeMax {
		arg.PageSize = env.PageSizeDefault
	}

	queries := repository.New(s.db)

	prices, err := queries.GetPriceList(ctx, repository.GetPriceListParams{
		Cursor:   arg.Cursor,
		CursorID: arg.CursorID,
		PageSize: arg.PageSize,
	})
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get price list: %v", err)
	}

	return prices, nil
}

type GetPriceByIDParams struct {
	PriceID string
}

func (s *EndpointService) GetPriceByID(ctx context.Context, arg GetPriceByIDParams) (*repository.Price, error) {
	queries := repository.New(s.db)

	priceList, err := queries.GetPriceByID(ctx, arg.PriceID)
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get price by ID: %v", err)
	}

	if len(priceList) == 0 {
		return nil, NewServiceError(ErrCodeNotFound, "price not found")
	}

	if len(priceList) > 1 {
		return nil, NewServiceError(ErrCodeInternal, "multiple prices found with the same ID")
	}

	price := priceList[0]

	return &price, nil
}

type UpdatePriceByIDParams struct {
	UserRole               string
	PriceID                string
	Name                   string
	Description            string
	PriceAmount            int
	PriceCurrency          string
	IsRecurring            bool
	RecurringInterval      *string
	RecurringIntervalCount *int
	IsActive               bool
}

func (s *EndpointService) UpdatePriceByID(ctx context.Context, arg UpdatePriceByIDParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to update price")
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

	priceList, err := queries.GetPriceByID(ctx, arg.PriceID)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get price by ID: %v", err)
	}

	if len(priceList) == 0 {
		return NewServiceError(ErrCodeNotFound, "price not found")
	}

	if len(priceList) > 1 {
		return NewServiceError(ErrCodeInternal, "multiple prices found with the same ID")
	}

	price := priceList[0]

	// Only modify active status if reactivating a price
	if price.IsActive == 0 && arg.IsActive {
		arg.Name = price.Name
		arg.Description = price.Description
		arg.PriceAmount = price.PriceAmount
		arg.PriceCurrency = price.PriceCurrency
		arg.IsRecurring = intToBool(price.IsRecurring)
		arg.RecurringInterval = price.RecurringInterval
		arg.RecurringIntervalCount = price.RecurringIntervalCount
	}

	now := generator.NowISO8601()

	params := repository.UpdatePriceParams{
		Name:                   arg.Name,
		Description:            arg.Description,
		PriceAmount:            arg.PriceAmount,
		PriceCurrency:          arg.PriceCurrency,
		IsRecurring:            boolToInt(arg.IsRecurring),
		RecurringInterval:      arg.RecurringInterval,
		RecurringIntervalCount: arg.RecurringIntervalCount,
		UpdatedAt:              now,
		IsActive:               boolToInt(arg.IsActive),
		ID:                     arg.PriceID,
	}

	err = queries.UpdatePrice(ctx, params)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update price: %v", err)
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
			return NewServiceError(ErrCodeUnprocessable, "recurring interval is required for recurring prices")
		}
		if intervalCount == nil || *intervalCount <= 0 {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval count must be greater than 0 for recurring prices")
		}

		if _, ok := mapRecurringIntervalsAllowed[*interval]; !ok {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval is not supported")
		}
	} else {
		if interval != nil {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval must be nil for non-recurring prices")
		}
		if intervalCount != nil {
			return NewServiceError(ErrCodeUnprocessable, "recurring interval count must be nil for non-recurring prices")
		}
	}
	return nil
}
