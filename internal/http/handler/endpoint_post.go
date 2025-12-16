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

type CreatePostParams struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Content     string  `json:"content"`
	PublishedAt *string `json:"publishedAt"`
}

func (h *EndpointHandler) registerPostRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /posts", h.CreatePost)
	mux.HandleFunc("GET /posts", h.GetPostList)
	mux.HandleFunc("GET /posts/{id}", h.GetPostByID)
	mux.HandleFunc("PUT /posts/{id}", h.UpdatePostByID)
	mux.HandleFunc("DELETE /posts/{id}", h.DeletePostByID)
}

func (h *EndpointHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	var req CreatePostParams
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

	err := h.service.CreatePost(r.Context(), service.CreatePostParams{
		User:        *user,
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		PublishedAt: req.PublishedAt,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteMessageResponse(w, "Post created successfully", http.StatusCreated)
}

func (h *EndpointHandler) GetPostList(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	arg := service.GetPostListParams{}

	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		slog.Error("Error getting user from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	arg.User = *user

	userID := r.URL.Query().Get("user-id")
	if userID != "" {
		arg.UserID = &userID
	}

	searchQuery := r.URL.Query().Get("search-query")
	if searchQuery != "" {
		arg.SearchQuery = &searchQuery
	}

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

	orderBy := r.URL.Query().Get("order-by")
	if orderBy != "" {
		arg.OrderBy = orderBy
	} else {
		arg.OrderBy = "published_at"
	}

	ascending := r.URL.Query().Get("ascending")
	if ascending == "true" {
		arg.Ascending = true
	} else {
		arg.Ascending = false
	}

	includeDrafts := r.URL.Query().Get("include-all")
	if includeDrafts == "true" {
		arg.IncludeAll = true
	} else {
		arg.IncludeAll = false
	}

	pageSize := r.URL.Query().Get("page-size")
	if pageSize != "" {
		var err error
		arg.PageSize, err = strconv.Atoi(pageSize)
		if err != nil {
			common.WriteMessageResponse(w, "Invalid page-size parameter", http.StatusBadRequest)
			return
		}
	} else {
		arg.PageSize = env.PageSizeDefault
	}

	// Call service to get post list
	postList, err := h.service.GetPostList(r.Context(), arg)
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteJSONResponse(w, http.StatusOK, postList)
}

func (h *EndpointHandler) GetPostByID(w http.ResponseWriter, r *http.Request) {
	// Parse post ID from URL path
	postID := r.PathValue("id")
	if postID == "" {
		common.WriteMessageResponse(w, "Post ID is required", http.StatusBadRequest)
		return
	}

	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		slog.Error("Error getting user from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Call service to get post by ID
	post, err := h.service.GetPostByID(r.Context(), service.GetPostByIDParams{
		User:   *user,
		PostID: postID,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteJSONResponse(w, http.StatusOK, post)
}

func (h *EndpointHandler) UpdatePostByID(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters and request body
	postID := r.PathValue("id")
	if postID == "" {
		common.WriteMessageResponse(w, "Post ID is required", http.StatusBadRequest)
		return
	}

	var req struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Content     string  `json:"content"`
		PublishedAt *string `json:"publishedAt"`
	}
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

	// Call service to update post by ID
	err := h.service.UpdatePostByID(r.Context(), service.UpdatePostByIDParams{
		User:        *user,
		PostID:      postID,
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		PublishedAt: req.PublishedAt,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteMessageResponse(w, "Post updated successfully", http.StatusOK)
}

func (h *EndpointHandler) DeletePostByID(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	postID := r.PathValue("id")
	if postID == "" {
		common.WriteMessageResponse(w, "Post ID is required", http.StatusBadRequest)
		return
	}

	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		slog.Error("Error getting user from context")
		common.WriteMessageResponse(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Call service to delete post by ID
	err := h.service.DeletePostByID(r.Context(), service.DeletePostByIDParams{
		User:   *user,
		PostID: postID,
	})
	if err != nil {
		common.WriteErrorResponse(w, err)
		return
	}

	common.WriteMessageResponse(w, "Post deleted successfully", http.StatusOK)
}
