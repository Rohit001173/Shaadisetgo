import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  const hash = Buffer.from(password + 'shaadisetgo_salt_2024').toString('base64');
  return hash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerName, phone, email, businessName, city, category, description, password } = body;

    console.log('[Vendor Signup] Attempt for:', email, businessName);

    // Validation
    if (!ownerName || !phone || !email || !businessName || !city || !category || !password) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('[Vendor Signup] Supabase not configured');
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Check if email already exists
    const { data: existingByEmail, error: emailCheckError } = await supabaseAdmin
      .from('vendor_users')
      .select('id')
      .ilike('email', email.toLowerCase())
      .single();

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const { data: existingByPhone } = await supabaseAdmin
      .from('vendor_users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingByPhone) {
      return NextResponse.json(
        { success: false, error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Create vendor user with pending status
    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const { data: vendor, error: insertError } = await supabaseAdmin
      .from('vendor_users')
      .insert([{
        id: vendorId,
        email: email.toLowerCase(),
        phone: phone,
        password: hashPassword(password),
        owner_name: ownerName,
        business_name: businessName,
        city: city,
        category: category,
        description: description || null,
        vendor_status: 'pending',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      console.error('[Vendor Signup] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Registration failed. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[Vendor Signup] Success:', vendor?.id);

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      data: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.business_name,
        vendorStatus: vendor.vendor_status,
      }
    });
  } catch (error) {
    console.error('[Vendor Signup] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
