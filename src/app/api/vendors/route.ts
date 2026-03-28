import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

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

// GET /api/vendors - Get all vendors with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = { isActive: true };
    
    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }
    
    if (city) {
      where.OR = [
        { city: { equals: city, mode: 'insensitive' } },
        { area: { contains: city, mode: 'insensitive' } }
      ];
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (featured) {
      where.isFeatured = true;
    }

    const vendors = await db.vendor.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' }
      ],
      take: limit,
    });

    const transformedVendors = vendors.map(transformVendor);

    return NextResponse.json({
      success: true,
      data: transformedVendors,
      meta: { total: transformedVendors.length },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create a new vendor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate ID
    const vendorId = nanoid();
    
    // Create vendor
    const vendor = await db.vendor.create({
      data: {
        id: vendorId,
        name: body.name,
        ownerName: body.ownerName || null,
        category: body.category,
        city: body.city,
        area: body.area || null,
        pincode: body.pincode || null,
        priceStart: parseInt(body.priceStart) || 0,
        priceLabel: body.priceLabel || `Starting from ₹${parseInt(body.priceStart || 0).toLocaleString()}`,
        priceModel: body.priceModel || null,
        advancePercentage: body.advancePercentage ? parseInt(body.advancePercentage) : null,
        maxGuests: body.maxGuests || null,
        extraHourCharge: body.extraHourCharge || null,
        distancePolicy: body.distancePolicy || null,
        phoneNumber: body.phoneNumber || null,
        description: body.description || null,
        isVerified: body.isVerified || false,
        isFeatured: body.isFeatured || false,
        isActive: true,
        rating: 0,
        reviewsCount: 0,
      },
      include: {
        images: true
      }
    });

    // Add images if provided
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      const imageRecords = body.images.map((url: string, index: number) => ({
        vendorId: vendor.id,
        imageUrl: url,
        isPrimary: index === 0,
        order: index,
      }));
      
      await db.vendorImage.createMany({ data: imageRecords });
    }

    // Fetch with images
    const vendorWithImages = await db.vendor.findUnique({
      where: { id: vendor.id },
      include: { images: { orderBy: { order: 'asc' } } }
    });

    return NextResponse.json({
      success: true,
      data: transformVendor(vendorWithImages),
      message: 'Service created successfully',
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
