import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

// Simple password verification (matching the hash used in signup)
function verifyPassword(password: string, hashedPassword: string): boolean {
  const hash = Buffer.from(password + 'shaadisetgo_salt_2024').toString('base64');
  return hash === hashedPassword;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[Vendor Login] Attempt for:', email);

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('[Vendor Login] Supabase not configured');
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Find vendor by email in vendor_users table
    const { data: vendor, error: fetchError } = await supabaseAdmin
      .from('vendor_users')
      .select('*')
      .ilike('email', email.toLowerCase())
      .single();

    console.log('[Vendor Login] Fetch result:', { vendor: vendor?.id, error: fetchError?.message });

    if (fetchError || !vendor) {
      console.log('[Vendor Login] Vendor not found:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, vendor.password)) {
      console.log('[Vendor Login] Invalid password for:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check vendor status
    if (vendor.vendor_status === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Your vendor account is under review. Please wait for admin approval.', status: 'pending' },
        { status: 403 }
      );
    }

    if (vendor.vendor_status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Your vendor account was not approved. Please contact support.', status: 'rejected' },
        { status: 403 }
      );
    }

    console.log('[Vendor Login] Success for:', email);

    // Return vendor data
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: vendor.id,
        email: vendor.email,
        phone: vendor.phone,
        ownerName: vendor.owner_name,
        businessName: vendor.business_name,
        city: vendor.city,
        category: vendor.category,
        description: vendor.description,
        vendorStatus: vendor.vendor_status,
      }
    });
  } catch (error) {
    console.error('[Vendor Login] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
