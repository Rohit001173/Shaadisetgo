import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get vendor ID from header (sent from client)
    const vendorId = request.headers.get('x-vendor-id');

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const vendor = await db.vendorUser.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        email: true,
        phone: true,
        ownerName: true,
        businessName: true,
        city: true,
        category: true,
        description: true,
        vendorStatus: true,
        createdAt: true,
      }
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get vendor data' },
      { status: 500 }
    );
  }
}
