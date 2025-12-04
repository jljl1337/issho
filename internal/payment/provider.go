package payment

import (
	"context"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/repository"
)

type CreateProductParams struct {
	Name        string
	Description string
}

type UpdateProductParams struct {
	ExternalID  string
	Name        string
	Description string
	IsActive    bool
}

type CreatePriceParams struct {
	ProductExternalID      *string
	Name                   string
	Description            string
	PriceAmount            int
	PriceCurrency          string
	IsRecurring            bool
	RecurringInterval      *string
	RecurringIntervalCount *int
}

type UpdatePriceParams struct {
	ExternalID             string
	Name                   string
	Description            string
	PriceAmount            int
	PriceCurrency          string
	IsRecurring            bool
	RecurringInterval      *string
	RecurringIntervalCount *int
	IsActive               bool
}

type PaymentProvider interface {
	CreateProduct(ctx context.Context, params CreateProductParams) (*repository.Product, error)
	UpdateProduct(ctx context.Context, params UpdateProductParams) (*repository.Product, error)

	CreatePrice(ctx context.Context, params CreatePriceParams) (*repository.Price, error)
	UpdatePrice(ctx context.Context, params UpdatePriceParams) (*repository.Price, error)
}

func NewPaymentProvider(providerName string) PaymentProvider {
	switch providerName {
	case "polar":
		return NewPolarProvider(env.PolarAccessToken, env.PolarIsSandbox)
	default:
		return nil
	}
}
