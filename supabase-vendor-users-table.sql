-- ============================================
-- ShaadiSetGo - Vendor Users Table for Supabase
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Create vendor_users table
CREATE TABLE IF NOT EXISTS vendor_users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    vendor_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_vendor_users_email ON vendor_users(email);
CREATE INDEX IF NOT EXISTS idx_vendor_users_phone ON vendor_users(phone);
CREATE INDEX IF NOT EXISTS idx_vendor_users_status ON vendor_users(vendor_status);

-- Enable Row Level Security (RLS)
ALTER TABLE vendor_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can do everything on vendor_users"
ON vendor_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow anon key to insert (for registration)
CREATE POLICY "Anyone can register as vendor"
ON vendor_users
FOR INSERT
TO anon
WITH CHECK (true);

-- Optional: Insert a test vendor with password "test123"
-- Password hash is: Base64(test123 + shaadisetgo_salt_2024)
-- INSERT INTO vendor_users (id, email, phone, password, owner_name, business_name, city, category, vendor_status)
-- VALUES (
--   'vendor_test_001',
--   'test@example.com',
--   '9876543210',
--   'dGVzdDEyM3NoYWFkaXNldGdvX3NhbHRfMjAyNA==',
--   'Test Owner',
--   'Test Business',
--   'Patna',
--   'DJ',
--   'approved'
-- );

-- ============================================
-- For Admin to manage vendors, also create this function
-- ============================================
CREATE OR REPLACE FUNCTION get_pending_vendors()
RETURNS TABLE (
    id VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    owner_name VARCHAR(255),
    business_name VARCHAR(255),
    city VARCHAR(100),
    category VARCHAR(100),
    description TEXT,
    vendor_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, email, phone, owner_name, business_name, city, category, description, vendor_status, created_at
    FROM vendor_users
    WHERE vendor_status = 'pending'
    ORDER BY created_at DESC;
$$;

-- Function to update vendor status
CREATE OR REPLACE FUNCTION update_vendor_status(vendor_id VARCHAR, new_status VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE vendor_users
    SET vendor_status = new_status, updated_at = NOW()
    WHERE id = vendor_id;
    SELECT true;
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON vendor_users TO service_role;
GRANT SELECT, INSERT ON vendor_users TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
