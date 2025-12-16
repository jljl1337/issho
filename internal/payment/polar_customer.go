package payment

import (
	"context"
	"fmt"
	"net/http"
)

func (p *PolarProvider) CreateCustomer(ctx context.Context, params CreateCustomerParams) (string, error) {
	body := map[string]any{
		"name":  params.Name,
		"email": params.Email,
	}

	resp := &struct {
		ExternalID string `json:"id"`
	}{}

	err := p.sendRequest(http.MethodPost, "/customers/", body, resp)
	if err != nil {
		return "", fmt.Errorf("error creating customer in Polar: %w", err)
	}

	return resp.ExternalID, nil
}

func (p *PolarProvider) UpdateCustomer(ctx context.Context, params UpdateCustomerParams) error {
	body := map[string]any{
		"name":  params.Name,
		"email": params.Email,
	}

	err := p.sendRequest(http.MethodPatch, "/customers/"+params.ExternalID, body, nil)
	if err != nil {
		return fmt.Errorf("error updating customer in Polar: %w", err)
	}

	return nil
}

func (p *PolarProvider) DeleteCustomer(ctx context.Context, externalID string) error {
	err := p.sendRequest(http.MethodDelete, "/customers/"+externalID, nil, nil)
	if err != nil {
		return fmt.Errorf("error deleting customer in Polar: %w", err)
	}

	return nil
}
