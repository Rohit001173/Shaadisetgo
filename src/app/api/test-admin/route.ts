import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint - NO dependencies, just works
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    credentials: {
      username: 'admin',
      password: 'shaadisetgo2024'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Simple check
    if (username === 'admin' && password === 'shaadisetgo2024') {
      return NextResponse.json({
        success: true,
        message: 'Login successful!',
        token: 'admin-token-' + Date.now()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Wrong credentials',
      hint: 'Use: admin / shaadisetgo2024'
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}
