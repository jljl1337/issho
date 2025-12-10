CREATE TABLE email_verification (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);