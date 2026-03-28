import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-client';

/**
 * GET /api/search
 * Unified search across vendors, services, categories
 * 
 * Query params:
 * - q: Search query (required)
 * - type: 'all' | 'vendors' | 'services' | 'categories' (default: 'all')
 * - limit: Number of results per type (default: 10)
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/search - Starting search...');

  if (!isSupabaseConfigured()) {
    console.error('[API] Supabase not configured!');
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
      results: [],
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        results: {
          vendors: [],
          services: [],
          categories: [],
        },
        meta: { query: '', total: 0 },
      });
    }

    const searchTerm = query.toLowerCase().trim();
    console.log(`[API] Searching for: "${searchTerm}" (type: ${type})`);

    const results = {
      vendors: [] as any[],
      services: [] as any[],
      categories: [] as any[],
    };

    // Search vendors
    if (type === 'all' || type === 'vendors') {
      const { data: vendors, error: vendorError } = await supabaseAdmin!
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,area.ilike.%${searchTerm}%`)
        .limit(limit);

      if (vendorError) {
        console.error('[API] Vendor search error:', vendorError);
      } else {
        results.vendors = vendors || [];
        console.log(`[API] Found ${results.vendors.length} vendors`);
      }
    }

    // Search services
    if (type === 'all' || type === 'services') {
      const { data: services, error: serviceError } = await supabaseAdmin!
        .from('services')
        .select('*')
        .eq('is_active', true)
        .or(`service_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
        .limit(limit);

      if (serviceError) {
        console.error('[API] Service search error:', serviceError);
      } else {
        results.services = services || [];
        console.log(`[API] Found ${results.services.length} services`);
      }
    }

    // Search categories
    if (type === 'all' || type === 'categories') {
      const { data: categories, error: categoryError } = await supabaseAdmin!
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(limit);

      if (categoryError) {
        console.error('[API] Category search error:', categoryError);
      } else {
        results.categories = categories || [];
        console.log(`[API] Found ${results.categories.length} categories`);
      }
    }

    const total = results.vendors.length + results.services.length + results.categories.length;

    console.log(`[API] Search complete. Total results: ${total}`);

    return NextResponse.json({
      success: true,
      results,
      meta: {
        query: searchTerm,
        type,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      results: { vendors: [], services: [], categories: [] },
    }, { status: 500 });
  }
}
