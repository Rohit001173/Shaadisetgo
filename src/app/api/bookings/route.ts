import { NextRequest, NextResponse } from 'next/server';
import {
  createBooking,
  getBookingsByPhone,
  isSupabaseConfigured,
  getVendorById
} from '@/lib/supabase-client';

// Generate booking ID
function generateBookingId(): string {
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SSG-${dateStr}-${random}`;
}

// Transform Supabase booking to frontend format
function transformBooking(booking: any) {
  return {
    id: booking.id,
    bookingId: booking.booking_id,
    vendorId: booking.vendor_id,
    vendorName: booking.vendor_name,
    customerName: booking.customer_name,
    customerPhone: booking.customer_phone,
    customerEmail: booking.customer_email,
    eventDate: booking.event_date,
    city: booking.city,
    functionType: booking.function_type,
    guests: booking.guests,
    timing: booking.timing,
    specialRequest: booking.special_request,
    status: booking.status,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  };
}

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/bookings - Fetching bookings...');

    if (!isSupabaseConfigured()) {
      console.error('[API] Supabase not configured');
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        data: [],
      });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    let bookings;
    if (phone) {
      bookings = await getBookingsByPhone(phone);
    } else {
      // Get all bookings from Supabase
      const { supabaseAdmin } = await import('@/lib/supabase-client');
      if (!supabaseAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Database not available',
          data: [],
        });
      }

      const { data, error } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[API] Error fetching bookings:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch bookings',
          data: [],
        });
      }

      bookings = data;
    }

    const transformedBookings = bookings.map(transformBooking);

    console.log(`[API] Returning ${transformedBookings.length} bookings`);

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      meta: { total: transformedBookings.length },
    });
  } catch (error) {
    console.error('[API] Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings', data: [] },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/bookings - Creating booking...');

    if (!isSupabaseConfigured()) {
      console.error('[API] Supabase not configured');
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      });
    }

    const body = await request.json();

    // Get vendor details
    const vendor = await getVendorById(body.vendorId);

    const bookingData = {
      vendor_id: body.vendorId,
      vendor_name: vendor?.name || 'Unknown Vendor',
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail || null,
      event_date: body.eventDate,
      city: body.city,
      function_type: body.functionType,
      guests: body.guests || null,
      timing: body.timing || null,
      special_request: body.specialRequest || null,
    };

    const booking = await createBooking(bookingData);

    if (!booking) {
      console.error('[API] Failed to create booking');
      return NextResponse.json(
        { success: false, error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    console.log('[API] Booking created:', booking.booking_id);

    return NextResponse.json({
      success: true,
      data: transformBooking(booking),
      message: 'Booking request submitted successfully',
    });
  } catch (error) {
    console.error('[API] Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
