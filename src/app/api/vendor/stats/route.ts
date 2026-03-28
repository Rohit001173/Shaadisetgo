import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// GET - Get vendor dashboard stats
export async function GET(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');

    console.log('[Vendor Stats] GET for vendor:', vendorId);

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get vendor details
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendor_users')
      .select('id, business_name, owner_name, email, phone, city, category, vendor_status')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get counts in parallel
    const [
      servicesResult,
      activeServicesResult,
      bookingsResult,
      pendingBookingsResult,
      confirmedBookingsResult,
      completedBookingsResult,
      recentBookingsResult
    ] = await Promise.all([
      supabaseAdmin.from('vendor_services').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId),
      supabaseAdmin.from('vendor_services').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId).eq('is_active', true),
      supabaseAdmin.from('vendor_bookings').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId),
      supabaseAdmin.from('vendor_bookings').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId).eq('status', 'pending'),
      supabaseAdmin.from('vendor_bookings').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId).eq('status', 'confirmed'),
      supabaseAdmin.from('vendor_bookings').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId).eq('status', 'completed'),
      supabaseAdmin.from('vendor_bookings').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }).limit(5),
    ]);

    // Transform vendor data
    const transformedVendor = {
      id: vendor.id,
      businessName: vendor.business_name,
      ownerName: vendor.owner_name,
      email: vendor.email,
      phone: vendor.phone,
      city: vendor.city,
      category: vendor.category,
      vendorStatus: vendor.vendor_status,
    };

    // Transform recent bookings
    const transformedBookings = (recentBookingsResult.data || []).map(b => ({
      id: b.id,
      bookingId: b.booking_id,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      eventDate: b.event_date,
      status: b.status,
      createdAt: b.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        vendor: transformedVendor,
        stats: {
          totalServices: servicesResult.count || 0,
          activeServices: activeServicesResult.count || 0,
          totalBookings: bookingsResult.count || 0,
          pendingBookings: pendingBookingsResult.count || 0,
          confirmedBookings: confirmedBookingsResult.count || 0,
          completedBookings: completedBookingsResult.count || 0,
        },
        recentBookings: transformedBookings,
      }
    });
  } catch (error) {
    console.error('[Vendor Stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
