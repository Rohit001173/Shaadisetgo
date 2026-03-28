import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Transform Prisma vendor to frontend format
function transformVendor(vendor: any) {
  return {
    id: vendor.id,
    name: vendor.name,
    ownerName: vendor.ownerName,
    category: vendor.category,
    city: vendor.city,
    area: vendor.area,
    pincode: vendor.pincode,
    priceStart: vendor.priceStart,
    priceLabel: vendor.priceLabel,
    priceModel: vendor.priceModel,
    advancePercentage: vendor.advancePercentage,
    maxGuests: vendor.maxGuests,
    extraHourCharge: vendor.extraHourCharge,
    distancePolicy: vendor.distancePolicy,
    rating: vendor.rating || 0,
    reviewsCount: vendor.reviewsCount || 0,
    phoneNumber: vendor.phoneNumber,
    description: vendor.description,
    services: vendor.services || [],
    viewCount: vendor.viewCount || 0,
    isVerified: vendor.isVerified,
    isFeatured: vendor.isFeatured,
    isActive: vendor.isActive,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
    images: vendor.images?.map((img: any) => ({
      id: img.id,
      vendorId: img.vendorId,
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
      order: img.order,
      createdAt: img.createdAt,
    })) || [],
  };
}

// GET /api/vendors/[id] - Get vendor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const vendor = await db.vendor.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' }
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
      data: transformVendor(vendor),
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/[id] - Update vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const vendor = await db.vendor.update({
      where: { id },
      data: {
        name: body.name,
        ownerName: body.ownerName,
        category: body.category,
        city: body.city,
        area: body.area,
        pincode: body.pincode,
        priceStart: body.priceStart ? parseInt(body.priceStart) : undefined,
        priceLabel: body.priceLabel,
        priceModel: body.priceModel,
        advancePercentage: body.advancePercentage ? parseInt(body.advancePercentage) : undefined,
        maxGuests: body.maxGuests,
        extraHourCharge: body.extraHourCharge,
        distancePolicy: body.distancePolicy,
        phoneNumber: body.phoneNumber,
        description: body.description,
        isVerified: body.isVerified,
        isFeatured: body.isFeatured,
        isActive: body.isActive,
        updatedAt: new Date(),
      },
      include: {
        images: { orderBy: { order: 'asc' } }
      }
    });

    return NextResponse.json({
      success: true,
      data: transformVendor(vendor),
      message: 'Vendor updated successfully',
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete/Deactivate vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.vendor.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}
