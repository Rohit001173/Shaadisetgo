import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// Generate booking ID
function generateBookingId(): string {
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SSG-${dateStr}-${random}`;
}

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

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const phone = searchParams.get('phone');

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (phone) {
      where.customerPhone = phone;
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
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
    const vendor = await db.vendor.findUnique({
      where: { id: body.vendorId }
    });
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const booking = await db.booking.create({
      data: {
        id: nanoid(),
        bookingId: generateBookingId(),
        vendorId: body.vendorId,
        vendorName: vendor.name,
        customerId: body.customerId || null,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail || null,
        eventDate: body.eventDate,
        city: body.city,
        functionType: body.functionType,
        guests: body.guests || null,
        timing: body.timing || null,
        specialRequest: body.specialRequest || null,
        status: 'pending',
      }
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
