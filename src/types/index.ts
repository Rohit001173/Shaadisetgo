// ShaadiSetGo Types

export interface Vendor {
  id: string;
  name: string;
  ownerName?: string | null;
  category: string;
  city: string;
  area?: string | null;
  pincode?: string | null;
  priceStart: number;
  priceLabel?: string | null;
  priceModel?: string | null;
  advancePercentage?: number | null;
  maxGuests?: string | null;
  extraHourCharge?: string | null;
  distancePolicy?: string | null;
  rating: number;
  reviewsCount: number;
  phoneNumber?: string | null;
  description?: string | null;
  services?: string[] | null;
  viewCount?: number | null;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  images?: VendorImage[];
}

export interface VendorImage {
  id: string;
  vendorId: string;
  imageUrl: string;
  isPrimary: boolean;
  order: number;
  createdAt?: Date | string;
}

export interface Booking {
  id: string;
  bookingId: string;
  vendorId: string;
  vendorName: string;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  eventDate: string;
  city: string;
  functionType: string;
  guests?: string | null;
  timing?: string | null;
  specialRequest?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  vendorId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: 'customer' | 'vendor' | 'admin';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  order: number;
  isActive: boolean;
}

export interface VendorWithImages extends Vendor {
  images: VendorImage[];
}

export interface BookingWithVendor extends Booking {
  vendor?: Vendor;
}

// Dashboard Stats
export interface DashboardStats {
  totalVendors: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter Types
export interface VendorFilters {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  verified?: boolean;
  featured?: boolean;
}

// Form Types
export interface BookingFormData {
  vendorId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventDate: string;
  city: string;
  functionType: string;
  guests?: string;
  timing?: string;
  specialRequest?: string;
}

export interface VendorFormData {
  name: string;
  ownerName?: string;
  category: string;
  city: string;
  area?: string;
  pincode?: string;
  priceStart: number;
  priceLabel?: string;
  priceModel?: string;
  advancePercentage?: number;
  maxGuests?: string;
  extraHourCharge?: string;
  distancePolicy?: string;
  phoneNumber?: string;
  description?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  images?: string[];
}
