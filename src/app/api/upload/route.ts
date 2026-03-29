import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, STORAGE_BUCKET, isSupabaseConfigured } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  console.log('[Upload API] Starting upload...');
  console.log('[Upload API] isSupabaseConfigured:', isSupabaseConfigured());
  console.log('[Upload API] supabaseAdmin:', supabaseAdmin ? 'READY' : 'NULL');

  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('[Upload API] Supabase not configured - supabaseAdmin is null');
      return NextResponse.json(
        { success: false, error: 'Image upload is not configured. Check environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    // Support both 'file' (single) and 'files' (multiple)
    let files: File[] = [];

    const singleFile = formData.get('file') as File | null;
    if (singleFile && singleFile.size > 0) {
      files = [singleFile];
      console.log('[Upload API] Single file received:', singleFile.name);
    }

    const multipleFiles = formData.getAll('files') as File[];
    if (multipleFiles && multipleFiles.length > 0 && multipleFiles[0].size > 0) {
      files = multipleFiles;
      console.log('[Upload API] Multiple files received:', multipleFiles.length);
    }

    if (files.length === 0) {
      console.error('[Upload API] No files provided');
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      console.error('[Upload API] Invalid file types:', invalidFiles.map(f => f.type));
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file sizes (max 5MB each for storage)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      console.error('[Upload API] Files too large');
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB per file.' },
        { status: 400 }
      );
    }

    // Upload files to Supabase Storage
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `services/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('[Upload API] Uploading to bucket:', STORAGE_BUCKET, 'file:', fileName);

      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, uint8Array, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        console.error('[Upload API] Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      console.log('[Upload API] File uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);

    console.log('[Upload API] All uploads complete:', imageUrls.length, 'files');

    // Return single URL if one file, array if multiple
    if (imageUrls.length === 1) {
      return NextResponse.json({
        success: true,
        url: imageUrls[0], // For single file uploads
        data: imageUrls,   // Also include data array for compatibility
        message: 'Image uploaded successfully',
      });
    }

    return NextResponse.json({
      success: true,
      data: imageUrls,
      message: `${imageUrls.length} image(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload images. Please check if the bucket exists and is public.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
