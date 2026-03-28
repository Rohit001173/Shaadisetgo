-- ============================================
-- ShaadiSetGo - Complete Database Tables for Supabase
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. VENDOR USERS TABLE (for authentication)
-- ============================================
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

-- Indexes for vendor_users
CREATE INDEX IF NOT EXISTS idx_vendor_users_email ON vendor_users(email);
CREATE INDEX IF NOT EXISTS idx_vendor_users_phone ON vendor_users(phone);
CREATE INDEX IF NOT EXISTS idx_vendor_users_status ON vendor_users(vendor_status);

-- ============================================
-- 2. VENDOR SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_services (
    id VARCHAR(255) PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendor_users(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vendor_services
CREATE INDEX IF NOT EXISTS idx_vendor_services_vendor_id ON vendor_services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_services_category ON vendor_services(category);
CREATE INDEX IF NOT EXISTS idx_vendor_services_active ON vendor_services(is_active);

-- ============================================
-- 3. VENDOR BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_bookings (
    id VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(100) UNIQUE NOT NULL,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendor_users(id) ON DELETE CASCADE,
    service_id VARCHAR(255) REFERENCES vendor_services(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    event_date DATE NOT NULL,
    event_time VARCHAR(50),
    venue TEXT,
    guest_count INTEGER,
    special_request TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vendor_bookings
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_vendor_id ON vendor_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_status ON vendor_bookings(status);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_phone ON vendor_bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_date ON vendor_bookings(event_date);

-- ============================================
-- 4. SERVICES TABLE (for public display)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    vendor_id VARCHAR(255) REFERENCES vendor_users(id) ON DELETE SET NULL,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    price INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- ============================================
-- 5. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Index for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================
-- 6. VENDORS TABLE (for public display)
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    pincode VARCHAR(20),
    price_start INTEGER DEFAULT 0,
    price_label VARCHAR(100),
    price_model VARCHAR(100),
    advance_percentage INTEGER,
    max_guests VARCHAR(50),
    extra_hour_charge VARCHAR(100),
    distance_policy TEXT,
    rating FLOAT DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    phone_number VARCHAR(20),
    description TEXT,
    services TEXT[],
    view_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vendors
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON vendors(is_featured);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);

-- ============================================
-- 7. BOOKINGS TABLE (for public bookings)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(100) UNIQUE NOT NULL,
    vendor_id VARCHAR(255) REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    event_date DATE NOT NULL,
    city VARCHAR(100),
    function_type VARCHAR(100),
    guests VARCHAR(50),
    timing VARCHAR(100),
    special_request TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE vendor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR SERVICE ROLE (Full Access)
-- ============================================

-- Vendor Users
CREATE POLICY "Service role full access on vendor_users"
ON vendor_users FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Vendor Services
CREATE POLICY "Service role full access on vendor_services"
ON vendor_services FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Vendor Bookings
CREATE POLICY "Service role full access on vendor_bookings"
ON vendor_bookings FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Services
CREATE POLICY "Service role full access on services"
ON services FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Categories
CREATE POLICY "Service role full access on categories"
ON categories FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Vendors
CREATE POLICY "Service role full access on vendors"
ON vendors FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Bookings
CREATE POLICY "Service role full access on bookings"
ON bookings FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- ============================================
-- POLICIES FOR ANON KEY (Public Access)
-- ============================================

-- Allow public read access to active services, vendors, categories
CREATE POLICY "Public read active services"
ON services FOR SELECT TO anon
USING (is_active = true);

CREATE POLICY "Public read active vendors"
ON vendors FOR SELECT TO anon
USING (is_active = true);

CREATE POLICY "Public read active categories"
ON categories FOR SELECT TO anon
USING (is_active = true);

-- Allow public to create bookings
CREATE POLICY "Public can create bookings"
ON bookings FOR INSERT TO anon
WITH CHECK (true);

-- Allow public to create vendor accounts
CREATE POLICY "Public can register as vendor"
ON vendor_users FOR INSERT TO anon
WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================
INSERT INTO categories (id, name, slug, icon, display_order, is_active) VALUES
('cat_dj', 'DJ & Music', 'dj', 'Music', 1, true),
('cat_catering', 'Catering', 'catering', 'UtensilsCrossed', 2, true),
('cat_photography', 'Photography', 'photography', 'Camera', 3, true),
('cat_makeup', 'Makeup Artist', 'makeup', 'Sparkles', 4, true),
('cat_tent', 'Tent & Decor', 'tent', 'Tent', 5, true),
('cat_florist', 'Florist', 'florist', 'Flower2', 6, true),
('cat_transport', 'Transport', 'transport', 'Car', 7, true),
('cat_gifts', 'Gifts & Invites', 'gifts', 'Gift', 8, true),
('cat_anchor', 'Anchor/Host', 'anchor', 'Mic2', 9, true),
('cat_mehndi', 'Mehndi Artist', 'mehndi', 'Palette', 10, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- INSERT A TEST VENDOR (Optional)
-- Password: test123
-- ============================================
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
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to update updated_at
DROP TRIGGER IF EXISTS update_vendor_users_updated_at ON vendor_users;
CREATE TRIGGER update_vendor_users_updated_at
    BEFORE UPDATE ON vendor_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_services_updated_at ON vendor_services;
CREATE TRIGGER update_vendor_services_updated_at
    BEFORE UPDATE ON vendor_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_bookings_updated_at ON vendor_bookings;
CREATE TRIGGER update_vendor_bookings_updated_at
    BEFORE UPDATE ON vendor_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
