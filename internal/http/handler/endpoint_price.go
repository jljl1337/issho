package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/http/common"
	"github.com/jljl1337/issho/internal/http/middleware"
	"github.com/jljl1337/issho/internal/service"
)

func (h *EndpointHandler) registerPriceRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /prices", h.CreatePrice)
	mux.HandleFunc("GET /prices", h.GetPriceList)
	mux.HandleFunc("GET /prices/{id}", h.GetPriceByID)
	mux.HandleFunc("PUT /prices/{id}", h.UpdatePriceByID)
}

type CreatePriceParams struct {
	ProductID              string  `json:"productId"`
	Name                   string  `json:"name"`
	Description            string  `json:"description"`
	PriceAmount            int     `json:"priceAmount"`
	PriceCurrency          string  `json:"priceCurrency"`
	IsRecurring            bool    `json:"isRecurring"`
	RecurringInterval      *string `json:"recurringInterval"`
	RecurringIntervalCount *int    `json:"recurringIntervalCount"`
}

func (h *EndpointHandler) CreatePrice(w http.ResponseWriter, r *http.Request) {
	var req CreatePriceParams
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		slog.Error("Error getting user from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	err := h.service.CreatePrice(r.Context(), service.CreatePriceParams{
		UserRole:               user.Role,
		ProductID:              req.ProductID,
		Name:                   req.Name,
		Description:            req.Description,
		PriceAmount:            req.PriceAmount,
		PriceCurrency:          req.PriceCurrency,
		IsRecurring:            req.IsRecurring,
		RecurringInterval:      req.RecurringInterval,
		RecurringIntervalCount: req.RecurringIntervalCount,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteMessageResponse(w, "Price created successfully", http.StatusCreated)
}

func (h *EndpointHandler) GetPriceList(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	arg := service.GetPriceListParams{}

	cursor := r.URL.Query().Get("cursor")
	if cursor != "" {
		arg.Cursor = &cursor
	}

	cursorID := r.URL.Query().Get("cursor-id")
	if cursorID != "" {
		arg.CursorID = &cursorID
	}

	if (cursor != "" && cursorID == "") || (cursor == "" && cursorID != "") {
		common.WriteMessageResponse(w, "Both cursor and cursor-id must be provided together", http.StatusBadRequest)
		return
	}

	pageSize := r.URL.Query().Get("page-size")
	if pageSize != "" {
		ps, err := strconv.Atoi(pageSize)
		if err != nil {
			common.WriteMessageResponse(w, "Invalid page-size parameter", http.StatusBadRequest)
			return
		}
		arg.PageSize = ps
	} else {
		arg.PageSize = env.PageSizeDefault
	}

	// Call service to get price list
	priceList, err := h.service.GetPriceList(r.Context(), arg)
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteJSONResponse(w, http.StatusOK, priceList)
}

func (h *EndpointHandler) GetPriceByID(w http.ResponseWriter, r *http.Request) {
	// Parse price ID from URL path
	priceID := r.PathValue("id")
	if priceID == "" {
		common.WriteMessageResponse(w, "Price ID is required", http.StatusBadRequest)
		return
	}

	// Call service to get price by ID
	price, err := h.service.GetPriceByID(r.Context(), service.GetPriceByIDParams{
		PriceID: priceID,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteJSONResponse(w, http.StatusOK, price)
}

func (h *EndpointHandler) UpdatePriceByID(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters and request body
	priceID := r.PathValue("id")
	if priceID == "" {
		common.WriteMessageResponse(w, "Price ID is required", http.StatusBadRequest)
		return
	}

	var req struct {
		Name                   string  `json:"name"`
		Description            string  `json:"description"`
		PriceAmount            int     `json:"priceAmount"`
		PriceCurrency          string  `json:"priceCurrency"`
		IsRecurring            bool    `json:"isRecurring"`
		RecurringInterval      *string `json:"recurringInterval"`
		RecurringIntervalCount *int    `json:"recurringIntervalCount"`
		IsActive               bool    `json:"isActive"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Call service to update price by ID
	err := h.service.UpdatePriceByID(r.Context(), service.UpdatePriceByIDParams{
		PriceID:                priceID,
		Name:                   req.Name,
		Description:            req.Description,
		PriceAmount:            req.PriceAmount,
		PriceCurrency:          req.PriceCurrency,
		IsRecurring:            req.IsRecurring,
		RecurringInterval:      req.RecurringInterval,
		RecurringIntervalCount: req.RecurringIntervalCount,
		IsActive:               req.IsActive,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteMessageResponse(w, "Price updated successfully", http.StatusOK)
}
