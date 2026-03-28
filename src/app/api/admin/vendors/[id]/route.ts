import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// GET - Get single vendor details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[Admin Vendor] Fetching vendor:', id);

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: vendor, error } = await supabaseAdmin
      .from('vendor_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !vendor) {
      console.error('[Admin Vendor] Not found:', error);
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Transform to match expected format
    const transformedVendor = {
      id: vendor.id,
      email: vendor.email,
      phone: vendor.phone,
      ownerName: vendor.owner_name,
      businessName: vendor.business_name,
      city: vendor.city,
      category: vendor.category,
      description: vendor.description,
      vendorStatus: vendor.vendor_status,
      isActive: vendor.is_active,
      createdAt: vendor.created_at,
      updatedAt: vendor.updated_at,
      services: [],
      bookings: [],
      _count: { services: 0, bookings: 0 }
    };

    return NextResponse.json({
      success: true,
      data: transformedVendor
    });
  } catch (error) {
    console.error('[Admin Vendor] Error:', error);
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

    console.log('[Admin Vendor] Updating status:', id, vendorStatus);

    if (!['pending', 'approved', 'rejected'].includes(vendorStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Use pending, approved, or rejected.' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: vendor, error } = await supabaseAdmin
      .from('vendor_users')
      .update({
        vendor_status: vendorStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin Vendor] Update error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update vendor status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Vendor ${vendorStatus === 'approved' ? 'approved' : vendorStatus === 'rejected' ? 'rejected' : 'status updated'} successfully`,
      data: {
        id: vendor.id,
        vendorStatus: vendor.vendor_status,
      }
    });
  } catch (error) {
    console.error('[Admin Vendor] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor status' },
      { status: 500 }
    );
  }
}
