import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single vendor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vendor = await db.vendorUser.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
          take: 10,
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            services: true,
            bookings: true,
          }
        }
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
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// PUT - Update vendor status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { vendorStatus } = body;

    if (!['pending', 'approved', 'rejected'].includes(vendorStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Use pending, approved, or rejected.' },
        { status: 400 }
      );
    }

    const vendor = await db.vendorUser.update({
      where: { id },
      data: { 
        vendorStatus,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: `Vendor ${vendorStatus === 'approved' ? 'approved' : vendorStatus === 'rejected' ? 'rejected' : 'status updated'} successfully`,
      data: vendor
    });
  } catch (error) {
    console.error('Update vendor status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor status' },
      { status: 500 }
    );
  }
}
