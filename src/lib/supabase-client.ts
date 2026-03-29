/**
 * ShaadiSetGo - Supabase Database Client
 * 
 * This module provides a centralized Supabase client and types for:
 * - vendors table
 * - services table  
 * - categories table
 * - vendor_images table
 * - bookings table
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service key if available, otherwise fall back to anon key
const effectiveKey = supabaseServiceKey || supabaseAnonKey;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('Optional: SUPABASE_SERVICE_ROLE_KEY (for admin operations)');
}

// Log configuration status (helpful for debugging)
console.log('[Supabase] Configuration status:', {
  url: supabaseUrl ? '✅ Set' : '❌ Missing',
  anonKey: supabaseAnonKey ? '✅ Set' : '❌ Missing',
  serviceKey: supabaseServiceKey ? '✅ Set' : '⚠️ Using anon key',
});

// ============================================
// TYPES
// ============================================

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
}

export interface Service {
  id: string;
  vendor_id?: string;
  service_name: string;
  category: string;
  city?: string;
  price?: number;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  order: number;
  is_active: boolean;
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

// ============================================
// SUPABASE CLIENTS
// ============================================

// Admin client with service role key (server-side only)
// Falls back to anon key if service key is not available
export const supabaseAdmin = supabaseUrl && effectiveKey
  ? createClient(supabaseUrl, effectiveKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Public client for client-side operations
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================
// STORAGE BUCKET
// ============================================
export const STORAGE_BUCKET = 'Vendor_image';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseAdmin);
}

/**
 * Log operation for debugging
 */
function logOperation(operation: string, table: string, data?: any) {
  console.log(`[Supabase] ${operation} on ${table}`, data ? JSON.stringify(data).slice(0, 200) : '');
}

/**
 * Handle and log errors
 */
function handleError(operation: string, error: any): never {
  console.error(`[Supabase Error] ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`);
}

// ============================================
// VENDORS API
// ============================================

/**
 * Get all vendors with optional filters
 */
export async function getVendors(filters?: {
  category?: string;
  city?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Vendor[]> {
  if (!supabaseAdmin) {
    console.error('[Supabase] Admin client not initialized');
    return [];
  }

  try {
    logOperation('GET', 'vendors', filters);

    let query = supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false });

    // Category filter
    if (filters?.category) {
      query = query.ilike('category', `%${filters.category}%`);
    }

    // City filter
    if (filters?.city) {
      query = query.or(`city.ilike.%${filters.city}%,area.ilike.%${filters.city}%`);
    }

    // Search filter - searches in name, category, city, area
    if (filters?.search) {
      const searchTerm = filters.search;
      query = query.or(
        `name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,area.ilike.%${searchTerm}%`
      );
    }

    // Featured filter
    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }

    // Limit
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Supabase] Error fetching vendors:', error);
      return [];
    }

    console.log(`[Supabase] Fetched ${data?.length || 0} vendors`);
    return (data as Vendor[]) || [];
  } catch (error) {
    console.error('[Supabase] Exception in getVendors:', error);
    return [];
  }
}

/**
 * Get vendor by ID
 */
export async function getVendorById(id: string): Promise<Vendor | null> {
  if (!supabaseAdmin) return null;

  try {
    logOperation('GET BY ID', 'vendors', { id });

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Supabase] Error fetching vendor:', error);
      return null;
    }

    return data as Vendor;
  } catch (error) {
    console.error('[Supabase] Exception in getVendorById:', error);
    return null;
  }
}

/**
 * Create a new vendor
 */
