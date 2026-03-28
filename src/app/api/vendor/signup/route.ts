import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-client';

/**
 * POST /api/vendor/signup
 * Create a new vendor profile (pending approval)
 * 
 * This creates a vendor record in the 'vendors' table with:
 * - vendor_status: 'pending' (needs admin approval)
 * - is_active: true
 * - is_verified: false
 * - is_featured: false
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/vendor/signup - Creating vendor profile...');

  // Check Supabase configuration
  if (!isSupabaseConfigured()) {
    console.error('[API] Supabase not configured!');
    return NextResponse.json({
      success: false,
      error: 'Database not configured. Please check Supabase environment variables.',
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log('[API] Vendor signup data received:', {
      ownerName: body.ownerName,
      businessName: body.businessName,
      email: body.email,
      phone: body.phone,
      category: body.category,
      city: body.city,
    });

    // Validate required fields
    const requiredFields = ['ownerName', 'phone', 'email', 'businessName', 'city', 'category', 'password'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('[API] Missing required fields:', missingFields);
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      }, { status: 400 });
    }

    // Validate phone (10 digits)
    if (body.phone.length !== 10) {
      return NextResponse.json({
        success: false,
        error: 'Phone number must be 10 digits',
      }, { status: 400 });
    }

    // Validate email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
      }, { status: 400 });
    }

    // Validate password
    if (body.password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters',
      }, { status: 400 });
    }

    // Check if email already exists
    const { data: existingEmail, error: emailCheckError } = await supabaseAdmin!
      .from('vendors')
      .select('id, email')
      .ilike('email', body.email)
      .limit(1);

    if (emailCheckError) {
      console.error('[API] Error checking existing email:', emailCheckError);
    }

    if (existingEmail && existingEmail.length > 0) {
      console.error('[API] Email already registered:', body.email);
      return NextResponse.json({
        success: false,
        error: 'Email already registered. Please use a different email.',
      }, { status: 400 });
    }

    // Check if phone already exists
    const { data: existingPhone, error: phoneCheckError } = await supabaseAdmin!
      .from('vendors')
      .select('id, phone_number')
      .eq('phone_number', body.phone)
      .limit(1);

    if (phoneCheckError) {
      console.error('[API] Error checking existing phone:', phoneCheckError);
    }

    if (existingPhone && existingPhone.length > 0) {
      console.error('[API] Phone already registered:', body.phone);
      return NextResponse.json({
        success: false,
        error: 'Phone number already registered. Please use a different number.',
      }, { status: 400 });
    }

    // Generate vendor ID
    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Hash password (simple hash - use bcrypt in production)
    const hashedPassword = Buffer.from(body.password + 'shaadisetgo_salt_2024').toString('base64');

    // Create vendor record
    const vendorData = {
      id: vendorId,
      name: body.businessName,
      owner_name: body.ownerName,
      category: body.category,
      city: body.city,
      area: body.area || null,
      phone_number: body.phone,
      email: body.email.toLowerCase(),
      password: hashedPassword,
      description: body.description || null,
      price_start: 0,
      rating: 0,
      reviews_count: 0,
      is_verified: false,
      is_featured: false,
      is_active: true,
      vendor_status: 'pending',
    };

    console.log('[API] Inserting vendor into Supabase:', vendorId);

    const { data: vendor, error: insertError } = await supabaseAdmin!
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();

    if (insertError) {
      console.error('[API] Error inserting vendor:', insertError);
      
      // Check for duplicate key error
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Email or phone number already registered',
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create vendor profile. Please try again.',
        details: insertError.message,
      }, { status: 500 });
    }

    console.log('[API] Vendor created successfully:', vendor?.id);

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      data: {
        id: vendor?.id,
        name: vendor?.name,
        owner_name: vendor?.owner_name,
        email: vendor?.email,
        category: vendor?.category,
        city: vendor?.city,
        vendor_status: vendor?.vendor_status,
      },
    });
  } catch (error) {
    console.error('[API] Exception in vendor signup:', error);
    return NextResponse.json({
      success: false,
      error: 'Registration failed. Please try again.',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
