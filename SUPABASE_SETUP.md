# 🔧 Supabase Setup Guide for ShaadiSetGo

## ✅ Changes Made

I've updated the following files to use Supabase PostgreSQL database:

### New Files Created:
1. **`/src/lib/supabase-client.ts`** - Centralized Supabase client with all API functions
2. **`/src/app/api/vendors/route.ts`** - Updated to use Supabase
3. **`/src/app/api/services/route.ts`** - New services API
4. **`/src/app/api/search/route.ts`** - Unified search across vendors, services, categories
5. **`/src/app/api/vendor/signup/route.ts`** - Vendor registration into vendors table
6. **`/src/app/api/config/route.ts`** - Configuration checker
7. **`/src/app/api/seed/route.ts`** - Database seeding with sample data

---

## 🗃️ Required Supabase Tables

Run these SQL commands in Supabase SQL Editor:

### 1. Vendors Table
```sql
CREATE TABLE vendors (
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
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  phone_number TEXT,
  email TEXT UNIQUE,
  password TEXT,
  description TEXT,
  services TEXT[],
  view_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  vendor_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_city ON vendors(city);
CREATE INDEX idx_vendors_active ON vendors(is_active);
CREATE INDEX idx_vendors_featured ON vendors(is_featured);
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_vendors_phone ON vendors(phone_number);
```

### 2. Services Table
```sql
CREATE TABLE services (
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

-- Indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_services_vendor ON services(vendor_id);
```

### 3. Categories Table
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_categories_order ON categories("order");
```

### 4. Bookings Table
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  booking_id TEXT UNIQUE NOT NULL,
  vendor_id TEXT REFERENCES vendors(id),
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### 5. Vendor Images Table (Optional)
```sql
CREATE TABLE vendor_images (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vendor_images_vendor ON vendor_images(vendor_id);
```

---

## 🗄️ Storage Bucket Setup

### Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `Vendor_image` (exact name required)
4. Enable "Public bucket"
5. Click "Create bucket"

### Set Bucket Policy
In Storage → Policies, add these policies:

**Policy 1: Allow public read**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'Vendor_image');
```

**Policy 2: Allow authenticated upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Vendor_image' AND auth.role() = 'authenticated');
```

**Policy 3: Allow service role full access**
```sql
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
USING (bucket_id = 'Vendor_image' AND auth.jwt() ->> 'role' = 'service_role');
```

---

## 🔐 Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_images ENABLE ROW LEVEL SECURITY;

-- Allow public read for active vendors
CREATE POLICY "Public can view active vendors"
ON vendors FOR SELECT
USING (is_active = true);

-- Allow service role full access
CREATE POLICY "Service role full access on vendors"
ON vendors FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on services"
ON services FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on categories"
ON categories FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on bookings"
ON bookings FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## ✅ Environment Variables (Already Set)

Your `.env` file already has:
```
NEXT_PUBLIC_SUPABASE_URL=https://glhysypcregiysrwxzak.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Testing the Setup

### 1. Check Configuration
Visit: `https://your-domain.vercel.app/api/config`

This will show:
- ✅ Supabase configuration status
- ✅ Table accessibility
- ✅ Storage bucket status

### 2. Seed Sample Data
POST to: `https://your-domain.vercel.app/api/seed`

This will add:
- 6 sample vendors
- 6 sample services
- 10 categories

### 3. Test Search
GET: `https://your-domain.vercel.app/api/search?q=DJ`

---

## 🚀 Deployment Checklist

1. ✅ Create tables in Supabase (run SQL above)
2. ✅ Create storage bucket `Vendor_image`
3. ✅ Set storage policies
4. ✅ Enable RLS
5. ✅ Deploy to Vercel
6. ✅ Add environment variables in Vercel
7. ✅ Run `/api/seed` to add sample data
8. ✅ Test `/api/config` to verify setup

---

## 📞 Quick Commands

```bash
# Check if Supabase is configured
curl https://your-app.vercel.app/api/config

# Seed sample data
curl -X POST https://your-app.vercel.app/api/seed

# Search for DJ services
curl https://your-app.vercel.app/api/search?q=DJ

# Get all vendors
curl https://your-app.vercel.app/api/vendors
```

---

## ⚠️ Important Notes

1. **Table Names**: Use lowercase with underscores (e.g., `vendor_images` not `VendorImages`)

2. **Column Names**: Use snake_case (e.g., `is_active` not `isActive`)

3. **Primary Keys**: Using TEXT IDs for flexibility

4. **Images**: Currently stored in Supabase Storage, URLs saved in database

5. **Password**: Simple hash for now - use bcrypt in production

---

Need help? Check the console logs in Vercel for detailed error messages!
