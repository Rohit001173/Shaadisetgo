import { NextRequest, NextResponse } from 'next/server';

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'shaadisetgo2024';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST - Admin Login
export async function POST(request: NextRequest) {
  console.log('[Admin API] ========== POST /api/admin ==========');
  console.log('[Admin API] Request received');

  try {
    // Parse body
    let body;
    try {
      body = await request.json();
      console.log('[Admin API] Request body parsed:', { username: body?.username });
    } catch (parseError) {
      console.error('[Admin API] Failed to parse body');
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      console.log('[Admin API] Missing credentials');
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('[Admin API] ✅ Login SUCCESS for:', username);
      return NextResponse.json({
        success: true,
        data: {
          token: 'admin-token-' + Date.now(),
          user: { name: 'Admin', role: 'admin' },
        },
        message: 'Login successful',
      }, { headers: corsHeaders });
    }

    console.log('[Admin API] ❌ Invalid credentials for:', username);
    return NextResponse.json(
      { success: false, error: 'Invalid username or password' },
      { status: 401, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Admin API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - Dashboard Stats
export async function GET(request: NextRequest) {
  console.log('[Admin API] ========== GET /api/admin ==========');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.log('[Admin API] Supabase not configured');
      return NextResponse.json({
        success: true,
        data: {
          totalVendors: 0,
          activeVendors: 0,
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
        },
      }, { headers: corsHeaders });
    }

    // Dynamic import Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch all stats in parallel
    const [vendorsRes, bookingsRes, pendingRes, confirmedRes] = await Promise.all([
      supabase.from('vendors').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    ]);

    const stats = {
      totalVendors: vendorsRes.count || 0,
      activeVendors: vendorsRes.count || 0,
      totalBookings: bookingsRes.count || 0,
      pendingBookings: pendingRes.count || 0,
      confirmedBookings: confirmedRes.count || 0,
    };

    console.log('[Admin API] Stats:', stats);

    return NextResponse.json({
      success: true,
      data: stats,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Admin API] Stats error:', error);
    return NextResponse.json({
      success: true,
      data: {
        totalVendors: 0,
        activeVendors: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
      },
    }, { headers: corsHeaders });
  }
}
