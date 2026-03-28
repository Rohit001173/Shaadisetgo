import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Sample vendor images
const sampleImages = {
  dj: [
    'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  ],
  catering: [
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  ],
  photography: [
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
  ],
  makeup: [
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
  ],
  tent: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
  ],
};

const sampleVendors = [
  // DJ
  {
    name: 'DJ Ravi Sound',
    owner_name: 'Ravi Kumar',
    category: 'DJ',
    city: 'Patna',
    area: 'Boring Road',
    pincode: '800001',
    price_start: 25000,
    price_label: 'Starting from ₹25,000',
    price_model: 'per event',
    advance_percentage: 30,
    max_guests: '500+',
    extra_hour_charge: '₹5,000/hr',
    distance_policy: 'Free within 20km',
    phone_number: '9876543210',
    description: 'DJ Ravi Sound - 10+ years experience in wedding entertainment. Premium sound system, LED lighting.',
    rating: 4.8,
    reviews_count: 156,
    is_verified: true,
    is_featured: true,
  },
  {
    name: 'DJ Beats Bihar',
    owner_name: 'Amit Singh',
    category: 'DJ',
    city: 'Patna',
    area: 'Kankarbagh',
    pincode: '800020',
    price_start: 20000,
    price_label: 'Starting from ₹20,000',
    price_model: 'per event',
    advance_percentage: 25,
    max_guests: '400+',
    phone_number: '9876543211',
    description: 'Professional DJ services for weddings and parties.',
    rating: 4.6,
    reviews_count: 98,
    is_verified: true,
    is_featured: false,
  },
  {
    name: 'DJ Sound Factory',
    owner_name: 'Vikash Yadav',
    category: 'DJ',
    city: 'Varanasi',
    area: 'Cantonment',
    price_start: 30000,
    price_label: 'Starting from ₹30,000',
    phone_number: '9876543212',
    description: 'Premium DJ services with state-of-the-art equipment.',
    rating: 4.9,
    reviews_count: 203,
    is_verified: true,
    is_featured: true,
  },
  // Catering
  {
    name: 'Royal Caterers',
    owner_name: 'Suresh Prasad',
    category: 'Catering',
    city: 'Patna',
    area: 'Gardanibagh',
    price_start: 500,
    price_label: '₹500 per plate',
    price_model: 'per plate',
    advance_percentage: 50,
    max_guests: '2000+',
    phone_number: '9876543220',
    description: 'Royal Caterers - 25+ years experience. Specialized in North Indian and Mughlai cuisine.',
    rating: 4.7,
    reviews_count: 312,
    is_verified: true,
    is_featured: true,
  },
  {
    name: 'Bihari Bhojan',
    owner_name: 'Rajan Kumar',
    category: 'Catering',
    city: 'Gaya',
    area: 'Main Road',
    price_start: 400,
    price_label: '₹400 per plate',
    price_model: 'per plate',
    phone_number: '9876543221',
    description: 'Authentic Bihari cuisine with traditional flavors.',
    rating: 4.5,
    reviews_count: 89,
    is_verified: true,
    is_featured: false,
  },
  {
    name: 'Chappan Bhog Caterers',
    owner_name: 'Mahesh Gupta',
    category: 'Catering',
    city: 'Muzaffarpur',
    area: 'Club Road',
    price_start: 450,
    price_label: '₹450 per plate',
    phone_number: '9876543222',
    description: 'Premium catering with multi-cuisine options.',
    rating: 4.6,
    reviews_count: 145,
    is_verified: true,
    is_featured: false,
  },
  // Photography
  {
    name: 'Shubh Wedding Films',
    owner_name: 'Ankit Sharma',
    category: 'Photography',
    city: 'Patna',
    area: 'Frazer Road',
    price_start: 50000,
    price_label: 'Starting from ₹50,000',
    price_model: 'per event',
    phone_number: '9876543230',
    description: 'Award-winning wedding photography and cinematography.',
    rating: 4.9,
    reviews_count: 267,
    is_verified: true,
    is_featured: true,
  },
  {
    name: 'Pixel Perfect Studio',
    owner_name: 'Deepak Kumar',
    category: 'Photography',
    city: 'Lucknow',
    area: 'Hazratganj',
    price_start: 40000,
    price_label: 'Starting from ₹40,000',
    phone_number: '9876543231',
    description: 'Professional wedding photography with modern techniques.',
    rating: 4.7,
    reviews_count: 189,
    is_verified: true,
    is_featured: false,
  },
  // Makeup
  {
    name: 'Glamour Studio',
    owner_name: 'Priya Kumari',
    category: 'Makeup',
    city: 'Patna',
    area: 'Boring Road',
    price_start: 15000,
    price_label: 'Starting from ₹15,000',
    phone_number: '9876543240',
    description: 'Bridal makeup specialist with international certifications.',
    rating: 4.8,
    reviews_count: 234,
    is_verified: true,
    is_featured: true,
  },
  {
    name: 'Beauty Brides',
    owner_name: 'Neha Singh',
    category: 'Makeup',
    city: 'Varanasi',
    area: 'Sigra',
    price_start: 12000,
    price_label: 'Starting from ₹12,000',
    phone_number: '9876543241',
    description: 'Professional bridal makeup artist.',
    rating: 4.6,
    reviews_count: 156,
    is_verified: true,
    is_featured: false,
  },
  // Tent & Decor
  {
    name: 'Shree Ji Decorators',
    owner_name: 'Rajesh Kumar',
    category: 'Tent',
    city: 'Patna',
    area: 'Patna City',
    price_start: 100000,
    price_label: 'Starting from ₹1,00,000',
    phone_number: '9876543250',
    description: 'Premium wedding decoration and tent house.',
    rating: 4.7,
    reviews_count: 178,
    is_verified: true,
    is_featured: true,
  },
  {
    name: 'Royal Tent House',
    owner_name: 'Sunil Singh',
    category: 'Tent',
    city: 'Bhagalpur',
    area: 'Tilkamanjhi',
    price_start: 80000,
    price_label: 'Starting from ₹80,000',
    phone_number: '9876543251',
    description: 'Complete wedding decoration services.',
    rating: 4.5,
    reviews_count: 98,
    is_verified: true,
    is_featured: false,
  },
  // Mehndi
  {
    name: 'Heena Art Studio',
    owner_name: 'Fatima Begum',
    category: 'Mehndi',
    city: 'Patna',
    area: 'Ashok Nagar',
    price_start: 5000,
    price_label: 'Starting from ₹5,000',
    phone_number: '9876543260',
    description: 'Expert mehndi artist with 15+ years experience.',
    rating: 4.9,
    reviews_count: 345,
    is_verified: true,
    is_featured: true,
  },
  // Anchor
  {
    name: 'MC Rohit Events',
    owner_name: 'Rohit Ranjan',
    category: 'Anchor',
    city: 'Patna',
    area: 'Kankerbagh',
    price_start: 20000,
    price_label: 'Starting from ₹20,000',
    phone_number: '9876543270',
    description: 'Professional wedding anchor and event host.',
    rating: 4.8,
    reviews_count: 156,
    is_verified: true,
    is_featured: false,
  },
];

