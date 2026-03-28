-- =====================================================
-- ShaadiSetGo - Supabase Database Setup
-- =====================================================
-- Run this SQL in Supabase SQL Editor to set up the database
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'customer',
  password VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  area VARCHAR(255),
  pincode VARCHAR(20),
  price_start INTEGER NOT NULL,
  price_label VARCHAR(255),
  price_model VARCHAR(50),
  advance_percentage INTEGER,
  max_guests VARCHAR(50),
  extra_hour_charge VARCHAR(100),
  distance_policy VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  phone_number VARCHAR(20),
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id)
);

-- Vendor Images Table
CREATE TABLE IF NOT EXISTS vendor_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  vendor_name VARCHAR(255) NOT NULL,
  customer_id UUID REFERENCES users(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  event_date VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  function_type VARCHAR(100) NOT NULL,
  guests VARCHAR(50),
  timing VARCHAR(100),
  special_request TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(255) NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON vendors(is_featured);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);

CREATE INDEX IF NOT EXISTS idx_vendor_images_vendor_id ON vendor_images(vendor_id);

CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read access for vendors (active only)
CREATE POLICY "Public can view active vendors" ON vendors
  FOR SELECT USING (is_active = TRUE);

-- Public read access for vendor images
CREATE POLICY "Public can view vendor images" ON vendor_images
  FOR SELECT USING (TRUE);

-- Public read access for categories
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (is_active = TRUE);

-- Public can create bookings
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (TRUE);

-- Public can view their own bookings (by phone)
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (TRUE);

-- Public can create reviews
CREATE POLICY "Public can create reviews" ON reviews
  FOR INSERT WITH CHECK (TRUE);

-- Public can view reviews
CREATE POLICY "Public can view reviews" ON reviews
  FOR SELECT USING (TRUE);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, slug, "order", is_active) VALUES
('DJ & Music', 'dj', 1, TRUE),
('Catering', 'catering', 2, TRUE),
('Photography', 'photography', 3, TRUE),
('Makeup', 'makeup', 4, TRUE),
('Tent & Decor', 'tent', 5, TRUE),
('Florist', 'florist', 6, TRUE),
('Transport', 'transport', 7, TRUE),
('Gifts & Invites', 'gifts', 8, TRUE),
('Anchor/Host', 'anchor', 9, TRUE),
('Mehndi Artist', 'mehndi', 10, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
