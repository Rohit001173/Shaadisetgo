import { NextResponse } from 'next/server';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase-client';

export async function GET() {
  const results: {
    environment: Record<string, string>;
    database: { status: string; error?: string; count?: number };
    storage: { status: string; error?: string; buckets?: string[] };
  } = {
    environment: {},
    database: { status: 'not_tested' },
    storage: { status: 'not_tested' },
  };

  // Check environment variables
  results.environment = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  };

  // Test database connection
  try {
    if (!supabaseAdmin) {
      results.database = { status: 'failed', error: 'supabaseAdmin is null' };
    } else {
      const { data, error, count } = await supabaseAdmin
        .from('services')
        .select('id', { count: 'exact', head: true });

      if (error) {
        results.database = { status: 'failed', error: error.message };
      } else {
        results.database = { status: 'connected', count: count || 0 };
      }
    }
  } catch (err) {
    results.database = { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' };
  }

  // Test storage connection
  try {
    if (!supabaseAdmin) {
      results.storage = { status: 'failed', error: 'supabaseAdmin is null' };
    } else {
      // List all buckets
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

      if (listError) {
        results.storage = { status: 'failed', error: listError.message };
      } else {
        const bucketNames = buckets?.map(b => b.name) || [];
        results.storage = {
          status: 'connected',
          buckets: bucketNames,
        };

        // Check if our bucket exists
        const targetBucket = bucketNames.find(b => b === STORAGE_BUCKET);
        if (!targetBucket) {
          results.storage.error = `Bucket '${STORAGE_BUCKET}' not found. Available: ${bucketNames.join(', ')}`;
        }
      }
    }
  } catch (err) {
    results.storage = { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' };
  }

  return NextResponse.json({
    success: true,
    results,
    bucket_name: STORAGE_BUCKET,
  });
}
