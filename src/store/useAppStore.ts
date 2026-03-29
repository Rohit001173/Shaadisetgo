import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vendor, Booking, Category, VendorFilters } from '@/types';

// Service type for marketplace services
export interface Service {
  id: string;
  service_name: string;
  category: string;
  city: string;
  price?: number;
  description?: string;
  image_url?: string;
  vendor_id?: string;
  created_at?: string;
}

// View types for navigation
export type ViewType = 
  | 'home' 
  | 'vendors' 
  | 'categories' 
  | 'bookings' 
  | 'profile' 
  | 'vendor-detail'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-vendors'
  | 'admin-bookings'
  | 'admin-add-vendor'
  | 'admin-add-service'
  | 'admin-edit-vendor'
  | 'admin-settings'
  // Vendor Dashboard Views
  | 'vendor-login'
  | 'vendor-signup'
  | 'vendor-dashboard'
  | 'vendor-services'
  | 'vendor-add-service'
  | 'vendor-edit-service'
  | 'vendor-bookings'
  | 'vendor-profile';

// Vendor User type
export interface VendorUser {
  id: string;
  email: string;
  phone: string;
  ownerName: string;
  businessName: string;
  city: string;
  category: string;
  description?: string;
  vendorStatus: 'pending' | 'approved' | 'rejected';
}

// Vendor Service type
export interface VendorService {
  id: string;
  vendorId: string;
  serviceName: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Vendor Booking type
export interface VendorBooking {
  id: string;
  bookingId: string;
  vendorId: string;
  serviceId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventDate: string;
  eventTime?: string;
  venue?: string;
  guestCount?: number;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  service?: { serviceName: string; category: string };
}

interface AppState {
  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;

  // Data
  vendors: Vendor[];
  featuredVendors: Vendor[];
  services: Service[];
  selectedService: Service | null;
  bookings: Booking[];
  categories: Category[];
  selectedVendor: Vendor | null;
  
  // Filters
  filters: VendorFilters;
  selectedCategory: string | null;
  selectedCity: string | null;
  
  // Admin
  isAdminAuthenticated: boolean;
  adminToken: string | null;
  
  // Vendor Auth
  isVendorAuthenticated: boolean;
  vendorUser: VendorUser | null;
  vendorServices: VendorService[];
  vendorBookings: VendorBooking[];
  selectedVendorService: VendorService | null;
  
  // UI State
  isLoading: boolean;
  searchQuery: string;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  goBack: () => void;
  setVendors: (vendors: Vendor[]) => void;
  setFeaturedVendors: (vendors: Vendor[]) => void;
  setServices: (services: Service[]) => void;
  setSelectedService: (service: Service | null) => void;
  setBookings: (bookings: Booking[]) => void;
  setCategories: (categories: Category[]) => void;
  setSelectedVendor: (vendor: Vendor | null) => void;
  setFilters: (filters: Partial<VendorFilters>) => void;
  clearFilters: () => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setAdminAuthenticated: (isAuth: boolean, token?: string) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: string) => void;
  
  // Vendor Actions
  setVendorAuthenticated: (isAuth: boolean, user?: VendorUser | null) => void;
  setVendorServices: (services: VendorService[]) => void;
  setVendorBookings: (bookings: VendorBooking[]) => void;
  setSelectedVendorService: (service: VendorService | null) => void;
  addVendorService: (service: VendorService) => void;
  updateVendorService: (service: VendorService) => void;
  removeVendorService: (serviceId: string) => void;
  vendorLogout: () => void;
}

const initialFilters: VendorFilters = {
  category: undefined,
  city: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  search: undefined,
  verified: undefined,
  featured: undefined,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentView: 'home',
      previousView: null,
      vendors: [],
      featuredVendors: [],
      services: [],
      selectedService: null,
      bookings: [],
      categories: [],
      selectedVendor: null,
      filters: initialFilters,
      selectedCategory: null,
      selectedCity: null,
      isAdminAuthenticated: false,
      adminToken: null,
      isVendorAuthenticated: false,
      vendorUser: null,
      vendorServices: [],
      vendorBookings: [],
      selectedVendorService: null,
      isLoading: false,
      searchQuery: '',
      
      // Actions
      setCurrentView: (view) => set((state) => ({ 
        previousView: state.currentView,
        currentView: view 
      })),
      
      goBack: () => set((state) => ({ 
        currentView: state.previousView || 'home',
        previousView: null 
      })),
      
      setVendors: (vendors) => set({ vendors }),

      setFeaturedVendors: (featuredVendors) => set({ featuredVendors }),

      setServices: (services) => set({ services }),

      setSelectedService: (service) => set({ selectedService: service } as unknown as Partial<AppState>),

      setBookings: (bookings) => set({ bookings }),
      
      setCategories: (categories) => set({ categories }),
      
      setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),
      
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),
      
      clearFilters: () => set({ filters: initialFilters }),
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      setSelectedCity: (city) => set({ selectedCity: city }),
      
      setAdminAuthenticated: (isAuth, token) => set({ 
        isAdminAuthenticated: isAuth,
        adminToken: token || null 
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      addBooking: (booking) => set((state) => ({ 
        bookings: [booking, ...state.bookings] 
      })),
      
      updateBookingStatus: (bookingId, status) => set((state) => ({
        bookings: state.bookings.map((b) => 
          b.bookingId === bookingId ? { ...b, status: status as Booking['status'] } : b
        ),
      })),
      
      // Vendor Actions
      setVendorAuthenticated: (isAuth, user) => set({ 
        isVendorAuthenticated: isAuth,
        vendorUser: user || null 
      }),
      
      setVendorServices: (services) => set({ vendorServices: services }),
      
      setVendorBookings: (bookings) => set({ vendorBookings: bookings }),
      
      setSelectedVendorService: (service) => set({ selectedVendorService: service }),
      
      addVendorService: (service) => set((state) => ({ 
        vendorServices: [service, ...state.vendorServices] 
      })),
      
      updateVendorService: (service) => set((state) => ({
        vendorServices: state.vendorServices.map((s) => 
          s.id === service.id ? service : s
        ),
      })),
      
      removeVendorService: (serviceId) => set((state) => ({
        vendorServices: state.vendorServices.filter((s) => s.id !== serviceId),
      })),
      
      vendorLogout: () => set({ 
        isVendorAuthenticated: false,
        vendorUser: null,
        vendorServices: [],
        vendorBookings: [],
        selectedVendorService: null,
      }),
    }),
    {
      name: 'shaadi-setgo-storage',
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminToken: state.adminToken,
        isVendorAuthenticated: state.isVendorAuthenticated,
        vendorUser: state.vendorUser,
      }),
    }
  )
);
