package payment

import (
	"context"

	"github.com/jljl1337/issho/internal/repository"
)

func (p *PolarProvider) CreateProduct(ctx context.Context, params CreateProductParams) (*repository.Product, error) {
	return &repository.Product{
		ExternalID:  nil,
		Name:        params.Name,
		Description: params.Description,
		IsActive:    true,
	}, nil
}

func (p *PolarProvider) UpdateProduct(ctx context.Context, params UpdateProductParams) (*repository.Product, error) {
	return &repository.Product{
		ExternalID:  nil,
		Name:        params.Name,
		Description: params.Description,
		IsActive:    true,
	}, nil
}
