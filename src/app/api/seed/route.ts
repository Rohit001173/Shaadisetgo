import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-client';

// Sample vendors data
const sampleVendors = [
  {
    id: 'vendor_001',
    name: 'Royal DJ Sound',
    owner_name: 'Rahul Kumar',
    category: 'DJ',
    city: 'Patna',
    area: 'Boring Road',
    phone_number: '9876543210',
    email: 'royaldj@example.com',
    description: 'Premium DJ services for weddings and events. Best sound quality and lighting.',
    price_start: 25000,
    price_label: 'Starting from ₹25,000',
    services: ['DJ', 'Sound System', 'Lighting', 'MC'],
    rating: 4.8,
    reviews_count: 45,
    is_verified: true,
    is_featured: true,
    vendor_status: 'approved',
  },
  {
    id: 'vendor_002',
    name: 'Sharma Photography',
    owner_name: 'Vikram Sharma',
    category: 'Photography',
    city: 'Patna',
    area: 'Kankarbagh',
    phone_number: '9876543211',
    email: 'sharmaphoto@example.com',
    description: 'Candid and traditional wedding photography with 10+ years experience.',
    price_start: 35000,
    price_label: 'Starting from ₹35,000',
    services: ['Photography', 'Videography', 'Cinematography', 'Drone'],
    rating: 4.9,
    reviews_count: 78,
    is_verified: true,
    is_featured: true,
    vendor_status: 'approved',
  },
  {
    id: 'vendor_003',
    name: 'Bihari Caterers',
    owner_name: 'Amit Singh',
    category: 'Catering',
    city: 'Gaya',
    area: 'Road No 5',
    phone_number: '9876543212',
    email: 'biharicaterers@example.com',
    description: 'Authentic Bihari cuisine with modern presentation. Veg and Non-veg available.',
    price_start: 400,
    price_label: '₹400 per plate',
    services: ['Veg Menu', 'Non-Veg Menu', 'Live Counter', 'Dessert'],
    rating: 4.7,
    reviews_count: 56,
    is_verified: true,
    is_featured: false,
    vendor_status: 'approved',
  },
  {
    id: 'vendor_004',
    name: 'Pandit Ji Services',
    owner_name: 'Pt. Ramesh Mishra',
    category: 'Pandit Ji',
    city: 'Patna',
    area: 'Fraser Road',
    phone_number: '9876543213',
    email: 'panditji@example.com',
    description: 'Expert in all Hindu rituals and ceremonies. Wedding specialist.',
    price_start: 15000,
    price_label: 'Starting from ₹15,000',
    services: ['Wedding Ceremony', 'Havan', 'Puja', 'Kanyadaan'],
    rating: 4.9,
    reviews_count: 92,
    is_verified: true,
    is_featured: true,
    vendor_status: 'approved',
  },
  {
    id: 'vendor_005',
    name: 'Glam Beauty Studio',
    owner_name: 'Priya Gupta',
    category: 'Makeup',
    city: 'Gorakhpur',
    area: 'Civil Lines',
    phone_number: '9876543214',
    email: 'glambeauty@example.com',
    description: 'Bridal makeup specialist using premium products. HD and Airbrush available.',
    price_start: 20000,
    price_label: 'Starting from ₹20,000',
    services: ['Bridal Makeup', 'Party Makeup', 'HD Makeup', 'Hair Styling'],
    rating: 4.6,
    reviews_count: 34,
    is_verified: true,
    is_featured: false,
    vendor_status: 'approved',
  },
  {
    id: 'vendor_006',
    name: 'Mehndi by Arti',
    owner_name: 'Arti Devi',
    category: 'Mehndi',
    city: 'Muzaffarpur',
    area: 'Club Road',
    phone_number: '9876543215',
    email: 'mehndiarti@example.com',
    description: 'Traditional and Arabic mehndi designs. Bridal specialist.',
    price_start: 5000,
    price_label: 'Starting from ₹5,000',
    services: ['Bridal Mehndi', 'Party Mehndi', 'Arabic Design'],
    rating: 4.8,
    reviews_count: 67,
    is_verified: true,
    is_featured: false,
    vendor_status: 'approved',
  },
];

// Sample services data
const sampleServices = [
  {
    id: 'service_001',
    service_name: 'Wedding DJ Package',
    category: 'DJ',
    city: 'Patna',
    price: 25000,
    description: 'Complete DJ setup with sound, lights, and MC for your wedding.',
  },
  {
    id: 'service_002',
    service_name: 'Candid Photography',
    category: 'Photography',
    city: 'Patna',
    price: 35000,
    description: 'Professional candid photography for wedding ceremonies.',
  },
  {
    id: 'service_003',
    service_name: 'Veg Catering',
    category: 'Catering',
    city: 'Gaya',
    price: 400,
    description: 'Delicious vegetarian menu with variety of dishes.',
  },
  {
    id: 'service_004',
    service_name: 'Wedding Puja',
    category: 'Pandit Ji',
    city: 'Patna',
    price: 15000,
    description: 'Complete wedding ceremony with all rituals.',
  },
  {
    id: 'service_005',
    service_name: 'Bridal Makeup',
    category: 'Makeup',
    city: 'Gorakhpur',
    price: 20000,
    description: 'Premium bridal makeup with HD finish.',
  },
  {
    id: 'service_006',
    service_name: 'Bridal Mehndi',
    category: 'Mehndi',
    city: 'Muzaffarpur',
    price: 5000,
    description: 'Full bridal mehndi with intricate designs.',
  },
];

