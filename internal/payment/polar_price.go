package payment

import (
	"context"
	"fmt"

	"github.com/polarsource/polar-go/models/components"
	"github.com/polarsource/polar-go/models/operations"

	"github.com/jljl1337/issho/internal/repository"
)

func (p *PolarProvider) CreatePrice(ctx context.Context, params CreatePriceParams) (*repository.Price, error) {
	var res *operations.ProductsCreateResponse
	var err error

	if params.IsRecurring {
		res, err = p.client.Products.Create(ctx, components.CreateProductCreateProductCreateRecurring(
			components.ProductCreateRecurring{
				Name:                   params.Name,
				Description:            &params.Description,
				RecurringInterval:      components.SubscriptionRecurringInterval(*params.RecurringInterval),
				RecurringIntervalCount: intPtrToInt64Ptr(params.RecurringIntervalCount),
				Prices: []components.ProductCreateRecurringPrices{
					components.CreateProductCreateRecurringPricesFixed(
						components.ProductPriceFixedCreate{
							PriceAmount:   int64(params.PriceAmount),
							PriceCurrency: &params.PriceCurrency,
						},
					),
				},
			},
		))
	} else {
		res, err = p.client.Products.Create(ctx, components.CreateProductCreateProductCreateOneTime(
			components.ProductCreateOneTime{
				Name:        params.Name,
				Description: &params.Description,
				Prices: []components.ProductCreateOneTimePrices{
					components.CreateProductCreateOneTimePricesFixed(
						components.ProductPriceFixedCreate{
							PriceAmount:   int64(params.PriceAmount),
							PriceCurrency: &params.PriceCurrency,
						},
					),
				},
			},
		))
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create product: %v", err)
	}

	if res.Product == nil {
		return nil, fmt.Errorf("failed to create product: no product returned")
	}

	return toPrice(res.Product), nil
}

func (p *PolarProvider) UpdatePrice(ctx context.Context, params UpdatePriceParams) (*repository.Price, error) {
	isActive := !params.IsActive

	res, err := p.client.Products.Update(ctx, params.ExternalID, components.ProductUpdate{
		Name:        &params.Name,
		Description: &params.Description,
		Prices: []components.ProductUpdatePrices{
			components.CreateProductUpdatePricesTwo(
				components.CreateTwoFixed(
					components.ProductPriceFixedCreate{
						PriceAmount:   int64(params.PriceAmount),
						PriceCurrency: &params.PriceCurrency,
					},
				),
			),
		},
		IsArchived: &isActive,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to update product: %v", err)
	}

	if res.Product == nil {
		return nil, fmt.Errorf("failed to update product: no product returned")
	}

	return toPrice(res.Product), nil
}

func toPrice(p *components.Product) *repository.Price {
	var RecurringInterval *string = nil
	var RecurringIntervalCount *int = nil
	if p.IsRecurring {
		if p.RecurringInterval != nil {
			s := string(*p.RecurringInterval)
			RecurringInterval = &s
		}
		RecurringIntervalCount = int64PtrToIntPtr(p.RecurringIntervalCount)
	}
	Description := ""
	if p.Description != nil {
		Description = *p.Description
	}

	isActive := !p.IsArchived

	price := &repository.Price{
		ExternalID:             p.ID,
		Name:                   p.Name,
		Description:            Description,
		PriceAmount:            int(p.Prices[0].ProductPrice.ProductPriceFixed.PriceAmount),
		PriceCurrency:          p.Prices[0].ProductPrice.ProductPriceFixed.PriceCurrency,
		IsRecurring:            p.IsRecurring,
		RecurringInterval:      RecurringInterval,
		RecurringIntervalCount: RecurringIntervalCount,
		IsActive:               isActive,
	}

	return price
}
