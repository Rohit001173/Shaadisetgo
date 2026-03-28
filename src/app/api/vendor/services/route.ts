import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// GET - List vendor's services with pagination
export async function GET(request: NextRequest) {
  try {
    const vendorId = request.headers.get('x-vendor-id');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('[Vendor Services] GET for vendor:', vendorId);

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('vendor_services')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('is_active', true);

    if (countError) {
      console.error('[Vendor Services] Count error:', countError);
    }

    // Get services with pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: services, error } = await supabaseAdmin
      .from('vendor_services')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[Vendor Services] Fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch services' },
        { status: 500 }
      );
    }

    // Transform data
    const transformedServices = (services || []).map(s => ({
      id: s.id,
      vendorId: s.vendor_id,
      serviceName: s.service_name,
      category: s.category,
      price: s.price,
      description: s.description,
      imageUrl: s.image_url,
      isActive: s.is_active,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedServices,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('[Vendor Services] Error:', error);
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

    console.log('[Vendor Services] POST for vendor:', vendorId);

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if vendor is approved
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendor_users')
      .select('vendor_status')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor || vendor.vendor_status !== 'approved') {
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
    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { data: service, error } = await supabaseAdmin
      .from('vendor_services')
      .insert([{
        id: serviceId,
        vendor_id: vendorId,
        service_name: serviceName,
        category: category,
        price: parseInt(price),
        description: description || null,
        image_url: imageUrl || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[Vendor Services] Insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: {
        id: service.id,
        vendorId: service.vendor_id,
        serviceName: service.service_name,
        category: service.category,
        price: service.price,
        description: service.description,
        imageUrl: service.image_url,
      }
    });
  } catch (error) {
    console.error('[Vendor Services] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
