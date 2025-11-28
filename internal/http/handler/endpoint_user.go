package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/jljl1337/issho/internal/http/common"
	"github.com/jljl1337/issho/internal/http/middleware"
)

type getCurrentUserResponse struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	LanguageCode string `json:"languageCode"`
	CreatedAt    string `json:"createdAt"`
}

func (h *EndpointHandler) registerUserRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /users/me", h.getCurrentUser)
	mux.HandleFunc("PATCH /users/me/username", h.updateUsername)
	mux.HandleFunc("PATCH /users/me/password", h.updatePassword)
	mux.HandleFunc("PATCH /users/me/language", h.updateLanguage)
	mux.HandleFunc("DELETE /users/me", h.deleteCurrentUser)
}

func (h *EndpointHandler) getCurrentUser(w http.ResponseWriter, r *http.Request) {
	// Process the request
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		slog.Error("Error getting user ID from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	user, err := h.service.GetUserByID(r.Context(), userID)
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	response := getCurrentUserResponse{
		ID:           user.ID,
		Username:     user.Username,
		Email:        user.Email,
		Role:         user.Role,
		LanguageCode: user.LanguageCode,
		CreatedAt:    user.CreatedAt,
	}
	common.WriteJSONResponse(w, http.StatusOK, response)
}

func (h *EndpointHandler) updateUsername(w http.ResponseWriter, r *http.Request) {
	// Input validation
	var req struct {
		NewUsername string `json:"newUsername"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.NewUsername == "" {
		common.WriteMessageResponse(w, "New username is required", http.StatusBadRequest)
		return
	}

	// Process the request
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		slog.Error("Error getting user ID from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err := h.service.UpdateUsernameByID(r.Context(), userID, req.NewUsername); err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	common.WriteMessageResponse(w, "Username updated successfully", http.StatusOK)
}

func (h *EndpointHandler) updatePassword(w http.ResponseWriter, r *http.Request) {
	// Input validation
	var req struct {
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.NewPassword == "" {
		common.WriteMessageResponse(w, "New password is required", http.StatusBadRequest)
		return
	}

	// Process the request
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		slog.Error("Error getting user ID from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err := h.service.UpdatePasswordByID(r.Context(), userID, req.OldPassword, req.NewPassword); err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	common.WriteMessageResponse(w, "Password updated successfully", http.StatusOK)
}

func (h *EndpointHandler) updateLanguage(w http.ResponseWriter, r *http.Request) {
	// Input validation
	var req struct {
		LanguageCode string `json:"languageCode"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.LanguageCode == "" {
		common.WriteMessageResponse(w, "Language code is required", http.StatusBadRequest)
		return
	}

	// Process the request
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		slog.Error("Error getting user ID from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err := h.service.UpdateLanguageByID(r.Context(), userID, req.LanguageCode); err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	common.WriteMessageResponse(w, "Language updated successfully", http.StatusOK)
}

func (h *EndpointHandler) deleteCurrentUser(w http.ResponseWriter, r *http.Request) {
	// Process the request
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		slog.Error("Error getting user ID from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err := h.service.DeleteUserByID(r.Context(), userID); err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	http.SetCookie(w, NewExpiredSessionCookie())

	common.WriteMessageResponse(w, "User deleted successfully", http.StatusOK)
}