export async function createVendor(vendorData: Partial<Vendor>): Promise<Vendor | null> {
  if (!supabaseAdmin) return null;

  try {
    logOperation('INSERT', 'vendors', vendorData);

    const newVendor = {
      ...vendorData,
      id: `vendor_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      rating: vendorData.rating || 0,
      reviews_count: vendorData.reviews_count || 0,
      is_verified: vendorData.is_verified || false,
      is_featured: vendorData.is_featured || false,
      is_active: vendorData.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .insert([newVendor])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating vendor:', error);
      return null;
    }

    console.log('[Supabase] Vendor created successfully:', data?.id);
    return data as Vendor;
  } catch (error) {
    console.error('[Supabase] Exception in createVendor:', error);
    return null;
  }
}

/**
 * Update a vendor
 */
export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
  if (!supabaseAdmin) return null;

  try {
    logOperation('UPDATE', 'vendors', { id, updates });

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error updating vendor:', error);
      return null;
    }

    return data as Vendor;
  } catch (error) {
    console.error('[Supabase] Exception in updateVendor:', error);
    return null;
  }
}

/**
 * Delete a vendor (soft delete)
 */
export async function deleteVendor(id: string): Promise<boolean> {
  if (!supabaseAdmin) return false;

  try {
    logOperation('DELETE', 'vendors', { id });

    const { error } = await supabaseAdmin
      .from('vendors')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting vendor:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Supabase] Exception in deleteVendor:', error);
    return false;
  }
}

// ============================================
// SERVICES API
// ============================================

/**
 * Get all services with optional filters
 */
export async function getServices(filters?: {
  category?: string;
  city?: string;
  search?: string;
  vendor_id?: string;
  limit?: number;
}): Promise<Service[]> {
  if (!supabaseAdmin) {
    console.error('[Supabase] Admin client not initialized');
    return [];
  }

  try {
    logOperation('GET', 'services', filters);

    let query = supabaseAdmin
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    // Category filter
    if (filters?.category) {
      query = query.ilike('category', `%${filters.category}%`);
    }

    // City filter
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    // Search filter - searches in service_name, category
    if (filters?.search) {
      const searchTerm = filters.search;
      query = query.or(
        `service_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
      );
    }

    // Vendor filter
    if (filters?.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id);
    }

    // Limit
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Supabase] Error fetching services:', error);
      return [];
    }

    console.log(`[Supabase] Fetched ${data?.length || 0} services`);
    return (data as Service[]) || [];
  } catch (error) {
    console.error('[Supabase] Exception in getServices:', error);
    return [];
  }
}

/**
 * Create a new service
 */
export async function createService(serviceData: Partial<Service>): Promise<Service | null> {
  if (!supabaseAdmin) return null;

  try {
    logOperation('INSERT', 'services', serviceData);

    const newService = {
      ...serviceData,
      id: `service_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert([newService])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating service:', error);
      return null;
    }

    console.log('[Supabase] Service created successfully:', data?.id);
    return data as Service;
  } catch (error) {
    console.error('[Supabase] Exception in createService:', error);
    return null;
  }
}

// ============================================
// CATEGORIES API
// ============================================

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  if (!supabaseAdmin) return [];

  try {
    logOperation('GET', 'categories');

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('[Supabase] Error fetching categories:', error);
      return [];
    }

    console.log(`[Supabase] Fetched ${data?.length || 0} categories`);
    return (data as Category[]) || [];
  } catch (error) {
    console.error('[Supabase] Exception in getCategories:', error);
    return [];
  }
}

// ============================================
// BOOKINGS API
// ============================================

/**
 * Create a booking
 */
export async function createBooking(bookingData: Partial<Booking>): Promise<Booking | null> {
  if (!supabaseAdmin) return null;

  try {
    const bookingId = `SSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    logOperation('INSERT', 'bookings', bookingData);

    const newBooking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
      booking_id: bookingId,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([newBooking])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating booking:', error);
      return null;
    }

    console.log('[Supabase] Booking created successfully:', data?.booking_id);
    return data as Booking;
  } catch (error) {
    console.error('[Supabase] Exception in createBooking:', error);
    return null;
  }
}

/**
 * Get bookings by phone
 */
export async function getBookingsByPhone(phone: string): Promise<Booking[]> {
  if (!supabaseAdmin) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching bookings:', error);
      return [];
    }

    return (data as Booking[]) || [];
  } catch (error) {
    console.error('[Supabase] Exception in getBookingsByPhone:', error);
    return [];
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(id: string, status: Booking['status']): Promise<boolean> {
  if (!supabaseAdmin) return false;

  try {
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating booking:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Supabase] Exception in updateBookingStatus:', error);
    return false;
  }
}

// ============================================
// IMAGE UPLOAD
// ============================================

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(file: File, folder: string = 'vendors'): Promise<string | null> {
  if (!supabaseAdmin) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, uint8Array, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('[Supabase] Upload error:', error);
      return null;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    console.log('[Supabase] Image uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('[Supabase] Exception in uploadImage:', error);
    return null;
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(files: File[], folder: string = 'vendors'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, folder));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
}

// ============================================
// STATS
// ============================================

/**
 * Get dashboard stats
 */
export async function getStats() {
  if (!supabaseAdmin) {
    return { totalVendors: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0 };
  }

  try {
    const [
      vendorsResult,
      bookingsResult,
      pendingResult,
      confirmedResult,
    ] = await Promise.all([
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
  } catch (error) {
    console.error('[Supabase] Exception in getStats:', error);
    return { totalVendors: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0 };
  }
}

// Default export
export default {
  supabaseAdmin,
  supabaseClient,
  isSupabaseConfigured,
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getServices,
  createService,
  getCategories,
  createBooking,
  getBookingsByPhone,
  updateBookingStatus,
  uploadImage,
  uploadImages,
  getStats,
};
