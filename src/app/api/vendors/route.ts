import { NextRequest, NextResponse } from 'next/server';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  isSupabaseConfigured,
  uploadImages,
  Vendor
} from '@/lib/supabase-client';

// Transform vendor for frontend compatibility
function transformVendor(vendor: Vendor) {
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
    images: [], // Images fetched separately if needed
  };
}

/**
 * GET /api/vendors
 * Fetch vendors with optional filters
 * 
 * Query params:
 * - category: Filter by category
 * - city: Filter by city
 * - search: Search in name, category, city, area
 * - featured: Filter featured vendors (true/false)
 * - limit: Limit number of results
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/vendors - Fetching vendors...');

  // Check Supabase configuration
  if (!isSupabaseConfigured()) {
    console.error('[API] Supabase not configured!');
    return NextResponse.json({
      success: false,
      error: 'Database not configured. Please check Supabase environment variables.',
      data: [],
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      search: searchParams.get('search') || undefined,
      featured: searchParams.get('featured') === 'true',
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    console.log('[API] Filters:', filters);

    const vendors = await getVendors(filters);
    const transformedVendors = vendors.map(transformVendor);

    console.log(`[API] Returning ${transformedVendors.length} vendors`);

    return NextResponse.json({
      success: true,
      data: transformedVendors,
      meta: {
        total: transformedVendors.length,
        filters: filters,
      },
    });
  } catch (error) {
    console.error('[API] Error in GET /api/vendors:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vendors',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    }, { status: 500 });
  }
}

/**
 * POST /api/vendors
 * Create a new vendor/service listing
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/vendors - Creating vendor...');

  if (!isSupabaseConfigured()) {
    console.error('[API] Supabase not configured!');
    return NextResponse.json({
      success: false,
      error: 'Database not configured. Please check Supabase environment variables.',
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log('[API] Vendor data received:', {
      name: body.name,
      category: body.category,
      city: body.city,
    });

    // Validate required fields
    const requiredFields = ['name', 'category', 'city'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('[API] Missing required fields:', missingFields);
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      }, { status: 400 });
    }

    // Create vendor data
    const vendorData = {
      name: body.name,
      owner_name: body.ownerName || body.name,
      category: body.category,
      city: body.city,
      area: body.area || null,
      pincode: body.pincode || null,
      price_start: parseInt(body.priceStart) || 0,
      price_label: body.priceLabel || `Starting from ₹${parseInt(body.priceStart || 0).toLocaleString()}`,
      price_model: body.priceModel || null,
      advance_percentage: body.advancePercentage ? parseInt(body.advancePercentage) : null,
      max_guests: body.maxGuests || null,
      extra_hour_charge: body.extraHourCharge || null,
      distance_policy: body.distancePolicy || null,
      phone_number: body.phoneNumber || null,
      description: body.description || null,
      services: body.services || [],
      is_verified: body.isVerified || false,
      is_featured: body.isFeatured || false,
      is_active: true,
      rating: 0,
      reviews_count: 0,
    };

    // Handle image uploads if provided as files
    let imageUrls: string[] = [];
    if (body.imageFiles && Array.isArray(body.imageFiles)) {
      console.log('[API] Uploading images...');
      imageUrls = await uploadImages(body.imageFiles, 'vendors');
      console.log('[API] Images uploaded:', imageUrls);
    } else if (body.images && Array.isArray(body.images)) {
      // Images already uploaded (URLs provided)
      imageUrls = body.images;
    }

    // Create vendor in Supabase
    const vendor = await createVendor(vendorData);

    if (!vendor) {
      console.error('[API] Failed to create vendor');
      return NextResponse.json({
        success: false,
        error: 'Failed to create vendor. Please try again.',
      }, { status: 500 });
    }

    // Upload images to vendor_images table if we have URLs
    if (imageUrls.length > 0) {
      // Note: Images can be stored in vendor_images table or as vendor.images array
      // For simplicity, we'll update the vendor with images array
      // You can create a separate vendor_images insert if needed
    }

    console.log('[API] Vendor created successfully:', vendor.id);

    return NextResponse.json({
      success: true,
      data: transformVendor(vendor),
      message: 'Vendor created successfully!',
    });
  } catch (error) {
    console.error('[API] Error in POST /api/vendors:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create vendor',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * PUT /api/vendors
 * Update an existing vendor
 */
export async function PUT(request: NextRequest) {
  console.log('[API] PUT /api/vendors - Updating vendor...');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Vendor ID is required',
      }, { status: 400 });
    }

    // Transform updates to match database schema
    const dbUpdates: Partial<Vendor> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.ownerName) dbUpdates.owner_name = updates.ownerName;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.city) dbUpdates.city = updates.city;
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.pincode !== undefined) dbUpdates.pincode = updates.pincode;
    if (updates.priceStart !== undefined) dbUpdates.price_start = parseInt(updates.priceStart);
    if (updates.priceLabel !== undefined) dbUpdates.price_label = updates.priceLabel;
    if (updates.priceModel !== undefined) dbUpdates.price_model = updates.priceModel;
    if (updates.advancePercentage !== undefined) dbUpdates.advance_percentage = parseInt(updates.advancePercentage);
    if (updates.maxGuests !== undefined) dbUpdates.max_guests = updates.maxGuests;
    if (updates.extraHourCharge !== undefined) dbUpdates.extra_hour_charge = updates.extraHourCharge;
    if (updates.distancePolicy !== undefined) dbUpdates.distance_policy = updates.distancePolicy;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.services !== undefined) dbUpdates.services = updates.services;
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const vendor = await updateVendor(id, dbUpdates);

    if (!vendor) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update vendor',
      }, { status: 500 });
    }

    console.log('[API] Vendor updated successfully:', vendor.id);

    return NextResponse.json({
      success: true,
      data: transformVendor(vendor),
      message: 'Vendor updated successfully!',
    });
  } catch (error) {
    console.error('[API] Error in PUT /api/vendors:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update vendor',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/vendors
 * Soft delete a vendor
 */
export async function DELETE(request: NextRequest) {
  console.log('[API] DELETE /api/vendors - Deleting vendor...');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Vendor ID is required',
      }, { status: 400 });
    }

    const success = await deleteVendor(id);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete vendor',
      }, { status: 500 });
    }

    console.log('[API] Vendor deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully',
    });
  } catch (error) {
    console.error('[API] Error in DELETE /api/vendors:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete vendor',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