// Categories data
const categories = [
  { id: 'cat_001', name: 'DJ & Music', slug: 'dj', icon: '🎧', order: 1 },
  { id: 'cat_002', name: 'Photography & Videography', slug: 'photography', icon: '📸', order: 2 },
  { id: 'cat_003', name: 'Catering', slug: 'catering', icon: '🍽️', order: 3 },
  { id: 'cat_004', name: 'Pandit Ji', slug: 'pandit-ji', icon: '🙏', order: 4 },
  { id: 'cat_005', name: 'Makeup & Beauty', slug: 'makeup', icon: '💄', order: 5 },
  { id: 'cat_006', name: 'Mehndi', slug: 'mehndi', icon: '🌿', order: 6 },
  { id: 'cat_007', name: 'Tent & Decoration', slug: 'tent-decoration', icon: '🎪', order: 7 },
  { id: 'cat_008', name: 'Band Baja', slug: 'band-baja', icon: '🎺', order: 8 },
  { id: 'cat_009', name: 'Hotel & Banquet', slug: 'hotel-banquet', icon: '🏨', order: 9 },
  { id: 'cat_010', name: 'Honeymoon Package', slug: 'honeymoon', icon: '✈️', order: 10 },
];

/**
 * GET /api/seed
 * Check current data counts
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/seed - Checking data counts...');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured',
      data: { vendors: 0, services: 0, categories: 0 },
    });
  }

  try {
    const [vendorsResult, servicesResult, categoriesResult] = await Promise.all([
      supabaseAdmin!.from('vendors').select('id', { count: 'exact', head: true }),
      supabaseAdmin!.from('services').select('id', { count: 'exact', head: true }),
      supabaseAdmin!.from('categories').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        vendors: vendorsResult.count || 0,
        services: servicesResult.count || 0,
        categories: categoriesResult.count || 0,
      },
    });
  } catch (error) {
    console.error('[API] Seed check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check data',
      data: { vendors: 0, services: 0, categories: 0 },
    });
  }
}

/**
 * POST /api/seed
 * Seed sample data into Supabase
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/seed - Seeding data...');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured',
    }, { status: 500 });
  }

  const results = {
    vendors: { inserted: 0, skipped: 0 },
    services: { inserted: 0, skipped: 0 },
    categories: { inserted: 0, skipped: 0 },
  };

  try {
    // Seed vendors
    console.log('[API] Seeding vendors...');
    for (const vendor of sampleVendors) {
      const { data: existing } = await supabaseAdmin!
        .from('vendors')
        .select('id')
        .eq('id', vendor.id)
        .single();

      if (!existing) {
        const { error } = await supabaseAdmin!
          .from('vendors')
          .insert([{
            ...vendor,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
        
        if (error) {
          console.error('[API] Vendor insert error:', error);
          results.vendors.skipped++;
        } else {
          results.vendors.inserted++;
        }
      } else {
        results.vendors.skipped++;
      }
    }

    // Seed services
    console.log('[API] Seeding services...');
    for (const service of sampleServices) {
      const { data: existing } = await supabaseAdmin!
        .from('services')
        .select('id')
        .eq('id', service.id)
        .single();

      if (!existing) {
        const { error } = await supabaseAdmin!
          .from('services')
          .insert([{
            ...service,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
        
        if (error) {
          console.error('[API] Service insert error:', error);
          results.services.skipped++;
        } else {
          results.services.inserted++;
        }
      } else {
        results.services.skipped++;
      }
    }

    // Seed categories
    console.log('[API] Seeding categories...');
    for (const category of categories) {
      const { data: existing } = await supabaseAdmin!
        .from('categories')
        .select('id')
        .eq('id', category.id)
        .single();

      if (!existing) {
        const { error } = await supabaseAdmin!
          .from('categories')
          .insert([{
            ...category,
            is_active: true,
            created_at: new Date().toISOString(),
          }]);
        
        if (error) {
          console.error('[API] Category insert error:', error);
          results.categories.skipped++;
        } else {
          results.categories.inserted++;
        }
      } else {
        results.categories.skipped++;
      }
    }

    console.log('[API] Seed complete:', results);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      results,
    });
  } catch (error) {
    console.error('[API] Seed error:', error);
    return NextResponse.json({
      success: false,
      error: 'Seeding failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}