export async function POST(request: NextRequest) {
  try {
    let createdCount = 0;
    const errors: string[] = [];

    for (const vendorData of sampleVendors) {
      // Check if vendor exists
      const { data: existing } = await supabase
        .from('vendors')
        .select('id')
        .eq('name', vendorData.name)
        .maybeSingle();

      if (existing) continue;

      // Create vendor
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single();

      if (vendorError) {
        errors.push(`Failed to create ${vendorData.name}: ${vendorError.message}`);
        continue;
      }

      if (vendor) {
        // Add images
        const category = vendor.category.toLowerCase() as keyof typeof sampleImages;
        const images = sampleImages[category] || sampleImages.catering;
        
        const imageRecords = images.map((url, index) => ({
          vendor_id: vendor.id,
          image_url: url,
          is_primary: index === 0,
          order: index,
        }));
        
        await supabase.from('vendor_images').insert(imageRecords);
        createdCount++;
      }
    }

    // Get total count
    const { count: totalVendors } = await supabase
      .from('vendors')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: `Seed completed. Created ${createdCount} new vendors.`,
      data: {
        totalVendors,
        createdCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { count: vendors } = await supabase
      .from('vendors')
      .select('id', { count: 'exact', head: true });
    
    const { count: bookings } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      data: {
        vendors: vendors || 0,
        bookings: bookings || 0,
        message: vendors === 0 ? 'Database is empty. POST to /api/seed to populate sample data.' : 'Database has data.',
      },
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check database' },
      { status: 500 }
    );
  }
}
