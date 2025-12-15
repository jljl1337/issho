package payment

import (
	"context"
	"fmt"
	"net/http"

	"github.com/jljl1337/issho/internal/repository"
)

type PolarProductResponse struct {
	ID                     string               `json:"id"`
	Name                   string               `json:"name"`
	Description            *string              `json:"description"`
	IsRecurring            bool                 `json:"is_recurring"`
	RecurringInterval      *string              `json:"recurring_interval"`
	RecurringIntervalCount *int                 `json:"recurring_interval_count"`
	IsArchived             bool                 `json:"is_archived"`
	Price                  []PolarPriceResponse `json:"prices"`
}

type PolarPriceResponse struct {
	PriceAmount   int    `json:"price_amount"`
	PriceCurrency string `json:"price_currency"`
}

func (p *PolarProvider) CreatePrice(ctx context.Context, params CreatePriceParams) (*repository.Price, error) {
	body := map[string]any{
		"name":        params.Name,
		"description": params.Description,
		"prices": []map[string]any{{
			"amount_type":    "fixed",
			"price_amount":   params.PriceAmount,
			"price_currency": params.PriceCurrency,
		}},
	}

	if params.IsRecurring {
		body["recurring_interval"] = params.RecurringInterval
		body["recurring_interval_count"] = params.RecurringIntervalCount
	}

	response := &PolarProductResponse{}
	err := p.sendRequest(http.MethodPost, "/products/", body, response)
	if err != nil {
		return nil, fmt.Errorf("error creating price in Polar: %w", err)
	}

	return toPrice(*response), nil
}

func (p *PolarProvider) UpdatePrice(ctx context.Context, params UpdatePriceParams) (*repository.Price, error) {
	body := map[string]any{
		"name":        params.Name,
		"description": params.Description,
		"prices": []map[string]any{{
			"amount_type":    "fixed",
			"price_amount":   params.PriceAmount,
			"price_currency": params.PriceCurrency,
		}},
		"is_archived": !params.IsActive,
	}

	// TODO: remove?
	if params.IsRecurring {
		body["recurring_interval"] = params.RecurringInterval
		body["recurring_interval_count"] = params.RecurringIntervalCount
	}

	response := &PolarProductResponse{}
	err := p.sendRequest(http.MethodPatch, "/products/"+params.ExternalID, body, response)
	if err != nil {
		return nil, fmt.Errorf("error creating price in Polar: %w", err)
	}

	return toPrice(*response), nil
}

func toPrice(resp PolarProductResponse) *repository.Price {
	price := &repository.Price{
		ExternalID:    resp.ID,
		Name:          resp.Name,
		Description:   "",
		PriceAmount:   resp.Price[0].PriceAmount,
		PriceCurrency: resp.Price[0].PriceCurrency,
		IsRecurring:   resp.IsRecurring,
		IsActive:      !resp.IsArchived,
	}

	if resp.Description != nil {
		price.Description = *resp.Description
	}

	if resp.IsRecurring {
		price.RecurringInterval = resp.RecurringInterval
		price.RecurringIntervalCount = resp.RecurringIntervalCount
	}

	return price
}
