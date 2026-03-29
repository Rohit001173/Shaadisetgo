import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Storage bucket name - must match exactly in Supabase
const STORAGE_BUCKET = 'Vendor_image';

// Get environment variables
function getConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return {
    url: supabaseUrl,
    key: supabaseServiceKey || supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey,
  };
}

// Create Supabase client
function getSupabaseClient(): { client: SupabaseClient | null; error: string | null } {
  const { url, key } = getConfig();
  
  if (!url) {
    return { client: null, error: 'NEXT_PUBLIC_SUPABASE_URL is not set' };
  }
  
  if (!key) {
    return { client: null, error: 'Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set' };
  }
  
  try {
    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return { client, error: null };
  } catch (err) {
    return { client: null, error: `Failed to create client: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

// Ensure bucket exists
async function ensureBucket(client: SupabaseClient): Promise<{ success: boolean; error?: string }> {
  try {
    // List buckets
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    
    if (listError) {
      // If it's a permissions error, try to use the bucket anyway
      if (listError.message?.includes('permission') || listError.message?.includes('not allowed')) {
        console.log('[Upload] Cannot list buckets (permission denied), assuming bucket exists');
        return { success: true };
      }
      return { success: false, error: `Failed to list buckets: ${listError.message}` };
    }

    const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      console.log('[Upload] Bucket not found, attempting to create:', STORAGE_BUCKET);
      const { error: createError } = await client.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        // If create fails, the bucket might already exist or we don't have permission
        console.log('[Upload] Could not create bucket:', createError.message);
        // Continue anyway - the bucket might exist
      } else {
        console.log('[Upload] Bucket created successfully');
      }
    } else {
      console.log('[Upload] Bucket exists:', STORAGE_BUCKET);
    }
    
    return { success: true };
  } catch (err) {
    console.error('[Upload] Exception in ensureBucket:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  console.log('[Upload API] Starting upload...');
  
  // Check configuration
  const config = getConfig();
  console.log('[Upload API] Config:', {
    url: config.url ? 'SET' : 'MISSING',
    key: config.key ? 'SET' : 'MISSING',
    hasServiceKey: config.hasServiceKey,
  });
  
  // Get client
  const { client, error: clientError } = getSupabaseClient();
  
  if (!client) {
    console.error('[Upload API] Client error:', clientError);
    return NextResponse.json(
      { 
        success: false, 
        error: `Upload failed: ${clientError}. Please check your Supabase configuration.`,
        details: 'Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment.'
      },
      { status: 500 }
    );
  }

  try {
    // Ensure bucket exists
    const bucketResult = await ensureBucket(client);
    if (!bucketResult.success) {
      console.error('[Upload API] Bucket error:', bucketResult.error);
      // Continue anyway - the upload might still work
    }

    const formData = await request.formData();

    // Support both 'file' (single) and 'files' (multiple)
    let files: File[] = [];

    const singleFile = formData.get('file') as File | null;
    if (singleFile && singleFile.size > 0) {
      files = [singleFile];
      console.log('[Upload API] Single file:', singleFile.name, singleFile.size, 'bytes');
    }

    const multipleFiles = formData.getAll('files') as File[];
    if (multipleFiles && multipleFiles.length > 0 && multipleFiles[0].size > 0) {
      files = multipleFiles;
      console.log('[Upload API] Multiple files:', multipleFiles.length);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB per file.' },
        { status: 400 }
      );
    }

    // Upload files
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `services/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('[Upload API] Uploading:', fileName);

      const { data, error } = await client.storage
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
      const { data: urlData } = client.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      console.log('[Upload API] Uploaded:', urlData.publicUrl);
      return urlData.publicUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);

    console.log('[Upload API] Success:', imageUrls.length, 'files');

    // Return single URL if one file, array if multiple
    if (imageUrls.length === 1) {
      return NextResponse.json({
        success: true,
        url: imageUrls[0],
        data: imageUrls,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Upload failed: ${errorMessage}` },
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
