import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// Generate booking ID
function generateBookingId(): string {
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SSG-V-${dateStr}-${random}`;
}

// GET - List vendor's bookings with pagination
export async function GET(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    console.log('[Vendor Bookings] GET for vendor:', vendorId, 'status:', status);

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

    // Build query
    let query = supabaseAdmin
      .from('vendor_bookings')
      .select('*', { count: 'exact' })
      .eq('vendor_id', vendorId);

    // Status filter
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query = query.eq('status', status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('[Vendor Bookings] Fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Transform data
    const transformedBookings = (bookings || []).map(b => ({
      id: b.id,
      bookingId: b.booking_id,
      vendorId: b.vendor_id,
      serviceId: b.service_id,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerEmail: b.customer_email,
      eventDate: b.event_date,
      eventTime: b.event_time,
      venue: b.venue,
      guestCount: b.guest_count,
      specialRequest: b.special_request,
      status: b.status,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('[Vendor Bookings] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');

    console.log('[Vendor Bookings] POST for vendor:', vendorId);

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

    const body = await request.json();
    const { serviceId, customerName, customerPhone, customerEmail, eventDate, eventTime, venue, guestCount, specialRequest } = body;

    // Validation
    if (!customerName || !customerPhone || !eventDate) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, and event date are required' },
        { status: 400 }
      );
    }

    // Create booking
    const bookingId = generateBookingId();
    const id = `booking_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { data: booking, error } = await supabaseAdmin
      .from('vendor_bookings')
      .insert([{
        id,
        booking_id: bookingId,
        vendor_id: vendorId,
        service_id: serviceId || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        event_date: eventDate,
        event_time: eventTime || null,
        venue: venue || null,
        guest_count: guestCount ? parseInt(guestCount) : null,
        special_request: specialRequest || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[Vendor Bookings] Insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: {
        id: booking.id,
        bookingId: booking.booking_id,
        customerName: booking.customer_name,
        status: booking.status,
      }
    });
  } catch (error) {
    console.error('[Vendor Bookings] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
