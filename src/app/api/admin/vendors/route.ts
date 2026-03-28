import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all vendors with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build filter
    const where: Record<string, unknown> = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.vendorStatus = status;
    }
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { ownerName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    // Get total count
    const total = await db.vendorUser.count({ where });

    // Get vendors
    const vendors = await db.vendorUser.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        phone: true,
        ownerName: true,
        businessName: true,
        city: true,
        category: true,
        vendorStatus: true,
        createdAt: true,
        _count: {
          select: {
            services: true,
            bookings: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}
