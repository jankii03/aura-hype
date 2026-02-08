-- Create Product table
CREATE TABLE IF NOT EXISTS Product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT,
    gender TEXT,
    description TEXT,
    tags TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create extraImages table
CREATE TABLE IF NOT EXISTS extraImages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image TEXT NOT NULL,
    productId INTEGER NOT NULL,
    FOREIGN KEY (productId) REFERENCES Product(id)
);

-- Create Todo table (if needed for demo)
CREATE TABLE IF NOT EXISTS Todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
