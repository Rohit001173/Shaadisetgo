import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

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
    ownerName: 'Ravi Kumar',
    category: 'DJ',
    city: 'Patna',
    area: 'Boring Road',
    pincode: '800001',
    priceStart: 25000,
    priceLabel: 'Starting from ₹25,000',
    priceModel: 'per event',
    advancePercentage: 30,
    maxGuests: '500+',
    extraHourCharge: '₹5,000/hr',
    distancePolicy: 'Free within 20km',
    phoneNumber: '9876543210',
    description: 'DJ Ravi Sound - 10+ years experience in wedding entertainment. Premium sound system, LED lighting.',
    rating: 4.8,
    reviewsCount: 156,
    isVerified: true,
    isFeatured: true,
  },
  {
    name: 'DJ Beats Bihar',
    ownerName: 'Amit Singh',
    category: 'DJ',
    city: 'Patna',
    area: 'Kankarbagh',
    pincode: '800020',
    priceStart: 20000,
    priceLabel: 'Starting from ₹20,000',
    priceModel: 'per event',
    advancePercentage: 25,
    maxGuests: '400+',
    phoneNumber: '9876543211',
    description: 'Professional DJ services for weddings and parties.',
    rating: 4.6,
    reviewsCount: 98,
    isVerified: true,
    isFeatured: false,
  },
  {
    name: 'DJ Sound Factory',
    ownerName: 'Vikash Yadav',
    category: 'DJ',
    city: 'Varanasi',
    area: 'Cantonment',
    priceStart: 30000,
    priceLabel: 'Starting from ₹30,000',
    phoneNumber: '9876543212',
    description: 'Premium DJ services with state-of-the-art equipment.',
    rating: 4.9,
    reviewsCount: 203,
    isVerified: true,
    isFeatured: true,
  },
  // Catering
  {
    name: 'Royal Caterers',
    ownerName: 'Suresh Prasad',
    category: 'Catering',
    city: 'Patna',
    area: 'Gardanibagh',
    priceStart: 500,
    priceLabel: '₹500 per plate',
    priceModel: 'per plate',
    advancePercentage: 50,
    maxGuests: '2000+',
    phoneNumber: '9876543220',
    description: 'Royal Caterers - 25+ years experience. Specialized in North Indian and Mughlai cuisine.',
    rating: 4.7,
    reviewsCount: 312,
    isVerified: true,
    isFeatured: true,
  },
  {
    name: 'Bihari Bhojan',
    ownerName: 'Rajan Kumar',
    category: 'Catering',
    city: 'Gaya',
    area: 'Main Road',
    priceStart: 400,
    priceLabel: '₹400 per plate',
    priceModel: 'per plate',
    phoneNumber: '9876543221',
    description: 'Authentic Bihari cuisine with traditional flavors.',
    rating: 4.5,
    reviewsCount: 89,
    isVerified: true,
    isFeatured: false,
  },
  {
    name: 'Chappan Bhog Caterers',
    ownerName: 'Mahesh Gupta',
    category: 'Catering',
    city: 'Muzaffarpur',
    area: 'Club Road',
    priceStart: 450,
    priceLabel: '₹450 per plate',
    phoneNumber: '9876543222',
    description: 'Premium catering with multi-cuisine options.',
    rating: 4.6,
    reviewsCount: 145,
    isVerified: true,
    isFeatured: false,
  },
  // Photography
  {
    name: 'Shubh Wedding Films',
    ownerName: 'Ankit Sharma',
    category: 'Photography',
    city: 'Patna',
    area: 'Frazer Road',
    priceStart: 50000,
    priceLabel: 'Starting from ₹50,000',
    priceModel: 'per event',
    phoneNumber: '9876543230',
    description: 'Award-winning wedding photography and cinematography.',
    rating: 4.9,
    reviewsCount: 267,
    isVerified: true,
    isFeatured: true,
  },
  {
    name: 'Pixel Perfect Studio',
    ownerName: 'Deepak Kumar',
    category: 'Photography',
    city: 'Lucknow',
    area: 'Hazratganj',
    priceStart: 40000,
    priceLabel: 'Starting from ₹40,000',
    phoneNumber: '9876543231',
    description: 'Professional wedding photography with modern techniques.',
    rating: 4.7,
    reviewsCount: 189,
    isVerified: true,
    isFeatured: false,
  },
  // Makeup
  {
    name: 'Glamour Studio',
    ownerName: 'Priya Kumari',
    category: 'Makeup',
    city: 'Patna',
    area: 'Boring Road',
    priceStart: 15000,
    priceLabel: 'Starting from ₹15,000',
    phoneNumber: '9876543240',
    description: 'Bridal makeup specialist with international certifications.',
    rating: 4.8,
    reviewsCount: 234,
    isVerified: true,
    isFeatured: true,
  },
  {
    name: 'Beauty Brides',
    ownerName: 'Neha Singh',
    category: 'Makeup',
    city: 'Varanasi',
    area: 'Sigra',
    priceStart: 12000,
    priceLabel: 'Starting from ₹12,000',
    phoneNumber: '9876543241',
    description: 'Professional bridal makeup artist.',
    rating: 4.6,
    reviewsCount: 156,
    isVerified: true,
    isFeatured: false,
  },
  // Tent & Decor
  {
    name: 'Shree Ji Decorators',
    ownerName: 'Rajesh Kumar',
    category: 'Tent',
    city: 'Patna',
    area: 'Patna City',
    priceStart: 100000,
    priceLabel: 'Starting from ₹1,00,000',
    phoneNumber: '9876543250',
    description: 'Premium wedding decoration and tent house.',
    rating: 4.7,
    reviewsCount: 178,
    isVerified: true,
    isFeatured: true,
  },
  {
    name: 'Royal Tent House',
    ownerName: 'Sunil Singh',
    category: 'Tent',
    city: 'Bhagalpur',
    area: 'Tilkamanjhi',
    priceStart: 80000,
    priceLabel: 'Starting from ₹80,000',
    phoneNumber: '9876543251',
    description: 'Complete wedding decoration services.',
    rating: 4.5,
    reviewsCount: 98,
    isVerified: true,
    isFeatured: false,
  },
  // Mehndi
  {
    name: 'Heena Art Studio',
    ownerName: 'Fatima Begum',
    category: 'Mehndi',
    city: 'Patna',
    area: 'Ashok Nagar',
    priceStart: 5000,
    priceLabel: 'Starting from ₹5,000',
    phoneNumber: '9876543260',
    description: 'Expert mehndi artist with 15+ years experience.',
    rating: 4.9,
    reviewsCount: 345,
    isVerified: true,
    isFeatured: true,
  },
  // Anchor
  {
    name: 'MC Rohit Events',
    ownerName: 'Rohit Ranjan',
    category: 'Anchor',
    city: 'Patna',
    area: 'Kankerbagh',
    priceStart: 20000,
    priceLabel: 'Starting from ₹20,000',
    phoneNumber: '9876543270',
    description: 'Professional wedding anchor and event host.',
    rating: 4.8,
    reviewsCount: 156,
    isVerified: true,
    isFeatured: false,
  },
];

export async function POST(request: NextRequest) {
  try {
    let createdCount = 0;
    const errors: string[] = [];

    for (const vendorData of sampleVendors) {
      // Check if vendor exists
      const existing = await db.vendor.findFirst({
        where: { name: vendorData.name }
      });

      if (existing) continue;

      // Create vendor
      const vendor = await db.vendor.create({
        data: {
          id: nanoid(),
          ...vendorData,
          isActive: true,
        }
      });

      if (vendor) {
        // Add images
        const category = vendor.category.toLowerCase() as keyof typeof sampleImages;
        const images = sampleImages[category] || sampleImages.catering;
        
        const imageRecords = images.map((url, index) => ({
          vendorId: vendor.id,
          imageUrl: url,
          isPrimary: index === 0,
          order: index,
        }));
        
        await db.vendorImage.createMany({ data: imageRecords });
        createdCount++;
      }
    }

    // Get total count
    const totalVendors = await db.vendor.count();

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
    const vendors = await db.vendor.count();
    const bookings = await db.booking.count();
    
    return NextResponse.json({
      success: true,
      data: {
        vendors,
        bookings,
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
