-- users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'driver'))
);

-- configuration/rates table
CREATE TABLE IF NOT EXISTS rates (
    id SERIAL PRIMARY KEY,
    harvester_id VARCHAR(50) NOT NULL UNIQUE,
    rate_2x2 DECIMAL(10, 2) NOT NULL,
    rate_4x4 DECIMAL(10, 2) NOT NULL,
    tractor_trip_rate DECIMAL(10, 2) NOT NULL
);

-- jobs/work entries table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    driver_id INT REFERENCES users(id),
    date DATE NOT NULL,
    farmer_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    crop_type VARCHAR(50) DEFAULT 'Paddy',
    harvester_id VARCHAR(50) NOT NULL,
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('2x2', '4x4')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours DECIMAL(5, 2) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    work_amount DECIMAL(12, 2) NOT NULL,
    tractor_trips INT DEFAULT 0,
    tractor_trip_rate DECIMAL(10, 2) DEFAULT 0,
    tractor_total DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    pending_amount DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
