import { createClient } from '@supabase/supabase-js';

// Supabase configuration - configured with env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client with service role for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client-side Supabase client
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && !url.includes('your-project') && !key.includes('your-');
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  VENDOR_IMAGES: 'vendor-images',
  USER_AVATARS: 'user-avatars',
} as const;

// Upload image to Supabase storage
export async function uploadVendorImage(file: File | Blob, vendorId: string): Promise<string | null> {
  try {
    const fileName = `${vendorId}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.VENDOR_IMAGES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.VENDOR_IMAGES)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Delete image from Supabase storage
export async function deleteVendorImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(p => p === STORAGE_BUCKETS.VENDOR_IMAGES);
    const path = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.VENDOR_IMAGES)
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}
