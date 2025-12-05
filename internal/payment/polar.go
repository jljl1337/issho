package payment

import (
	polargo "github.com/polarsource/polar-go"
)

type PolarProvider struct {
	client *polargo.Polar
}

func NewPolarProvider(accessToken string, isSandbox bool) *PolarProvider {
	server := polargo.ServerProduction
	if isSandbox {
		server = polargo.ServerSandbox
	}

	s := polargo.New(
		polargo.WithServer(server),
		polargo.WithSecurity(accessToken),
	)

	return &PolarProvider{
		client: s,
	}
}

func intPtrToInt64Ptr(i *int) *int64 {
	if i == nil {
		return nil
	}
	val := int64(*i)
	return &val
}

func int64PtrToIntPtr(i *int64) *int {
	if i == nil {
		return nil
	}
	val := int(*i)
	return &val
}
