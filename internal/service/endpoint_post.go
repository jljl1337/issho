package service

import (
	"context"
	"log/slog"

	"github.com/jljl1337/issho/internal/env"
	"github.com/jljl1337/issho/internal/generator"
	"github.com/jljl1337/issho/internal/repository"
)

type CreatePostParams struct {
	UserID      string
	UserRole    string
	Title       string
	Description string
	Content     string
	PublishedAt *string
}

func (s *EndpointService) CreatePost(ctx context.Context, arg CreatePostParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to create post")
	}

	now := generator.NowISO8601()

	// Ensure publishedAt is not set to a past time
	if arg.PublishedAt != nil && *arg.PublishedAt < now {
		arg.PublishedAt = &now
	}

	queries := repository.New(s.db)

	post := repository.Post{
		ID:          generator.NewULID(),
		UserID:      &arg.UserID,
		Title:       arg.Title,
		Description: arg.Description,
		Content:     arg.Content,
		PublishedAt: arg.PublishedAt,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	err := queries.CreatePost(ctx, post)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to create post: %v", err)
	}

	return nil
}

type GetPostListParams struct {
	UserRole    string
	UserID      *string
	SearchQuery *string
	Cursor      *string
	CursorID    *string
	OrderBy     string
	Ascending   bool
	IncludeAll  bool
	PageSize    int
}

func (s *EndpointService) GetPostList(ctx context.Context, arg GetPostListParams) ([]repository.Post, error) {
	// Input validation and adjustments
	if arg.UserRole == env.UserRole {
		arg.IncludeAll = false

		now := generator.NowISO8601()
		if arg.OrderBy == "published_at" && arg.Cursor != nil && *arg.Cursor > now {
			slog.Warn("Adjusting cursor for non-privileged user")
			arg.Cursor = &now
		}
	}

	if arg.PageSize <= 0 || arg.PageSize > env.PageSizeMax {
		arg.PageSize = env.PageSizeDefault
	}

	// Query execution
	queries := repository.New(s.db)

	params := repository.GetPostListParams{
		UserID:      arg.UserID,
		SearchQuery: arg.SearchQuery,
		OrderBy:     arg.OrderBy,
		Ascending:   arg.Ascending,
		IncludeAll:  arg.IncludeAll,
		Now:         generator.NowISO8601(),
		PageSize:    arg.PageSize,
		Cursor:      arg.Cursor,
		CursorID:    arg.CursorID,
	}

	posts, err := queries.GetPostList(ctx, params)
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get post list: %v", err)
	}

	return posts, nil
}

type GetPostByIDParams struct {
	PostID   string
	UserRole string
}

func (s *EndpointService) GetPostByID(ctx context.Context, arg GetPostByIDParams) (*repository.Post, error) {
	queries := repository.New(s.db)

	postList, err := queries.GetPostByID(ctx, arg.PostID)
	if err != nil {
		return nil, NewServiceErrorf(ErrCodeInternal, "failed to get post by ID: %v", err)
	}

	if len(postList) == 0 {
		return nil, NewServiceError(ErrCodeNotFound, "post not found")
	}

	post := postList[0]

	if arg.UserRole == env.UserRole {
		if post.PublishedAt == nil {
			return nil, NewServiceError(ErrCodeNotFound, "post not found")
		}

		now := generator.NowISO8601()
		if *post.PublishedAt > now {
			return nil, NewServiceError(ErrCodeNotFound, "post not found")
		}
	}

	return &post, nil
}

type UpdatePostByIDParams struct {
	UserID      string
	UserRole    string
	PostID      string
	Title       string
	Description string
	Content     string
	PublishedAt *string
}

func (s *EndpointService) UpdatePostByID(ctx context.Context, arg UpdatePostByIDParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to update post")
	}

	queries := repository.New(s.db)

	postList, err := queries.GetPostByID(ctx, arg.PostID)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get post by ID: %v", err)
	}

	if len(postList) == 0 {
		return NewServiceError(ErrCodeNotFound, "post not found")
	}

	post := postList[0]

	if post.UserID == nil || *post.UserID != arg.UserID {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to update post")
	}

	now := generator.NowISO8601()

	// If already published, do not allow updating publishedAt
	if post.PublishedAt != nil && *post.PublishedAt <= now {
		arg.PublishedAt = post.PublishedAt
	} else {
		// Ensure publishedAt is not set to a past time
		if arg.PublishedAt != nil && *arg.PublishedAt < now {
			arg.PublishedAt = &now
		}
	}

	updateParams := repository.UpdatePostByIDParams{
		Title:       arg.Title,
		Description: arg.Description,
		Content:     arg.Content,
		PublishedAt: arg.PublishedAt,
		UpdatedAt:   now,
		ID:          arg.PostID,
	}

	err = queries.UpdatePostByID(ctx, updateParams)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to update post by ID: %v", err)
	}

	return nil
}

type DeletePostByIDParams struct {
	UserID   string
	UserRole string
	PostID   string
}

func (s *EndpointService) DeletePostByID(ctx context.Context, arg DeletePostByIDParams) error {
	if arg.UserRole == env.UserRole {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to delete post")
	}

	queries := repository.New(s.db)

	postList, err := queries.GetPostByID(ctx, arg.PostID)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to get post by ID: %v", err)
	}

	if len(postList) == 0 {
		return NewServiceError(ErrCodeNotFound, "post not found")
	}

	post := postList[0]

	if post.UserID == nil || *post.UserID != arg.UserID {
		return NewServiceError(ErrCodeForbidden, "insufficient permissions to update post")
	}

	err = queries.DeletePostByID(ctx, arg.PostID)
	if err != nil {
		return NewServiceErrorf(ErrCodeInternal, "failed to delete post by ID: %v", err)
	}

	return nil
}
