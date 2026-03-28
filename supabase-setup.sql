-- ShaadiSetGo - Supabase Database Setup
-- Run this SQL in Supabase SQL Editor to create required tables

-- ============================================================
-- 1. VENDORS TABLE (already exists - skip if exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  pincode TEXT,
  price_start INTEGER DEFAULT 0,
  price_label TEXT,
  price_model TEXT,
  advance_percentage INTEGER,
  max_guests TEXT,
  extra_hour_charge TEXT,
  distance_policy TEXT,
  phone_number TEXT,
  description TEXT,
  services TEXT[],
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON vendors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow service role full access" ON vendors
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 2. SERVICES TABLE (CREATE THIS!)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(id),
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT,
  price INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow service role full access" ON services
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 3. CATEGORIES TABLE (CREATE THIS!)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow service role full access" ON categories
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 4. BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  event_date TEXT NOT NULL,
  city TEXT NOT NULL,
  function_type TEXT NOT NULL,
  guests TEXT,
  timing TEXT,
  special_request TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role full access" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 5. VENDOR_USERS TABLE (for vendor login/signup)
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  vendor_status TEXT DEFAULT 'pending' CHECK (vendor_status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vendor_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role full access" ON vendor_users
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 6. VENDOR_IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_images (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(id),
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vendor_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON vendor_images
  FOR SELECT USING (true);

CREATE POLICY "Allow service role full access" ON vendor_images
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 7. INSERT DEFAULT CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, slug, icon, "order", is_active) VALUES
  ('cat_001', 'DJ & Music', 'dj', '🎧', 1, true),
  ('cat_002', 'Photography & Videography', 'photography', '📸', 2, true),
  ('cat_003', 'Catering', 'catering', '🍽️', 3, true),
  ('cat_004', 'Pandit Ji', 'pandit-ji', '🙏', 4, true),
  ('cat_005', 'Makeup & Beauty', 'makeup', '💄', 5, true),
  ('cat_006', 'Mehndi', 'mehndi', '🌿', 6, true),
  ('cat_007', 'Tent & Decoration', 'tent-decoration', '🎪', 7, true),
  ('cat_008', 'Band Baja', 'band-baja', '🎺', 8, true),
  ('cat_009', 'Hotel & Banquet', 'hotel-banquet', '🏨', 9, true),
  ('cat_010', 'Honeymoon Package', 'honeymoon', '✈️', 10, true),
  ('cat_011', 'Beauty Parlour', 'beauty-parlour', '💇', 11, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT 'Tables created successfully! ShaadiSetGo is ready to use.' AS message;
