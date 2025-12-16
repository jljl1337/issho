package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/http/common"
	"github.com/jljl1337/issho/internal/http/middleware"
	"github.com/jljl1337/issho/internal/service"
)

type signUpRequest struct {
	Username     string `json:"username"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	LanguageCode string `json:"languageCode"`
}

type signInRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type signInPreSessionCSRFTokenResponse struct {
	CSRFToken string `json:"csrfToken"`
}

func (h *EndpointHandler) registerAuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /auth/sign-up", h.signUp)
	mux.HandleFunc("POST /auth/pre-session", h.preSession)
	mux.HandleFunc("POST /auth/sign-in", h.signIn)
	mux.HandleFunc("POST /auth/sign-out", h.signOut)
	mux.HandleFunc("POST /auth/sign-out-all", h.signOutAll)
	mux.HandleFunc("GET /auth/csrf-token", h.csrfToken)
}

func (h *EndpointHandler) signUp(w http.ResponseWriter, r *http.Request) {
	// Input validation
	var req signUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" {
		common.WriteMessageResponse(w, "Username, email and password are required", http.StatusBadRequest)
		return
	}

	if req.LanguageCode == "" {
		common.WriteMessageResponse(w, "Language code is required", http.StatusBadRequest)
		return
	}

	if err := h.service.SignUp(r.Context(), service.SignUpParams{
		Username:     req.Username,
		Email:        req.Email,
		Password:     req.Password,
		LanguageCode: req.LanguageCode,
	}); err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	common.WriteMessageResponse(w, "User signed up successfully", http.StatusCreated)
}

func (h *EndpointHandler) preSession(w http.ResponseWriter, r *http.Request) {
	// Process the request
	sessionToken, CSRFToken, err := h.service.GetPreSession(r.Context())
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	http.SetCookie(w, NewActiveSessionCookie(sessionToken))

	common.WriteJSONResponse(w, http.StatusOK, signInPreSessionCSRFTokenResponse{
		CSRFToken: CSRFToken,
	})
}

func (h *EndpointHandler) signIn(w http.ResponseWriter, r *http.Request) {
	// Input validation
	preSessionToken, err := r.Cookie(env.SessionCookieName)
	if err != nil {
		common.WriteMessageResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	preSessionCSRFToken := r.Header.Get("X-CSRF-Token")
	if preSessionCSRFToken == "" {
		common.WriteMessageResponse(w, "CSRF token is required", http.StatusUnauthorized)
		return
	}

	var req signInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		common.WriteMessageResponse(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate that exactly one of username or email is provided
	if (req.Username == "" && req.Email == "") || (req.Username != "" && req.Email != "") {
		common.WriteMessageResponse(w, "Either username or email must be provided, but not both", http.StatusBadRequest)
		return
	}

	if req.Password == "" {
		common.WriteMessageResponse(w, "Password is required", http.StatusBadRequest)
		return
	}

	// Process the request
	sessionToken, CSRFToken, err := h.service.SignIn(r.Context(), service.SignInParams{
		PreSessionToken:     preSessionToken.Value,
		PreSessionCSRFToken: preSessionCSRFToken,
		Username:            req.Username,
		Email:               req.Email,
		Password:            req.Password,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	http.SetCookie(w, NewActiveSessionCookie(sessionToken))

	common.WriteJSONResponse(w, http.StatusOK, signInPreSessionCSRFTokenResponse{
		CSRFToken: CSRFToken,
	})
}

func (h *EndpointHandler) signOut(w http.ResponseWriter, r *http.Request) {
	// Input validation
	sessionToken, err := r.Cookie(env.SessionCookieName)
	if err != nil {
		common.WriteMessageResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Process the request
	if err := h.service.SignOut(r.Context(), sessionToken.Value); err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	http.SetCookie(w, NewExpiredSessionCookie())

	common.WriteMessageResponse(w, "User logged out successfully", http.StatusOK)
}

func (h *EndpointHandler) signOutAll(w http.ResponseWriter, r *http.Request) {
	// Process the request
	ctx := r.Context()
	user := middleware.GetUserFromContext(ctx)
	if user == nil {
		slog.Error("Error getting user from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err := h.service.SignOutAllSession(r.Context(), *user); err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	http.SetCookie(w, NewExpiredSessionCookie())

	common.WriteMessageResponse(w, "User logged out from all sessions successfully", http.StatusOK)
}

func (h *EndpointHandler) csrfToken(w http.ResponseWriter, r *http.Request) {
	// Input validation
	sessionToken, err := r.Cookie(env.SessionCookieName)
	if err != nil {
		common.WriteMessageResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Process the request
	CSRFToken, err := h.service.CSRFToken(r.Context(), sessionToken.Value)
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	// Respond to the client
	common.WriteJSONResponse(w, http.StatusOK, signInPreSessionCSRFTokenResponse{
		CSRFToken: CSRFToken,
	})
}
