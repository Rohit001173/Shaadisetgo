import { NextRequest, NextResponse } from 'next/server';
import { getVendors, createVendor, getStats } from '@/lib/supabase-db';

// Transform snake_case to camelCase for frontend
function transformVendor(vendor: any) {
  return {
    id: vendor.id,
    name: vendor.name,
    ownerName: vendor.owner_name,
    category: vendor.category,
    city: vendor.city,
    area: vendor.area,
    pincode: vendor.pincode,
    priceStart: vendor.price_start,
    priceLabel: vendor.price_label,
    priceModel: vendor.price_model,
    advancePercentage: vendor.advance_percentage,
    maxGuests: vendor.max_guests,
    extraHourCharge: vendor.extra_hour_charge,
    distancePolicy: vendor.distance_policy,
    rating: vendor.rating || 0,
    reviewsCount: vendor.reviews_count || 0,
    phoneNumber: vendor.phone_number,
    description: vendor.description,
    services: vendor.services || [],
    viewCount: vendor.view_count || 0,
    isVerified: vendor.is_verified,
    isFeatured: vendor.is_featured,
    isActive: vendor.is_active,
    createdAt: vendor.created_at,
    updatedAt: vendor.updated_at,
    images: vendor.images?.map((img: any) => ({
      id: img.id,
      vendorId: img.vendor_id,
      imageUrl: img.image_url,
      isPrimary: img.is_primary,
      order: img.order,
      createdAt: img.created_at,
    })) || [],
  };
}

// GET /api/vendors - Get all vendors with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const vendors = await getVendors({ category, city, search, featured, limit });
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
    
    // Prepare vendor data with only supported columns
    const vendorData: any = {
      name: body.name,
      owner_name: body.ownerName,
      category: body.category,
      city: body.city,
      area: body.area,
      pincode: body.pincode,
      price_start: parseInt(body.priceStart) || 0,
      price_label: body.priceLabel,
      price_model: body.priceModel,
      advance_percentage: body.advancePercentage ? parseInt(body.advancePercentage) : undefined,
      max_guests: body.maxGuests,
      extra_hour_charge: body.extraHourCharge,
      distance_policy: body.distancePolicy,
      phone_number: body.phoneNumber,
      description: body.description,
      is_verified: body.isVerified || false,
      is_featured: body.isFeatured || false,
      is_active: true,
      rating: 0,
      reviews_count: 0,
    };

    // Only add services if provided (column may not exist in older schemas)
    if (body.services && Array.isArray(body.services) && body.services.length > 0) {
      vendorData.services = body.services;
    }

    let vendor;
    try {
      vendor = await createVendor(vendorData, body.images);
    } catch (createError: any) {
      // If services column doesn't exist, retry without it
      if (createError?.message?.includes('services') || createError?.code === 'PGRST204') {
        console.log('Services column not found, creating without services');
        delete vendorData.services;
        vendor = await createVendor(vendorData, body.images);
      } else {
        throw createError;
      }
    }

    return NextResponse.json({
      success: true,
      data: transformVendor(vendor),
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
