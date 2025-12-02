package repository

import (
	"context"
	"fmt"

	"github.com/jljl1337/issho/internal/template"
)

const createPost = `
	INSERT INTO post (
		id,
		user_id,
		title,
		description,
		content,
		published_at,
		created_at,
		updated_at
	) VALUES (
		:id,
		:user_id,
		:title,
		:description,
		:content,
		:published_at,
		:created_at,
		:updated_at
	)
`

func (q *Queries) CreatePost(ctx context.Context, arg Post) error {
	return NamedExecOneRowContext(ctx, q.db, createPost, arg)
}

const getPostList = `
	SELECT
		*
	FROM
		post
	WHERE
		(:user_id IS NULL OR user_id = :user_id) AND
		(:search_query IS NULL OR (
			title LIKE '%%' || :search_query || '%%' OR
			description LIKE '%%' || :search_query || '%%' OR
			content LIKE '%%' || :search_query || '%%'
		)) AND
		(:include_drafts = TRUE OR published_at IS NOT NULL) AND (
			:cursor IS NULL OR :cursor_id IS NULL OR 
			{{.OrderBy}} {{if .Ascending}}>{{else}}<{{end}} :cursor OR (
				{{.OrderBy}} = :cursor AND id {{if .Ascending}}>{{else}}<{{end}} :cursor_id
			)
		)
	ORDER BY
		{{.OrderBy}} {{if .Ascending}}ASC{{else}}DESC{{end}},
		id {{if .Ascending}}ASC{{else}}DESC{{end}}
	LIMIT
		:page_size
`

type GetPostListParams struct {
	UserID        *string `db:"user_id"`
	SearchQuery   *string `db:"search_query"`
	OrderBy       string  // not a db tag, used for formatting
	Ascending     bool    // not a db tag, used for formatting
	IncludeDrafts bool    `db:"include_drafts"`
	PageSize      int     `db:"page_size"`
	Cursor        *string `db:"cursor"`
	CursorID      *string `db:"cursor_id"`
}

func (q *Queries) GetPostList(ctx context.Context, arg GetPostListParams) ([]Post, error) {
	if arg.OrderBy != "updated_at" && arg.OrderBy != "published_at" {
		return nil, fmt.Errorf("invalid OrderBy value")
	}

	query, err := template.RenderTemplate(getPostList, arg)
	if err != nil {
		return nil, fmt.Errorf("failed to render query template: %w", err)
	}

	items := []Post{}
	err = NamedSelectContext(ctx, q.db, &items, query, arg)
	return items, err
}

const getPostByID = `
	SELECT
		*
	FROM
		post
	WHERE
		id = :id
`

type GetPostByIDParams struct {
	ID string `db:"id"`
}

func (q *Queries) GetPostByID(ctx context.Context, id string) ([]Post, error) {
	items := []Post{}
	err := NamedSelectContext(ctx, q.db, &items, getPostByID, GetPostByIDParams{ID: id})
	return items, err
}

const updatePostByID = `
	UPDATE
		post
	SET
		title = :title,
		description = :description,
		content = :content,
		published_at = :published_at,
		updated_at = :updated_at
	WHERE
		id = :id
`

type UpdatePostByIDParams struct {
	Title       string  `db:"title"`
	Description string  `db:"description"`
	Content     string  `db:"content"`
	PublishedAt *string `db:"published_at"`
	UpdatedAt   string  `db:"updated_at"`
	ID          string  `db:"id"`
}

func (q *Queries) UpdatePostByID(ctx context.Context, arg UpdatePostByIDParams) error {
	return NamedExecOneRowContext(ctx, q.db, updatePostByID, arg)
}

const deletePostByID = `
	DELETE FROM
		post
	WHERE
		id = :id
`

type DeletePostByIDParams struct {
	ID string `db:"id"`
}

func (q *Queries) DeletePostByID(ctx context.Context, id string) error {
	return NamedExecOneRowContext(ctx, q.db, deletePostByID, DeletePostByIDParams{ID: id})
}
