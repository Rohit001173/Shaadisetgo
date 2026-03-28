import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get vendor dashboard stats
export async function GET(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get vendor details
    const vendor = await db.vendorUser.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        businessName: true,
        ownerName: true,
        email: true,
        phone: true,
        city: true,
        category: true,
        vendorStatus: true,
      }
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get counts in parallel
    const [totalServices, activeServices, totalBookings, pendingBookings, confirmedBookings, completedBookings] = await Promise.all([
      db.vendorService.count({ where: { vendorId } }),
      db.vendorService.count({ where: { vendorId, isActive: true } }),
      db.vendorBooking.count({ where: { vendorId } }),
      db.vendorBooking.count({ where: { vendorId, status: 'pending' } }),
      db.vendorBooking.count({ where: { vendorId, status: 'confirmed' } }),
      db.vendorBooking.count({ where: { vendorId, status: 'completed' } }),
    ]);

    // Get recent bookings (last 5)
    const recentBookings = await db.vendorBooking.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        service: {
          select: { serviceName: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        vendor,
        stats: {
          totalServices,
          activeServices,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
        },
        recentBookings,
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
