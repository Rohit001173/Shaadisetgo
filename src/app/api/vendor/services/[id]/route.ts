import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single service details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const vendorId = request.headers.get('x-vendor-id');
    const { id } = await params;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const service = await db.vendorService.findFirst({
      where: { id, vendorId, isActive: true }
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const vendorId = request.headers.get('x-vendor-id');
    const { id } = await params;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if service belongs to vendor
    const existingService = await db.vendorService.findFirst({
      where: { id, vendorId, isActive: true }
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { serviceName, category, price, description, imageUrl } = body;

    // Update service
    const service = await db.vendorService.update({
      where: { id },
      data: {
        serviceName: serviceName || existingService.serviceName,
        category: category || existingService.category,
        price: price !== undefined ? parseInt(price) : existingService.price,
        description: description !== undefined ? description : existingService.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existingService.imageUrl,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const vendorId = request.headers.get('x-vendor-id');
    const { id } = await params;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if service belongs to vendor
    const existingService = await db.vendorService.findFirst({
      where: { id, vendorId, isActive: true }
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete
    await db.vendorService.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
