package repository

import "context"

const createQueueTask = `
	INSERT INTO queue_task (
		id,
		lane,
		payload,
		status,
		created_at,
		updated_at
	) VALUES (
		:id,
		:lane,
		:payload,
		:status,
		:created_at,
		:updated_at
	)
`

func (q *Queries) CreateQueueTask(ctx context.Context, arg QueueTask) error {
	return NamedExecOneRowContext(ctx, q.db, createQueueTask, arg)
}

const getQueueTask = `
	SELECT
		*
	FROM
		queue_task
	WHERE
		lane = :lane AND
		status = :status
	ORDER BY
		created_at ASC,
		id ASC
	LIMIT 1
`

type GetQueueTaskParams struct {
	Lane   string `db:"lane"`
	Status string `db:"status"`
}

func (q *Queries) GetQueueTask(ctx context.Context, arg GetQueueTaskParams) ([]QueueTask, error) {
	items := []QueueTask{}

	err := NamedSelectContext(ctx, q.db, &items, getQueueTask, arg)

	return items, err
}

const updateQueueTaskStatusByID = `
	UPDATE
		queue_task
	SET
		status = :status,
		updated_at = :updated_at
	WHERE
		id = :id
`

type UpdateQueueTaskStatusByIDParams struct {
	ID        string `db:"id"`
	Status    string `db:"status"`
	UpdatedAt string `db:"updated_at"`
}

func (q *Queries) UpdateQueueTaskStatusByID(ctx context.Context, arg UpdateQueueTaskStatusByIDParams) error {
	return NamedExecOneRowContext(ctx, q.db, updateQueueTaskStatusByID, arg)
}
