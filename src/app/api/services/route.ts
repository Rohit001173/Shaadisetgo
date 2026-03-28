import { NextRequest, NextResponse } from 'next/server';
import {
  getServices,
  createService,
  isSupabaseConfigured,
  uploadImage,
  Service
} from '@/lib/supabase-client';

/**
 * GET /api/services
 * Fetch services with optional filters
 * 
 * Query params:
 * - category: Filter by category
 * - city: Filter by city
 * - search: Search in service_name, category, city
 * - vendor_id: Filter by vendor
 * - limit: Limit number of results
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/services - Fetching services...');

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
      vendor_id: searchParams.get('vendor_id') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    console.log('[API] Service filters:', filters);

    const services = await getServices(filters);

    console.log(`[API] Returning ${services.length} services`);

    return NextResponse.json({
      success: true,
      data: services,
      meta: {
        total: services.length,
        filters: filters,
      },
    });
  } catch (error) {
    console.error('[API] Error in GET /api/services:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    }, { status: 500 });
  }
}

/**
 * POST /api/services
 * Create a new service
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/services - Creating service...');

  if (!isSupabaseConfigured()) {
    console.error('[API] Supabase not configured!');
    return NextResponse.json({
      success: false,
      error: 'Database not configured. Please check Supabase environment variables.',
    }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    
    // Extract service data
    const serviceName = formData.get('service_name') as string || formData.get('serviceName') as string;
    const category = formData.get('category') as string;
    const city = formData.get('city') as string;
    const price = parseInt(formData.get('price') as string) || 0;
    const description = formData.get('description') as string;
    const vendorId = formData.get('vendor_id') as string || formData.get('vendorId') as string;

    // Validate required fields
    if (!serviceName || !category) {
      console.error('[API] Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'service_name and category are required',
      }, { status: 400 });
    }

    console.log('[API] Service data:', { serviceName, category, city, price });

    // Handle image upload
    let imageUrl: string | null = null;
    const imageFile = formData.get('image') as File | null;
    
    if (imageFile && imageFile.size > 0) {
      console.log('[API] Uploading service image...');
      imageUrl = await uploadImage(imageFile, 'services');
      console.log('[API] Image uploaded:', imageUrl);
    }

    // Create service
    const serviceData: Partial<Service> = {
      service_name: serviceName,
      category,
      city: city || null,
      price,
      description: description || null,
      image_url: imageUrl,
      vendor_id: vendorId || null,
      is_active: true,
    };

    const service = await createService(serviceData);

    if (!service) {
      console.error('[API] Failed to create service');
      return NextResponse.json({
        success: false,
        error: 'Failed to create service. Please try again.',
      }, { status: 500 });
    }

    console.log('[API] Service created successfully:', service.id);

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service created successfully!',
    });
  } catch (error) {
    console.error('[API] Error in POST /api/services:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create service',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
