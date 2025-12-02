CREATE TABLE post (
    id TEXT NOT NULL,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL
);

CREATE INDEX idx_post_user_id ON post(user_id);
CREATE INDEX idx_post_published_at ON post(published_at);