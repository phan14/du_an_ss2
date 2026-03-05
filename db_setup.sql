-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
