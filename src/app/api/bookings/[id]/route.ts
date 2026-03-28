import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured, updateBookingStatus } from '@/lib/supabase-client';

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

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transformBooking(data),
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const success = await updateBookingStatus(id, body.status);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${body.status} successfully`,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
