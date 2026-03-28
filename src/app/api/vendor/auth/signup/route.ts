import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  const hash = Buffer.from(password + 'shaadisetgo_salt_2024').toString('base64');
  return hash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerName, phone, email, businessName, city, category, description, password } = body;

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

    // Check if email or phone already exists
    const existingVendor = await db.vendorUser.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone }
        ]
      }
    });

    if (existingVendor) {
      if (existingVendor.email === email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 400 }
        );
      }
      if (existingVendor.phone === phone) {
        return NextResponse.json(
          { success: false, error: 'Phone number already registered' },
          { status: 400 }
        );
      }
    }

    // Create vendor user with pending status
    const vendor = await db.vendorUser.create({
      data: {
        email: email.toLowerCase(),
        phone,
        password: hashPassword(password),
        ownerName,
        businessName,
        city,
        category,
        description: description || null,
        vendorStatus: 'pending',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      data: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.businessName,
        vendorStatus: vendor.vendorStatus,
      }
    });
  } catch (error) {
    console.error('Vendor signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
