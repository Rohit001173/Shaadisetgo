import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types
export interface Vendor {
  id: string;
  name: string;
  owner_name?: string;
  category: string;
  city: string;
  area?: string;
  pincode?: string;
  price_start: number;
  price_label?: string;
  price_model?: string;
  advance_percentage?: number;
  max_guests?: string;
  extra_hour_charge?: string;
  distance_policy?: string;
  rating: number;
  reviews_count: number;
  phone_number?: string;
  description?: string;
  services?: string[];
  view_count?: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images?: VendorImage[];
}

export interface VendorImage {
  id: string;
  vendor_id: string;
  image_url: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_id: string;
  vendor_id: string;
  vendor_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  event_date: string;
  city: string;
  function_type: string;
  guests?: string;
  timing?: string;
  special_request?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Helper functions
export async function getVendors(filters?: {
  category?: string;
  city?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}) {
  let query = supabaseAdmin
    .from('vendors')
    .select('*, images:vendor_images(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false });

  if (filters?.category) {
    query = query.ilike('category', filters.category);
  }
  if (filters?.city) {
    query = query.ilike('city', filters.city);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
  }
  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Vendor[];
}

export async function getVendorById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*, images:vendor_images(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Vendor;
}

export async function createVendor(vendor: Partial<Vendor>, images?: string[]) {
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .insert([vendor])
    .select()
    .single();
  
  if (error) throw error;
  
  // Add images if provided
  if (data && images && images.length > 0) {
    const imageRecords = images.map((url, index) => ({
      vendor_id: data.id,
      image_url: url,
      is_primary: index === 0,
      order: index,
    }));
    
    await supabaseAdmin.from('vendor_images').insert(imageRecords);
  }
  
  return data as Vendor;
}

export async function updateVendor(id: string, vendor: Partial<Vendor>) {
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .update({ ...vendor, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Vendor;
}

export async function deleteVendor(id: string) {
  const { error } = await supabaseAdmin
    .from('vendors')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Booking functions
function generateBookingId(): string {
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SSG-${dateStr}-${random}`;
}

export async function createBooking(booking: Partial<Booking>) {
  const bookingId = generateBookingId();
  
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert([{ ...booking, booking_id: bookingId }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Booking;
}

export async function getBookings(filters?: { status?: string; phone?: string }) {
  let query = supabaseAdmin
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.phone) {
    query = query.eq('customer_phone', filters.phone);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Booking[];
}

export async function updateBookingStatus(id: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Booking;
}

// Stats
export async function getStats() {
  const [vendorsResult, bookingsResult, pendingResult, confirmedResult] = await Promise.all([
    supabaseAdmin.from('vendors').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
  ]);

  return {
    totalVendors: vendorsResult.count || 0,
    totalBookings: bookingsResult.count || 0,
    pendingBookings: pendingResult.count || 0,
    confirmedBookings: confirmedResult.count || 0,
  };
}

// Bucket name - must match exactly in Supabase Storage
const BUCKET_NAME = 'Vendor_image';

// Image Upload to Supabase Storage
export async function uploadVendorImage(file: File, vendorId?: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${vendorId || 'temp'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Upload multiple images
export async function uploadVendorImages(files: File[], vendorId?: string): Promise<string[]> {
  const uploadPromises = files.map(file => uploadVendorImage(file, vendorId));
  return Promise.all(uploadPromises);
}

// Delete image from storage
export async function deleteVendorImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/Vendor_image\/(.+)$/);
    if (!pathMatch) return false;
    
    const filePath = pathMatch[1];
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    return !error;
  } catch (error) {
    console.error('Delete image error:', error);
    return false;
  }
}
