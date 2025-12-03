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

func (h *EndpointHandler) registerProductRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /products", h.CreateProduct)
	mux.HandleFunc("GET /products", h.GetProductList)
	mux.HandleFunc("GET /products/{id}", h.GetProductByID)
	mux.HandleFunc("PUT /products/{id}", h.UpdateProductByID)
}

type CreateProductParams struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (h *EndpointHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req CreateProductParams
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userRole, err := middleware.GetUserRoleFromContext(r.Context())
	if err != nil {
		slog.Error("Error getting user role from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	err = h.service.CreateProduct(r.Context(), service.CreateProductParams{
		UserRole:    userRole,
		Name:        req.Name,
		Description: req.Description,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteMessageResponse(w, "Product created successfully", http.StatusCreated)
}

func (h *EndpointHandler) GetProductList(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	arg := service.GetProductListParams{}

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

	// Call service to get product list
	productList, err := h.service.GetProductList(r.Context(), arg)
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteJSONResponse(w, http.StatusOK, productList)
}

func (h *EndpointHandler) GetProductByID(w http.ResponseWriter, r *http.Request) {
	// Parse product ID from URL path
	productID := r.PathValue("id")
	if productID == "" {
		common.WriteMessageResponse(w, "Product ID is required", http.StatusBadRequest)
		return
	}

	// Call service to get product by ID
	product, err := h.service.GetProductByID(r.Context(), service.GetProductByIDParams{
		ID: productID,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteJSONResponse(w, http.StatusOK, product)
}

func (h *EndpointHandler) UpdateProductByID(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters and request body
	productID := r.PathValue("id")
	if productID == "" {
		common.WriteMessageResponse(w, "Product ID is required", http.StatusBadRequest)
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		IsActive    bool   `json:"isActive"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Call service to update product by ID
	err := h.service.UpdateProductByID(r.Context(), service.UpdateProductByIDParams{
		ProductID:   productID,
		Name:        req.Name,
		Description: req.Description,
		IsActive:    req.IsActive,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteMessageResponse(w, "Product updated successfully", http.StatusOK)
}
