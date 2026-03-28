import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// GET - List all vendors with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    console.log('[Admin Vendors] Fetching vendors:', { status, page, limit, search });

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('[Admin Vendors] Supabase not configured');
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('vendor_users')
      .select('id, email, phone, owner_name, business_name, city, category, vendor_status, created_at', { count: 'exact' });

    // Status filter
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('vendor_status', status);
    }

    // Search filter
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,owner_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: vendors, error, count } = await query;

    if (error) {
      console.error('[Admin Vendors] Query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch vendors' },
        { status: 500 }
      );
    }

    console.log('[Admin Vendors] Fetched:', vendors?.length, 'total:', count);

    // Transform data to match expected format
    const transformedVendors = (vendors || []).map(v => ({
      id: v.id,
      email: v.email,
      phone: v.phone,
      ownerName: v.owner_name,
      businessName: v.business_name,
      city: v.city,
      category: v.category,
      vendorStatus: v.vendor_status,
      createdAt: v.created_at,
      _count: { services: 0, bookings: 0 } // Placeholder
    }));

    return NextResponse.json({
      success: true,
      data: transformedVendors,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('[Admin Vendors] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}
