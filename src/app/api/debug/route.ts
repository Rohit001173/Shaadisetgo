import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/debug
 * Debug endpoint to check Supabase configuration and data
 * This helps diagnose issues with the deployed application
 */
export async function GET() {
  console.log('[DEBUG] Checking Supabase configuration...');

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    },
    connection: {
      status: '❓ Unknown' as string,
      error: null as string | null,
    },
    tables: {
      vendors: { status: '❓ Unknown' as string, count: 0, error: null as string | null },
      services: { status: '❓ Unknown' as string, count: 0, error: null as string | null },
      categories: { status: '❓ Unknown' as string, count: 0, error: null as string | null },
    },
    storage: {
      status: '❓ Unknown' as string,
      buckets: [] as string[],
      error: null as string | null,
    },
    sampleData: {
      vendors: [] as unknown[],
    },
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if we have all required environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    debugInfo.connection.status = '❌ Not Configured';
    debugInfo.connection.error = 'Missing required environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.';
    return NextResponse.json(debugInfo, { status: 200 });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    debugInfo.connection.status = '✅ Client Created';

    // Test vendors table
    try {
      const { data: vendors, error: vendorsError, count } = await supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .limit(5);

      if (vendorsError) {
        debugInfo.tables.vendors.status = `❌ Error: ${vendorsError.message}`;
        debugInfo.tables.vendors.error = vendorsError.message;
      } else {
        debugInfo.tables.vendors.status = '✅ Accessible';
        debugInfo.tables.vendors.count = count || 0;
        debugInfo.sampleData.vendors = vendors?.map((v: { id: string; name: string; category: string; city: string; is_active: boolean }) => ({
          id: v.id,
          name: v.name,
          category: v.category,
          city: v.city,
          is_active: v.is_active,
        })) || [];
      }
    } catch (e) {
      debugInfo.tables.vendors.status = `❌ Exception: ${e instanceof Error ? e.message : 'Unknown'}`;
      debugInfo.tables.vendors.error = e instanceof Error ? e.message : 'Unknown error';
    }

    // Test services table
    try {
      const { count, error } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      if (error) {
        debugInfo.tables.services.status = `❌ Error: ${error.message}`;
        debugInfo.tables.services.error = error.message;
      } else {
        debugInfo.tables.services.status = '✅ Accessible';
        debugInfo.tables.services.count = count || 0;
      }
    } catch (e) {
      debugInfo.tables.services.status = `❌ Exception: ${e instanceof Error ? e.message : 'Unknown'}`;
      debugInfo.tables.services.error = e instanceof Error ? e.message : 'Unknown error';
    }

    // Test categories table
    try {
      const { count, error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (error) {
        debugInfo.tables.categories.status = `❌ Error: ${error.message}`;
        debugInfo.tables.categories.error = error.message;
      } else {
        debugInfo.tables.categories.status = '✅ Accessible';
        debugInfo.tables.categories.count = count || 0;
      }
    } catch (e) {
      debugInfo.tables.categories.status = `❌ Exception: ${e instanceof Error ? e.message : 'Unknown'}`;
      debugInfo.tables.categories.error = e instanceof Error ? e.message : 'Unknown error';
    }

    // Test storage buckets
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        debugInfo.storage.status = `❌ Error: ${bucketsError.message}`;
        debugInfo.storage.error = bucketsError.message;
      } else {
        debugInfo.storage.status = '✅ Connected';
        debugInfo.storage.buckets = buckets?.map((b: { name: string }) => b.name) || [];
      }
    } catch (e) {
      debugInfo.storage.status = `❌ Exception: ${e instanceof Error ? e.message : 'Unknown'}`;
      debugInfo.storage.error = e instanceof Error ? e.message : 'Unknown error';
    }

  } catch (error) {
    debugInfo.connection.status = '❌ Connection Failed';
    debugInfo.connection.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return NextResponse.json(debugInfo, { status: 200 });
}
