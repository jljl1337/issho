CREATE TABLE email (
    id TEXT NOT NULL,
    type TEXT NOT NULL,
    to_address TEXT NOT NULL,
    cc_address TEXT NOT NULL,
    bcc_address TEXT NOT NULL,
    from_address TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    PRIMARY KEY (id)
);