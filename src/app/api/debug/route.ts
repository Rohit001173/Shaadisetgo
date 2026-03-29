import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check Supabase configuration
 * GET /api/debug
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if all required environment variables are set
  const config = {
    supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
    supabaseAnonKey: supabaseAnonKey ? '✅ Set' : '❌ Missing',
    supabaseServiceKey: supabaseServiceKey ? '✅ Set' : '❌ Missing',
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'N/A',
  };

  // Test Supabase connection
  let connectionTest = 'Not tested';
  
  if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      // Try a simple query
      const { error } = await client.from('vendors').select('id').limit(1);
      
      if (error) {
        connectionTest = `❌ Error: ${error.message}`;
      } else {
        connectionTest = '✅ Connected successfully';
      }
    } catch (err) {
      connectionTest = `❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  } else {
    connectionTest = '❌ Missing credentials';
  }

  // Test storage bucket
  let storageTest = 'Not tested';
  
  if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      // Try to list buckets
      const { data, error } = await client.storage.listBuckets();
      
      if (error) {
        storageTest = `❌ Error: ${error.message}`;
      } else {
        const bucketNames = data?.map(b => b.name) || [];
        const hasVendorBucket = bucketNames.includes('Vendor_image');
        storageTest = hasVendorBucket 
          ? `✅ Bucket 'Vendor_image' exists` 
          : `⚠️ Buckets: ${bucketNames.join(', ') || 'none'} - need to create 'Vendor_image'`;
      }
    } catch (err) {
      storageTest = `❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    config,
    connectionTest,
    storageTest,
  });
}
