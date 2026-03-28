import { NextRequest, NextResponse } from 'next/server';

// In production, this would be stored in a database
// For demo, we're using a simple in-memory approach
let adminCredentials = {
  username: 'admin',
  password: 'shaadisetgo2024',
};

// PUT /api/admin/password - Change admin password
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current and new password are required' },
        { status: 400 }
      );
    }

    // Verify current password
    if (currentPassword !== adminCredentials.password) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Validate new password
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Update password (in production, this would update the database)
    adminCredentials.password = newPassword;

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

// GET /api/admin/password - Get password status (for debugging)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Password change endpoint is working',
    hint: 'Current demo password is available in the login page',
  });
}
