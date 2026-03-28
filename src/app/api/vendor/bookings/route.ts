import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// Generate booking ID
function generateBookingId(): string {
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
  const random = nanoid(6).toUpperCase();
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
    const skip = (page - 1) * limit;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Build filter
    const where: Record<string, unknown> = { vendorId };
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      where.status = status;
    }

    // Get total count
    const total = await db.vendorBooking.count({ where });

    // Get bookings with pagination
    const bookings = await db.vendorBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        service: {
          select: { serviceName: true, category: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking (for testing, or customer-facing)
export async function POST(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
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
    const booking = await db.vendorBooking.create({
      data: {
        bookingId: generateBookingId(),
        vendorId,
        serviceId: serviceId || null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        eventDate,
        eventTime: eventTime || null,
        venue: venue || null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        specialRequest: specialRequest || null,
        status: 'pending',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
