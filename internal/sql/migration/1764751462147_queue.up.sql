CREATE TABLE queue (
    id TEXT NOT NULL,
    lane TEXT NOT NULL,
    type TEXT NOT NULL,
    payload TEXT NOT NULL,
    result TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    PRIMARY KEY (id)
);