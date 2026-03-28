import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/supabase-db';

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
    const stats = await getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
