import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookings, getVendorById } from '@/lib/supabase-db';

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

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const phone = searchParams.get('phone') || undefined;

    const bookings = await getBookings({ status, phone });
    
    // Transform bookings to camelCase
    const transformedBookings = bookings.map(transformBooking);

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      meta: { total: transformedBookings.length },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get vendor details
    const vendor = await getVendorById(body.vendorId);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const booking = await createBooking({
      vendor_id: body.vendorId,
      vendor_name: vendor.name,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail,
      event_date: body.eventDate,
      city: body.city,
      function_type: body.functionType,
      guests: body.guests,
      timing: body.timing,
      special_request: body.specialRequest,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      data: transformBooking(booking),
      message: 'Booking request submitted successfully',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
