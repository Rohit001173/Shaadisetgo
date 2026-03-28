import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List vendor's services with pagination
export async function GET(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get total count
    const total = await db.vendorService.count({
      where: { vendorId, isActive: true }
    });

    // Get services with pagination
    const services = await db.vendorService.findMany({
      where: { vendorId, isActive: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get vendor services error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');
    
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if vendor is approved
    const vendor = await db.vendorUser.findUnique({
      where: { id: vendorId },
      select: { vendorStatus: true }
    });

    if (!vendor || vendor.vendorStatus !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Your account is not approved yet' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { serviceName, category, price, description, imageUrl } = body;

    // Validation
    if (!serviceName || !category || !price) {
      return NextResponse.json(
        { success: false, error: 'Service name, category, and price are required' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Create service
    const service = await db.vendorService.create({
      data: {
        vendorId,
        serviceName,
        category,
        price: parseInt(price),
        description: description || null,
        imageUrl: imageUrl || null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create vendor service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
