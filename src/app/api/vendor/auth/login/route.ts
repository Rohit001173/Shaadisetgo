import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple password verification
function verifyPassword(password: string, hashedPassword: string): boolean {
  const hash = Buffer.from(password + 'shaadisetgo_salt_2024').toString('base64');
  return hash === hashedPassword;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find vendor by email
    const vendor = await db.vendorUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, vendor.password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check vendor status
    if (vendor.vendorStatus === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Your vendor account is under review. Please wait for admin approval.', status: 'pending' },
        { status: 403 }
      );
    }

    if (vendor.vendorStatus === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Your vendor account was not approved. Please contact support.', status: 'rejected' },
        { status: 403 }
      );
    }

    // Return vendor data (in production, use JWT tokens)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: vendor.id,
        email: vendor.email,
        phone: vendor.phone,
        ownerName: vendor.ownerName,
        businessName: vendor.businessName,
        city: vendor.city,
        category: vendor.category,
        description: vendor.description,
        vendorStatus: vendor.vendorStatus,
      }
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
