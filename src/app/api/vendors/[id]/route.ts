import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorById,
  updateVendor,
  deleteVendor,
  isSupabaseConfigured,
  supabaseAdmin
} from '@/lib/supabase-client';

// Transform Supabase vendor to frontend format
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
    images: [], // Images fetched separately if needed
  };
}

// GET /api/vendors/[id] - Get vendor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const vendor = await getVendorById(id);

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

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Transform updates to match database schema
    const updates: any = {};

    if (body.name) updates.name = body.name;
    if (body.ownerName) updates.owner_name = body.ownerName;
    if (body.category) updates.category = body.category;
    if (body.city) updates.city = body.city;
    if (body.area !== undefined) updates.area = body.area;
    if (body.pincode !== undefined) updates.pincode = body.pincode;
    if (body.priceStart !== undefined) updates.price_start = parseInt(body.priceStart);
    if (body.priceLabel !== undefined) updates.price_label = body.priceLabel;
    if (body.priceModel !== undefined) updates.price_model = body.priceModel;
    if (body.advancePercentage !== undefined) updates.advance_percentage = parseInt(body.advancePercentage);
    if (body.maxGuests !== undefined) updates.max_guests = body.maxGuests;
    if (body.extraHourCharge !== undefined) updates.extra_hour_charge = body.extraHourCharge;
    if (body.distancePolicy !== undefined) updates.distance_policy = body.distancePolicy;
    if (body.phoneNumber !== undefined) updates.phone_number = body.phoneNumber;
    if (body.description !== undefined) updates.description = body.description;
    if (body.services !== undefined) updates.services = body.services;
    if (body.isVerified !== undefined) updates.is_verified = body.isVerified;
    if (body.isFeatured !== undefined) updates.is_featured = body.isFeatured;
    if (body.isActive !== undefined) updates.is_active = body.isActive;

    const vendor = await updateVendor(id, updates);

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Failed to update vendor' },
        { status: 500 }
      );
    }

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

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const success = await deleteVendor(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete vendor' },
        { status: 500 }
      );
    }

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
