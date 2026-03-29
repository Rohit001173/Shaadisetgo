import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Get environment variables
function getConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return {
    url: supabaseUrl,
    key: supabaseServiceKey || supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey,
  };
}

// Create Supabase client
function getSupabaseClient() {
  const { url, key } = getConfig();
  
  if (!url || !key) {
    console.error('[Services API] Missing config:', {
      url: url ? 'SET' : 'MISSING',
      key: key ? 'SET' : 'MISSING',
    });
    return null;
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/services
 * Fetch services with optional filters
 */
export async function GET(request: NextRequest) {
  console.log('[Services API] GET request received');
  
  const client = getSupabaseClient();
  
  if (!client) {
    console.error('[Services API] Failed to create client');
    return NextResponse.json({
      success: false,
      error: 'Database connection failed. Please check Supabase configuration.',
      data: [],
    }, { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);

    let query = client
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    const category = searchParams.get('category');
    if (category) {
      query = query.ilike('category', category);
    }

    const city = searchParams.get('city');
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`service_name.ilike.%${search}%,category.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const vendorId = searchParams.get('vendor_id');
    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('[Services API] Query error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        data: [],
      }, { headers: corsHeaders });
    }

    console.log(`[Services API] Returning ${data?.length || 0} services`);

    return NextResponse.json({
      success: true,
      data: data || [],
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Services API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services',
      data: [],
    }, { headers: corsHeaders });
  }
}

/**
 * POST /api/services
 * Create a new service
 */
export async function POST(request: NextRequest) {
  console.log('[Services API] POST request received');
  
  const client = getSupabaseClient();
  
  if (!client) {
    console.error('[Services API] Failed to create client');
    return NextResponse.json({
      success: false,
      error: 'Database connection failed. Please check Supabase configuration.',
    }, { status: 500, headers: corsHeaders });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    let serviceData: Record<string, any> = {};

    // Handle JSON body
    if (contentType.includes('application/json')) {
      const body = await request.json();
      console.log('[Services API] Request body:', body);

      // Only include columns that exist in Supabase table
      serviceData = {
        id: randomUUID(),
        service_name: body.service_name || body.serviceName,
        category: body.category,
        city: body.city || null,
        price: body.price ? parseInt(body.price) : null,
        description: body.description || null,
        image_url: body.image_url || (body.images && body.images.length > 0 ? body.images[0] : null),
        vendor_id: body.vendor_id || body.vendorId || null,
      };
    } else {
      // Handle FormData
      const formData = await request.formData();

      serviceData = {
        id: randomUUID(),
        service_name: formData.get('service_name') || formData.get('serviceName'),
        category: formData.get('category'),
        city: formData.get('city') || null,
        price: formData.get('price') ? parseInt(formData.get('price') as string) : null,
        description: formData.get('description') || null,
        vendor_id: formData.get('vendor_id') || formData.get('vendorId') || null,
      };

      // Handle image upload
      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `services/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await client.storage
          .from('Vendor_image')
          .upload(fileName, uint8Array, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type,
          });

        if (!uploadError) {
          const { data: urlData } = client.storage
            .from('Vendor_image')
            .getPublicUrl(fileName);
          serviceData.image_url = urlData.publicUrl;
        }
      }
    }

    // Validate required fields
    if (!serviceData.service_name || !serviceData.category) {
      return NextResponse.json({
        success: false,
        error: 'Service name and category are required',
      }, { status: 400, headers: corsHeaders });
    }

    console.log('[Services API] Inserting:', serviceData);

    const { data, error } = await client
      .from('services')
      .insert([serviceData])
      .select()
      .single();

    if (error) {
      console.error('[Services API] Insert error:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to create service',
      }, { status: 500, headers: corsHeaders });
    }

    console.log('[Services API] Created:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Service created successfully!',
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Services API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create service',
    }, { status: 500, headers: corsHeaders });
  }
}
