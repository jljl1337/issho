package service

import (
	"github.com/jmoiron/sqlx"

	"github.com/jljl1337/issho/internal/payment"
)

type EndpointService struct {
	db              *sqlx.DB
	paymentProvider payment.PaymentProvider
}

func NewEndpointService(db *sqlx.DB, paymentProvider payment.PaymentProvider) *EndpointService {
	return &EndpointService{
		db:              db,
		paymentProvider: paymentProvider,
	}
}
