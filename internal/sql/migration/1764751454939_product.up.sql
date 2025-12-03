CREATE TABLE product (
    id TEXT NOT NULL,
    external_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    PRIMARY KEY (id),
    UNIQUE (external_id)
);