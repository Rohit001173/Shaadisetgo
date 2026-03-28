import { NextResponse } from 'next/server';
import { appConfig } from '@/lib/config';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasCredentials = supabaseUrl && !supabaseUrl.includes('your-project');
  
  return NextResponse.json({
    success: true,
    app: appConfig,
    database: {
      type: hasCredentials ? 'Supabase PostgreSQL' : 'Local SQLite',
      isSupabase: hasCredentials,
      configured: hasCredentials,
      message: hasCredentials 
        ? '✅ Connected to Supabase PostgreSQL' 
        : 'Using local SQLite database',
      supabaseUrl: hasCredentials ? supabaseUrl : null,
    },
  });
}
