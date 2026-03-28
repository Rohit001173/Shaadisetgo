import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Simple hardcoded admin credentials
    if (username === 'admin' && password === 'shaadisetgo2024') {
      return NextResponse.json({
        success: true,
        data: {
          token: 'admin-token-' + Date.now(),
          user: {
            name: 'Admin',
            role: 'admin',
          },
        },
        message: 'Login successful',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error in admin login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

// GET dashboard stats
export async function GET(request: NextRequest) {
  try {
    // Get counts in parallel
    const [totalVendors, activeVendors, totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
      db.vendor.count(),
      db.vendor.count({ where: { isActive: true } }),
      db.booking.count(),
      db.booking.count({ where: { status: 'pending' } }),
      db.booking.count({ where: { status: 'confirmed' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalVendors,
        activeVendors,
        totalBookings,
        pendingBookings,
        confirmedBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
