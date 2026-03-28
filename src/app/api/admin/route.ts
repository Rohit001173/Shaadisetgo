import { NextRequest, NextResponse } from 'next/server';
import { getStats, isSupabaseConfigured } from '@/lib/supabase-client';

// Admin credentials - In production, these should be in environment variables
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'shaadisetgo2024';

// Simple admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('[Admin] Login attempt for username:', username);

    // Simple hardcoded admin credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('[Admin] Login successful');
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

    console.log('[Admin] Invalid credentials');
    return NextResponse.json(
      { success: false, error: 'Invalid credentials. Please check username and password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[Admin] Error in admin login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET dashboard stats
export async function GET(request: NextRequest) {
  try {
    console.log('[Admin] Fetching dashboard stats...');

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('[Admin] Supabase not configured');
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        data: {
          totalVendors: 0,
          activeVendors: 0,
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
        },
      });
    }

    // Get stats from Supabase
    const stats = await getStats();

    console.log('[Admin] Stats fetched:', stats);

    return NextResponse.json({
      success: true,
      data: {
        totalVendors: stats.totalVendors,
        activeVendors: stats.totalVendors, // For now, same as total
        totalBookings: stats.totalBookings,
        pendingBookings: stats.pendingBookings,
        confirmedBookings: stats.confirmedBookings,
      },
    });
  } catch (error) {
    console.error('[Admin] Error fetching stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stats',
        data: {
          totalVendors: 0,
          activeVendors: 0,
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
        },
      },
      { status: 500 }
    );
  }
}
