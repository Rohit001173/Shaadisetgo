import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/supabase-db';

// Transform snake_case booking to camelCase for frontend
function transformBooking(booking: any) {
  return {
    id: booking.id,
    bookingId: booking.booking_id,
    vendorId: booking.vendor_id,
    vendorName: booking.vendor_name,
    customerId: booking.customer_id,
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

// PUT /api/bookings/[id] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const booking = await updateBookingStatus(id, body.status);

    return NextResponse.json({
      success: true,
      data: transformBooking(booking),
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
