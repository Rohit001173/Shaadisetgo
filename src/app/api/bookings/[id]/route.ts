import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Transform Prisma booking to frontend format
function transformBooking(booking: any) {
  return {
    id: booking.id,
    bookingId: booking.bookingId,
    vendorId: booking.vendorId,
    vendorName: booking.vendorName,
    customerId: booking.customerId,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail,
    eventDate: booking.eventDate,
    city: booking.city,
    functionType: booking.functionType,
    guests: booking.guests,
    timing: booking.timing,
    specialRequest: booking.specialRequest,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const booking = await db.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transformBooking(booking),
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

    const booking = await db.booking.update({
      where: { id },
      data: {
        status: body.status,
        updatedAt: new Date(),
      }
    });

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
