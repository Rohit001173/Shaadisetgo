# ShaadiSetGo - Supabase Backend Setup Guide

## 🚀 Supabase Setup Steps

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name: `shaadisetgo`
4. Set a strong database password (save this!)
5. Choose a region close to your users (Mumbai for India)
6. Click "Create new project"

### Step 2: Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

### Step 3: Get Database Connection String

1. Go to **Project Settings** → **Database**
2. Under "Connection string", select **URI** format
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password
5. Add `?pgbouncer=true&connection_limit=1` at the end for connection pooling

### Step 4: Update .env File

Replace the placeholder values in `.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URLs
DATABASE_URL="postgresql://postgres:your-password@db.xyzabc.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:your-password@db.xyzabc.supabase.co:5432/postgres"
```

### Step 5: Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click "Create a new bucket"
3. Create bucket named: `vendor-images`
   - Enable "Public bucket"
4. Create bucket named: `user-avatars`
   - Enable "Public bucket"

### Step 6: Set Up Database Schema

**Option A: Using Prisma (Recommended)**

```bash
bun run db:push
```

**Option B: Using SQL Editor**

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste and click "Run"

### Step 7: Configure Storage Policies (Optional)

Run these in SQL Editor for image uploads:

```sql
-- Allow public read access to vendor images
CREATE POLICY "Public can view vendor images" ON storage.objects
  FOR SELECT USING (bucket_id = 'vendor-images');

-- Allow authenticated uploads
CREATE POLICY "Anyone can upload vendor images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vendor-images');
```

## 📋 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)
- [ ] `DATABASE_URL` - PostgreSQL connection string with pgbouncer
- [ ] `DIRECT_URL` - Direct PostgreSQL connection for migrations

## 🧪 Testing the Connection

1. Run the app: `bun run dev`
2. Check console: Should show `📦 Database: Supabase PostgreSQL`
3. Visit `/api/config` to see database status
4. Visit `/api/seed` to check if database is populated

## ⚠️ Important Notes

1. **Never commit** the `.env` file with real credentials
2. **Row Level Security (RLS)** is enabled on all tables
3. The service role key bypasses RLS - keep it secret!
4. Use connection pooling (`pgbouncer=true`) for serverless

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- Check if your IP is whitelisted (Supabase allows all by default)
- Verify the connection string format
- Check if database password is correct

### Error: "relation does not exist"
- Run `bun run db:push` to create tables
- Or run the SQL schema in Supabase SQL Editor

### Images not uploading
- Check if storage buckets exist
- Verify bucket names match: `vendor-images`, `user-avatars`
- Check storage policies are set

## 📱 Current Status

The app currently uses **local SQLite** by default. Once you configure Supabase credentials in `.env`, it will automatically switch to **Supabase PostgreSQL**.

Check current database status at: `GET /api/config`
