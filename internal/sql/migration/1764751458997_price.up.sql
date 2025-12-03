CREATE TABLE price (
    id TEXT NOT NULL,
    external_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_amount INTEGER NOT NULL,
    price_currency TEXT NOT NULL,
    is_recurring INTEGER NOT NULL,
    recurring_interval TEXT,
    recurring_interval_count INTEGER,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    PRIMARY KEY (id),
    UNIQUE (external_id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);