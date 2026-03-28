import { NextRequest, NextResponse } from 'next/server';
import { getVendorById, updateVendor, deleteVendor } from '@/lib/supabase-db';

// GET /api/vendors/[id] - Get vendor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const vendor = await getVendorById(id);

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor,
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

    const vendor = await updateVendor(id, {
      name: body.name,
      owner_name: body.ownerName,
      category: body.category,
      city: body.city,
      area: body.area,
      pincode: body.pincode,
      price_start: body.priceStart ? parseInt(body.priceStart) : undefined,
      price_label: body.priceLabel,
      price_model: body.priceModel,
      advance_percentage: body.advancePercentage ? parseInt(body.advancePercentage) : undefined,
      max_guests: body.maxGuests,
      extra_hour_charge: body.extraHourCharge,
      distance_policy: body.distancePolicy,
      phone_number: body.phoneNumber,
      description: body.description,
      is_verified: body.isVerified,
      is_featured: body.isFeatured,
      is_active: body.isActive,
    });

    return NextResponse.json({
      success: true,
      data: vendor,
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
    await deleteVendor(id);

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
