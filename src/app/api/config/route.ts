import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-client';

/**
 * GET /api/config
 * Verify Supabase configuration and connection
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/config - Checking Supabase configuration...');

  const config = {
    supabase: {
      configured: isSupabaseConfigured(),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    },
    tables: {
      vendors: '❓ Unknown',
      services: '❓ Unknown',
      categories: '❓ Unknown',
    },
    storage: {
      bucket: '❓ Unknown',
    },
    connection: '❓ Unknown',
    errors: [] as string[],
  };

  if (!isSupabaseConfigured()) {
    config.errors.push('Supabase is not configured. Check environment variables.');
    return NextResponse.json(config);
  }

  try {
    // Test vendors table
    const { data: vendorsTest, error: vendorsError } = await supabaseAdmin!
      .from('vendors')
      .select('id')
      .limit(1);

    config.tables.vendors = vendorsError 
      ? `❌ ${vendorsError.message}` 
      : '✅ Accessible';

    // Test services table
    const { data: servicesTest, error: servicesError } = await supabaseAdmin!
      .from('services')
      .select('id')
      .limit(1);

    config.tables.services = servicesError 
      ? `❌ ${servicesError.message}` 
      : '✅ Accessible';

    // Test categories table
    const { data: categoriesTest, error: categoriesError } = await supabaseAdmin!
      .from('categories')
      .select('id')
      .limit(1);

    config.tables.categories = categoriesError 
      ? `❌ ${categoriesError.message}` 
      : '✅ Accessible';

    // Test storage bucket
    const { data: buckets, error: bucketError } = await supabaseAdmin!
      .storage
      .listBuckets();

    if (bucketError) {
      config.storage.bucket = `❌ ${bucketError.message}`;
    } else {
      const vendorImageBucket = buckets?.find(b => b.name === 'Vendor_image');
      config.storage.bucket = vendorImageBucket 
        ? '✅ Vendor_image bucket exists' 
        : '⚠️ Vendor_image bucket not found';
    }

    config.connection = '✅ Connected';
  } catch (error) {
    config.connection = `❌ ${error instanceof Error ? error.message : 'Unknown error'}`;
    config.errors.push(error instanceof Error ? error.message : 'Connection failed');
  }

  console.log('[API] Config check result:', config);

  return NextResponse.json(config);
}
