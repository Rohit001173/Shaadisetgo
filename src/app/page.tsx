'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore, ViewType } from '@/store/useAppStore';
import { BottomNav } from '@/components/shaadi/BottomNav';
import { SearchBar } from '@/components/shaadi/SearchBar';
import { VendorCard } from '@/components/shaadi/VendorCard';
import { CategoryCard, CategoryGrid, CategoryScroller, CategoryAccordion, categories } from '@/components/shaadi/CategoryCard';
import { ImageSlider, ImageGallery } from '@/components/shaadi/ImageSlider';
import { BookingForm } from '@/components/shaadi/BookingForm';
import { HomePageNew } from '@/components/shaadi/HomePageNew';
import VendorDashboard from '@/components/shaadi/VendorDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { weddingCategories, totalCategories, totalSubcategories } from '@/lib/categories';
import { 
  ArrowLeft, Star, MapPin, Phone, MessageCircle, BadgeCheck, Heart, 
  Calendar, Users, Clock, Filter, ChevronDown, Plus, Edit, Trash2,
  Eye, Settings, LogOut, BarChart3, Store, FileText, Shield,
  CheckCircle, XCircle, AlertCircle, Search, X, RefreshCw, Menu, Bell, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Vendor, Booking, VendorWithImages } from '@/types';

// Main App Component
export default function ShaadiSetGoApp() {
  const {
    currentView,
    setCurrentView,
    previousView,
    goBack,
    vendors,
    setVendors,
    selectedVendor,
    setSelectedVendor,
    selectedCategory,
    setSelectedCategory,
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    bookings,
    setBookings,
    isAdminAuthenticated,
    setAdminAuthenticated,
    isLoading,
    setLoading,
  } = useAppStore();

  // Fetch vendors on mount
  useEffect(() => {
    fetchVendors();
    seedDatabase();
  }, []);

  const seedDatabase = async () => {
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();
      if (data.data?.vendors === 0) {
        // Auto-seed if empty
        await fetch('/api/seed', { method: 'POST' });
        fetchVendors();
      }
    } catch (error) {
      console.error('Seed error:', error);
    }
  };

  const fetchVendors = async (filters?: Record<string, string>) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters || {});
      const response = await fetch(`/api/vendors?${params}`);
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  // Render based on current view
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'vendors':
        return <VendorsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'vendor-detail':
        return selectedVendor ? <VendorDetailPage vendor={selectedVendor} /> : <HomePage />;
      case 'admin-login':
        return <AdminLoginPage />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-vendors':
        return <AdminVendorsPage />;
      case 'admin-bookings':
        return <AdminBookingsPage />;
      case 'admin-add-vendor':
        return <AdminAddVendorPage />;
      case 'admin-add-service':
        return <AdminAddServicePage />;
      case 'admin-edit-vendor':
        return selectedVendor ? <AdminEditVendorPage vendor={selectedVendor} /> : <AdminVendorsPage />;
      case 'admin-settings':
        return <AdminSettingsPage />;
      // Vendor Dashboard Views
      case 'vendor-login':
      case 'vendor-signup':
      case 'vendor-dashboard':
      case 'vendor-services':
      case 'vendor-add-service':
      case 'vendor-edit-service':
      case 'vendor-bookings':
      case 'vendor-profile':
        return <VendorDashboard />;
      default:
        return <HomePage />;
    }
  };

  // Check if current view is a vendor dashboard view (no bottom nav needed)
  const isVendorView = [
    'vendor-login', 'vendor-signup', 'vendor-dashboard', 
    'vendor-services', 'vendor-add-service', 'vendor-edit-service',
    'vendor-bookings', 'vendor-profile'
  ].includes(currentView);

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      {!isVendorView && <BottomNav />}
    </div>
  );
}

// ==================== HOME PAGE ====================
function HomePage() {
  return <HomePageNew />;
}

// Available locations - Bihar & UP
const vendorLocations = [
  { id: 'patna', name: 'Patna', state: 'Bihar', emoji: '🏛️' },
  { id: 'gaya', name: 'Gaya', state: 'Bihar', emoji: '🕉️' },
  { id: 'muzaffarpur', name: 'Muzaffarpur', state: 'Bihar', emoji: '🍯' },
  { id: 'siwan', name: 'Siwan', state: 'Bihar', emoji: '🏰' },
  { id: 'gopalganj', name: 'Gopalganj', state: 'Bihar', emoji: '🌾' },
  { id: 'deoria', name: 'Deoria', state: 'UP', emoji: '🌿' },
  { id: 'kushinagar', name: 'Kushinagar', state: 'UP', emoji: '☸️' },
  { id: 'gorakhpur', name: 'Gorakhpur', state: 'UP', emoji: '🏯' },
];

// ==================== VENDORS PAGE ====================
function VendorsPage() {
  const { 
    setCurrentView, setSelectedVendor, vendors, isLoading, 
    selectedCategory, selectedCity, searchQuery, setSearchQuery,
    setSelectedCategory, setSelectedCity 
  } = useAppStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'newest'>('rating');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Filter and sort vendors - Enhanced with area search
  const filteredVendors = vendors
    .filter(v => {
      // Category filter
      if (selectedCategory && v.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // City/Location filter - also check area
      if (selectedCity) {
        const cityLower = selectedCity.toLowerCase();
        const matchesCity = v.city.toLowerCase() === cityLower;
        const matchesArea = v.area && v.area.toLowerCase().includes(cityLower);
        if (!matchesCity && !matchesArea) {
          return false;
        }
      }
      // Search filter - Enhanced to search name, category, city, area
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(query);
        const matchesCategory = v.category.toLowerCase().includes(query);
        const matchesCity = v.city.toLowerCase().includes(query);
        const matchesArea = v.area && v.area.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesCity && !matchesArea) {
          return false;
        }
      }
      // Price range filter
      if (v.priceStart && (v.priceStart < priceRange[0] || v.priceStart > priceRange[1])) {
        return false;
      }
      // Rating filter
      if (v.rating < minRating) {
        return false;
      }
      // Verified filter
      if (showVerifiedOnly && !v.isVerified) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price_low':
          return (a.priceStart || 0) - (b.priceStart || 0);
        case 'price_high':
          return (b.priceStart || 0) - (a.priceStart || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('vendor-detail');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCity(null);
    setSearchQuery('');
    setLocalSearch('');
    setPriceRange([0, 1000000]);
    setMinRating(0);
    setSortBy('rating');
    setShowVerifiedOnly(false);
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedCity,
    priceRange[0] > 0 || priceRange[1] < 1000000,
    minRating > 0,
    showVerifiedOnly,
  ].filter(Boolean).length;

  // Price range presets
  const pricePresets = [
    { label: 'All', min: 0, max: 1000000 },
    { label: 'Under ₹25K', min: 0, max: 25000 },
    { label: '₹25K - ₹50K', min: 25000, max: 50000 },
    { label: '₹50K - ₹1L', min: 50000, max: 100000 },
    { label: 'Above ₹1L', min: 100000, max: 1000000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8437A]" />
              <input
                type="text"
                placeholder="Service, vendor, ya area dhundho..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8437A]/20"
              />
            </div>
            
            {/* Location Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className={cn(
                  'p-2.5 rounded-xl transition-colors flex items-center gap-1',
                  selectedCity
                    ? 'bg-[#E8437A] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                <MapPin className="w-5 h-5" />
              </button>

              {/* Location Dropdown */}
              {showLocationDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden min-w-[180px]">
                  <div className="px-3 py-2 bg-gray-50 border-b">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Bihar</p>
                  </div>
                  {vendorLocations.filter(l => l.state === 'Bihar').map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedCity(loc.name);
                        setShowLocationDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-3 text-left text-sm hover:bg-pink-50 transition-colors flex items-center gap-2',
                        selectedCity === loc.name ? 'bg-pink-50 text-[#E8437A] font-semibold' : 'text-gray-700'
                      )}
                    >
                      <span>{loc.emoji}</span>
                      {loc.name}
                    </button>
                  ))}
                  <div className="px-3 py-2 bg-gray-50 border-b border-t">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Uttar Pradesh</p>
                  </div>
                  {vendorLocations.filter(l => l.state === 'UP').map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedCity(loc.name);
                        setShowLocationDropdown(false);
                      }}
                      className={cn(
                        'w-full px-4 py-3 text-left text-sm hover:bg-pink-50 transition-colors flex items-center gap-2',
                        selectedCity === loc.name ? 'bg-pink-50 text-[#E8437A] font-semibold' : 'text-gray-700'
                      )}
                    >
                      <span>{loc.emoji}</span>
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2.5 rounded-xl transition-colors relative',
                showFilters || activeFiltersCount > 0
                  ? 'bg-[#E8437A] text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              <Filter className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Pills */}
          {activeFiltersCount > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {selectedCategory && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-[#FFF0F5] text-[#E8437A]"
                >
                  {weddingCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedCategory(null)}
                  />
                </Badge>
              )}
              {selectedCity && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-[#FFF0F5] text-[#E8437A]"
                >
                  <MapPin className="w-3 h-3" />
                  {selectedCity}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedCity(null)}
                  />
                </Badge>
              )}
              {minRating > 0 && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-amber-50 text-amber-700"
                >
                  {minRating}+ Rating
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setMinRating(0)}
                  />
                </Badge>
              )}
              {showVerifiedOnly && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-green-50 text-green-700"
                >
                  Verified Only
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setShowVerifiedOnly(false)}
                  />
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-[#E8437A] font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Filter Panel */}
        {showFilters && (
          <div className="border-t bg-white px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Sort By */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sort By</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'rating', label: 'Rating', icon: Star },
                  { key: 'price_low', label: 'Price: Low', icon: '💰' },
                  { key: 'price_high', label: 'Price: High', icon: '💎' },
                  { key: 'newest', label: 'Newest', icon: '🆕' },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key as typeof sortBy)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                      sortBy === key
                        ? 'bg-[#E8437A] text-white border-[#E8437A]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#E8437A]/50'
                    )}
                  >
                    {typeof icon === 'string' ? icon + ' ' : ''}{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Category</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                    !selectedCategory
                      ? 'bg-[#E8437A] text-white border-[#E8437A]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#E8437A]/50'
                  )}
                >
                  All Categories
                </button>
                {weddingCategories.slice(0, 8).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-1.5',
                      selectedCategory === cat.id
                        ? 'bg-[#E8437A] text-white border-[#E8437A]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#E8437A]/50'
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span className="hidden sm:inline">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter in Panel */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Location</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCity(null)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                    !selectedCity
                      ? 'bg-[#E8437A] text-white border-[#E8437A]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#E8437A]/50'
                  )}
                >
                  All Locations
                </button>
                {vendorLocations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedCity(loc.name)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-1.5',
                      selectedCity === loc.name
                        ? 'bg-[#E8437A] text-white border-[#E8437A]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#E8437A]/50'
                    )}
                  >
                    <span>{loc.emoji}</span>
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Price Range</p>
              <div className="flex gap-2 flex-wrap">
                {pricePresets.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setPriceRange([preset.min, preset.max])}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-all border',
                      priceRange[0] === preset.min && priceRange[1] === preset.max
                        ? 'bg-[#E8437A] text-white border-[#E8437A]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#E8437A]/50'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Minimum Rating</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 3.5, 4.0, 4.5, 4.8].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-1',
                      minRating === rating
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                    )}
                  >
                    {rating === 0 ? 'All' : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {rating}+
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Toggle */}
            <div>
              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-between',
                  showVerifiedOnly
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'
                )}
              >
                <span className="flex items-center gap-2">
                  <BadgeCheck className={cn('w-5 h-5', showVerifiedOnly ? 'text-green-600' : 'text-gray-400')} />
                  <span>Verified Vendors Only</span>
                </span>
                <div className={cn(
                  'w-10 h-6 rounded-full transition-colors relative',
                  showVerifiedOnly ? 'bg-green-500' : 'bg-gray-300'
                )}>
                  <div className={cn(
                    'w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                    showVerifiedOnly ? 'right-1' : 'left-1'
                  )} />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{filteredVendors.length}</span> vendors found
            {selectedCity && (
              <span className="text-[#E8437A]"> in {selectedCity}</span>
            )}
          </p>
          {activeFiltersCount > 0 && (
            <p className="text-xs text-[#E8437A]">{activeFiltersCount} filters active</p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVendors.length > 0 ? (
          <div className="space-y-4">
            {filteredVendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onClick={() => handleVendorClick(vendor)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-[#E8437A] opacity-50" />
            </div>
            <p className="text-gray-800 font-bold text-xl mb-2">Koi vendor nahi mila</p>
            <p className="text-gray-500 text-sm mb-1">
              "{searchQuery || selectedCategory || selectedCity}" ke liye koi service available nahi hai
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Apne filters change karke fir se try karein
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-[#E8437A] text-white rounded-xl font-medium hover:bg-[#d63a6d] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate WhatsApp message with ShaadiSetGo branding for booking
const generateBookingWhatsAppMessage = (vendor: Vendor, bookingData: any, bookingId: string) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    });
  };

  const message = `💒 *ShaadiSetGo* 💒
━━━━━━━━━━━━━━━━━━━━━

🎉 *NEW BOOKING REQUEST*

━━━━━━━━━━━━━━━━━━━━━

📋 *Booking ID:* ${bookingId}

👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━
• Name: ${bookingData.customerName}
• Phone: +91 ${bookingData.customerPhone}
${bookingData.customerEmail ? `• Email: ${bookingData.customerEmail}` : ''}

📅 *EVENT DETAILS*
━━━━━━━━━━━━━━━━━━━━━
• Date: ${formatDate(bookingData.eventDate)}
• Function: ${bookingData.functionType}
• City: ${bookingData.city}
${bookingData.guests ? `• Expected Guests: ${bookingData.guests}` : ''}
${bookingData.timing ? `• Timing: ${bookingData.timing}` : ''}

${bookingData.specialRequest ? `📝 *SPECIAL REQUESTS*\n━━━━━━━━━━━━━━━━━━━━━\n${bookingData.specialRequest}` : ''}

━━━━━━━━━━━━━━━━━━━━━

🏪 *Vendor:* ${vendor.name}
🏷️ *Service:* ${vendor.category}
📍 *Location:* ${vendor.area || vendor.city}

━━━━━━━━━━━━━━━━━━━━━

💡 *Next Steps:*
Please contact the customer to confirm booking details and discuss pricing.

📲 Booked via ShaadiSetGo App
🌐 Bihar & UP's #1 Wedding Marketplace`;

  return encodeURIComponent(message);
};

// Generate simple inquiry WhatsApp message with ShaadiSetGo branding
const generateInquiryWhatsAppMessage = (vendor: Vendor) => {
  const message = `💒 *ShaadiSetGo* 💒
━━━━━━━━━━━━━━━━━━━━━

👋 Hello!

I found your profile on *ShaadiSetGo* and I'm interested in your services.

🏪 *Vendor:* ${vendor.name}
🏷️ *Service:* ${vendor.category}
📍 *Location:* ${vendor.area || vendor.city}

Please share more details about your services and pricing.

━━━━━━━━━━━━━━━━━━━━━
📲 Sent via ShaadiSetGo App
🌐 Bihar & UP's #1 Wedding Marketplace`;

  return encodeURIComponent(message);
};

// ==================== VENDOR DETAIL PAGE ====================
function VendorDetailPage({ vendor }: { vendor: Vendor }) {
  const { setCurrentView, addBooking } = useAppStore();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'reviews' | 'location'>('new');

  const handleBookingSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          vendorId: vendor.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        addBooking(result.data);
        toast.success(`Booking submitted! ID: ${result.data.bookingId}`);
        setShowBookingForm(false);
        
        // Send WhatsApp message to vendor with booking details
        if (vendor.phoneNumber) {
          const whatsappMessage = generateBookingWhatsAppMessage(vendor, data, result.data.bookingId);
          // Open WhatsApp in new tab with the message
          window.open(`https://wa.me/91${vendor.phoneNumber}?text=${whatsappMessage}`, '_blank');
        }
      } else {
        toast.error(result.error || 'Failed to submit booking');
      }
    } catch (error) {
      toast.error('Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const message = generateInquiryWhatsAppMessage(vendor);
    window.open(`https://wa.me/91${vendor.phoneNumber}?text=${message}`, '_blank');
  };

  // Default services based on category
  const defaultServices: Record<string, string[]> = {
    'DJ': ['DJ Service', 'Sound System', 'Lighting', 'MC Service', 'Dance Floor'],
    'Photographer': ['Photography', 'Videography', 'Cinematography', 'Drone Shoot', 'Photo Album'],
    'Catering': ['Veg Menu', 'Non-Veg Menu', 'Live Counter', 'Dessert Station', 'Beverages'],
    'Mehndi': ['Bridal Mehndi', 'Party Mehndi', 'Arabic Design', 'Traditional Design', 'Portrait Design'],
    'Pandit Ji': ['Wedding Ceremony', 'Havan', 'Puja', 'Mundan', 'Satyanarayan Katha'],
    'Makeup': ['Bridal Makeup', 'Party Makeup', 'HD Makeup', 'Airbrush Makeup', 'Hair Styling'],
    'Tent & Decoration': ['Stage Decoration', 'Mandap Setup', 'Lighting', 'Floral Decor', 'Theme Decor'],
    'Band Baja': ['Baraat Band', 'Dhol', 'Baggi', 'Fireworks', 'DJ Baraat'],
    'Honeymoon Package': ['Domestic Packages', 'International Packages', 'Custom Itinerary', 'Hotel Booking'],
    'Hotel & Banquet': ['Banquet Hall', 'Lawn', 'AC Rooms', 'Parking', 'Catering'],
    'Beauty Parlour': ['Bridal Package', 'Groom Package', 'Facial', 'Hair Treatment', 'Nail Art'],
  };

  const vendorServices = vendor.services && vendor.services.length > 0 
    ? vendor.services 
    : (defaultServices[vendor.category] || [vendor.category, 'Wedding Service', 'Event Service']);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('vendors')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold flex-1 truncate">{vendor.name}</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { key: 'new', label: 'New' },
            { key: 'reviews', label: 'Reviews' },
            { key: 'location', label: 'Location' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors relative',
                activeTab === tab.key
                  ? 'text-[#E8437A]'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8437A]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'new' && (
        <div className="px-4 py-4 space-y-4">
          {/* Image Gallery */}
          <ImageGallery 
            images={vendor.images || []} 
            alt={vendor.name} 
          />

          {/* Vendor Info Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{vendor.name}</h2>
                <p className="text-gray-500">{vendor.category} • {vendor.area || vendor.city}</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({vendor.reviewsCount})</span>
              </div>
            </div>

            {vendor.isVerified && (
              <div className="flex items-center gap-2 mt-3 text-green-600">
                <BadgeCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Verified Vendor</span>
              </div>
            )}
          </div>

          {/* Pricing Details Card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Pink Header */}
            <div className="bg-gradient-to-r from-[#E8437A] to-pink-400 px-4 py-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-white font-bold">Pricing Details</h3>
              {vendor.priceModel && (
                <span className="ml-auto text-white/90 text-sm capitalize">{vendor.priceModel}</span>
              )}
            </div>

            <div className="p-4 space-y-3">
              {/* Starting Price */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Starting Price</span>
                <span className="text-[#E8437A] font-bold text-lg">
                  {vendor.priceLabel || (vendor.priceStart ? `₹${vendor.priceStart.toLocaleString()}` : 'Contact for price')}
                </span>
              </div>

              {/* Advance */}
              {vendor.advancePercentage && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Advance</span>
                  <span className="text-[#E8437A] font-semibold">{vendor.advancePercentage}%</span>
                </div>
              )}

              {/* Max Guests */}
              {vendor.maxGuests && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Max Guests</span>
                  <span className="font-medium">{vendor.maxGuests}</span>
                </div>
              )}

              {/* Extra Hours */}
              {vendor.extraHourCharge && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Extra Hours</span>
                  <span className="font-medium">{vendor.extraHourCharge}</span>
                </div>
              )}

              {/* Distance Policy */}
              {vendor.distancePolicy && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium text-right text-sm">{vendor.distancePolicy}</span>
                </div>
              )}

              {/* Warning Banner */}
              {vendor.advancePercentage && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    <strong>Advance:</strong> Estimated {vendor.advancePercentage}% — confirm vendor se karein
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#FFF0F5] rounded-lg flex items-center justify-center">
                <span className="text-lg">🏷️</span>
              </div>
              <h3 className="font-bold text-gray-900">SERVICES</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {vendorServices.map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-[#FFF0F5] text-[#E8437A] rounded-full text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>

            {/* View Count */}
            {vendor.viewCount && vendor.viewCount > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  {vendor.viewCount.toLocaleString()} views
                </div>
              </div>
            )}
          </div>

          {/* About Section */}
          {vendor.description && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#FFF0F5] rounded-lg flex items-center justify-center">
                  <span className="text-lg">ℹ️</span>
                </div>
                <h3 className="font-bold text-gray-900">ABOUT</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{vendor.description}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="px-4 py-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#FFF0F5] rounded-lg flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              <h3 className="font-bold text-gray-900">REVIEWS ({vendor.reviewsCount})</h3>
            </div>
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        </div>
      )}

      {activeTab === 'location' && (
        <div className="px-4 py-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#FFF0F5] rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#E8437A]" />
              </div>
              <h3 className="font-bold text-gray-900">LOCATION</h3>
            </div>
            
            <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center mb-4">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Map coming soon</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">{vendor.name}</p>
              <p className="text-gray-600 text-sm">
                {[vendor.area, vendor.city].filter(Boolean).join(', ')}
              </p>
              {vendor.pincode && (
                <p className="text-gray-500 text-sm">PIN: {vendor.pincode}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t z-40">
        <div className="flex gap-3 max-w-lg mx-auto">
          {/* ShaadiSetGo WhatsApp Button */}
          <Button
            variant="outline"
            className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
            onClick={handleWhatsApp}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E8437A] to-pink-400 flex items-center justify-center">
                <span className="text-white text-xs">💒</span>
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-gray-400">via ShaadiSetGo</span>
                <span className="text-sm font-semibold">WhatsApp</span>
              </div>
            </div>
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-[#E8437A] to-pink-400 hover:opacity-90"
            onClick={() => setShowBookingForm(true)}
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Book {vendor.name}</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <BookingForm
                vendor={vendor}
                onSubmit={handleBookingSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CATEGORIES PAGE ====================
function CategoriesPage() {
  const { setCurrentView, setSelectedCategory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string, subcategoryName: string) => {
    // Set the subcategory as the filter and navigate to vendors
    setSelectedCategory(subcategoryName);
    setCurrentView('vendors');
  };

  // Filter categories based on search using useMemo
  const filteredCategories = searchQuery 
    ? weddingCategories.filter((cat) => {
        const matchesCategory = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (cat.nameHindi && cat.nameHindi.includes(searchQuery));
        const matchesSubcategory = cat.subcategories.some((sub) => 
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (sub.nameHindi && sub.nameHindi.includes(searchQuery))
        );
        return matchesCategory || matchesSubcategory;
      })
    : weddingCategories;

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E8437A] to-pink-400 text-white px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">All Categories</h1>
        <p className="text-white/80 text-sm mb-4">
          {totalCategories} categories • {totalSubcategories} services
        </p>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="p-4">
        {filteredCategories.length > 0 ? (
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <CategoryAccordion
                key={category.id}
                selectedCategoryId={searchQuery ? category.id : undefined}
                onSelectSubcategory={handleSubcategoryClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No categories found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== BOOKINGS PAGE ====================
function BookingsPage() {
  const { setBookings } = useAppStore();
  const [phone, setPhone] = useState('');
  const [searchedBookings, setSearchedBookings] = useState<Booking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings?phone=${phone}`);
      const data = await response.json();
      if (data.success) {
        setSearchedBookings(data.data);
        setHasSearched(true);
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancellingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Booking cancelled successfully');
        // Update local state
        setSearchedBookings(prev => 
          prev.map(b => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b)
        );
      } else {
        toast.error(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          bgColor: 'bg-green-500',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Confirmed',
          description: 'Your booking is confirmed',
          canCancel: true,
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          bgColor: 'bg-red-500',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Cancelled',
          description: 'Booking has been cancelled',
          canCancel: false,
        };
      case 'pending':
      default:
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          bgColor: 'bg-amber-500',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Sending',
          description: 'Request is being processed',
          canCancel: true,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E8437A] to-pink-400 text-white px-4 py-6">
        <h1 className="text-xl font-bold">My Bookings</h1>
        <p className="text-white/80 text-sm">Track and manage your bookings</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Search by Phone */}
        <div className="bg-white rounded-2xl p-4 shadow-sm -mt-4">
          <Label className="text-sm font-medium mb-2 block">Enter your phone number</Label>
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-[#E8437A] hover:bg-[#d63a6d] px-6"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : 'Search'}
            </Button>
          </div>
        </div>

        {/* Status Legend */}
        {hasSearched && searchedBookings.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
            {['pending', 'confirmed', 'cancelled'].map(status => {
              const config = getStatusConfig(status);
              return (
                <div key={status} className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
                  config.color
                )}>
                  {config.icon}
                  <span>{config.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bookings List */}
        {hasSearched && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{searchedBookings.length} bookings found</p>
            {searchedBookings.length > 0 ? (
              searchedBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                return (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Status Bar */}
                    <div className={cn('h-1', statusConfig.bgColor)} />
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{booking.vendorName}</h3>
                          <p className="text-sm text-gray-500">{booking.functionType}</p>
                        </div>
                        <div className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
                          statusConfig.color
                        )}>
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </div>
                      </div>

                      {/* Status Message */}
                      <div className={cn(
                        'rounded-lg p-2.5 mb-3 text-sm flex items-center gap-2',
                        statusConfig.color
                      )}>
                        {statusConfig.icon}
                        <span>{statusConfig.description}</span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-[#E8437A]" />
                          <span>{new Date(booking.eventDate).toLocaleDateString('en-IN', { 
                            day: 'numeric', month: 'short', year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-[#E8437A]" />
                          <span>{booking.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4 text-[#E8437A]" />
                          <span>{booking.guests || 'N/A'} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-[#E8437A]" />
                          <span>{booking.customerPhone}</span>
                        </div>
                      </div>

                      {/* Booking ID */}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          Booking ID: <span className="font-mono font-semibold text-gray-600">{booking.bookingId}</span>
                        </p>
                      </div>

                      {/* Cancel Button */}
                      {statusConfig.canCancel && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            className="w-full border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleCancelBooking(booking.bookingId)}
                            disabled={cancellingId === booking.bookingId}
                          >
                            {cancellingId === booking.bookingId ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No bookings found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different phone number</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#FFF0F5] flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-[#E8437A]" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Your Bookings</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Enter your phone number to see all your booking requests and their status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PROFILE PAGE ====================
function ProfilePage() {
  const { setCurrentView, isAdminAuthenticated, setAdminAuthenticated, isVendorAuthenticated, vendorUser } = useAppStore();

  const menuItems = [
    {
      icon: Store,
      label: 'Vendor Portal',
      description: isVendorAuthenticated ? `Logged in as ${vendorUser?.businessName}` : 'Manage your vendor business',
      onClick: () => setCurrentView(isVendorAuthenticated ? 'vendor-dashboard' : 'vendor-login'),
      show: true,
      badge: isVendorAuthenticated ? 'Active' : 'New',
    },
    {
      icon: Shield,
      label: 'Admin Dashboard',
      description: 'Manage vendors & bookings',
      onClick: () => setCurrentView(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login'),
      show: true,
      badge: isAdminAuthenticated ? 'Active' : undefined,
    },
    {
      icon: Heart,
      label: 'Saved Vendors',
      description: 'Your favorite vendors',
      onClick: () => toast.info('Coming soon!'),
      show: true,
      badge: undefined,
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage notifications',
      onClick: () => toast.info('Coming soon!'),
      show: true,
      badge: undefined,
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'App preferences',
      onClick: () => toast.info('Coming soon!'),
      show: true,
      badge: undefined,
    },
  ];

  const handleLogout = () => {
    setAdminAuthenticated(false, '');
    toast.success('Logged out successfully');
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E8437A] to-pink-400 text-white px-4 py-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome!</h1>
            <p className="text-white/80">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {menuItems.filter(item => item.show).map(({ icon: Icon, label, description, onClick, badge }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-[#FFF0F5] flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#E8437A]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{label}</h3>
                {badge && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    badge === 'Active' ? "bg-green-100 text-green-700" : "bg-pink-100 text-pink-700"
                  )}>
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </button>
        ))}

        {isAdminAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 rounded-xl p-4 flex items-center gap-4 hover:bg-red-100 transition-colors text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>

      {/* App Info */}
      <div className="p-4 mt-4">
        <div className="text-center text-gray-400 text-sm">
          <p>ShaadiSetGo v1.0</p>
          <p className="mt-1">Wedding Vendor Marketplace</p>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN LOGIN PAGE ====================
function AdminLoginPage() {
  const { setCurrentView, setAdminAuthenticated } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    
    if (!username || !password) {
      setErrorMsg('Please enter username and password');
      toast.error('Please enter username and password');
      return;
    }

    setIsLoading(true);
    
    // DIRECT HARDCODED CHECK - Always works!
    if (username === 'admin' && password === 'shaadisetgo2024') {
      setAdminAuthenticated(true, 'admin-token-' + Date.now());
      toast.success('Login successful!');
      setIsLoading(false);
      setCurrentView('admin-dashboard');
      return;
    }

    // If not hardcoded, try API
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setAdminAuthenticated(true, data.data?.token || 'token');
        toast.success('Login successful!');
        setCurrentView('admin-dashboard');
      } else {
        setErrorMsg(data.error || 'Invalid credentials');
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMsg('Connection error. Please try again.');
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F5] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#E8437A]" />
          </div>
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your credentials</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#E8437A] hover:bg-[#d63a6d]"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {errorMsg}
            </div>
          )}
        </div>

        <button
          onClick={() => setCurrentView('profile')}
          className="w-full mt-4 text-sm text-gray-500 hover:text-[#E8437A]"
        >
          ← Back to Profile
        </button>

        <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
          <p className="text-xs font-semibold text-green-700 mb-1">Login Credentials:</p>
          <p className="text-sm text-green-800 font-mono">admin / shaadisetgo2024</p>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard() {
  const { setCurrentView, isAdminAuthenticated, setAdminAuthenticated } = useAppStore();
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStats();
  }, []);

  const handleLogout = () => {
    setAdminAuthenticated(false, '');
    setCurrentView('home');
  };

  const menuItems = [
    { icon: Store, label: 'Vendors', count: stats.totalVendors, view: 'admin-vendors' },
    { icon: FileText, label: 'Bookings', count: stats.totalBookings, view: 'admin-bookings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E8437A] to-pink-400 text-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-white/80 text-sm">ShaadiSetGo Management</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Vendors', value: stats.totalVendors, icon: Store, color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Bookings', value: stats.totalBookings, icon: FileText, color: 'bg-green-50 text-green-600' },
            { label: 'Pending', value: stats.pendingBookings, icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
            { label: 'Confirmed', value: stats.confirmedBookings, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {menuItems.map(({ icon: Icon, label, count, view }) => (
              <button
                key={label}
                onClick={() => setCurrentView(view as ViewType)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FFF0F5] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#E8437A]" />
                </div>
                <span className="flex-1 text-left font-medium">{label}</span>
                <Badge variant="secondary">{count}</Badge>
              </button>
            ))}
            <button
              onClick={() => setCurrentView('admin-add-vendor')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-pink-50 text-[#E8437A] hover:bg-pink-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E8437A]/10 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">Add New Vendor</span>
            </button>
            <button
              onClick={() => setCurrentView('admin-add-service')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#E8437A] text-white"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">Add New Service</span>
            </button>
            <button
              onClick={() => setCurrentView('admin-settings')}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="flex-1 text-left font-medium">Settings</span>
              <span className="text-xs text-gray-400">Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN VENDORS PAGE ====================
function AdminVendorsPage() {
  const { setCurrentView, setSelectedVendor, vendors, setVendors, isLoading, setLoading } = useAppStore();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vendors?limit=100');
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('admin-edit-vendor');
  };

  const handleDeactivate = async (vendorId: string) => {
    if (!confirm('Are you sure you want to deactivate this vendor?')) return;
    
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Vendor deactivated');
        fetchVendors();
      }
    } catch (error) {
      toast.error('Failed to deactivate vendor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Manage Vendors</h1>
          <Button
            onClick={() => setCurrentView('admin-add-vendor')}
            size="sm"
            className="bg-[#E8437A]"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : vendors.length > 0 ? (
          vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{vendor.name}</h3>
                    {vendor.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{vendor.category} • {vendor.city}</p>
                  <p className="text-sm font-medium text-[#E8437A] mt-1">
                    {vendor.priceStart ? `₹${vendor.priceStart.toLocaleString()}+` : 'Contact for price'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDeactivate(vendor.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No vendors found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ADMIN BOOKINGS PAGE ====================
function AdminBookingsPage() {
  const { setCurrentView, bookings, setBookings } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookings = async (status?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bookings on mount
  useEffect(() => {
    void fetchBookings();
  }, []);

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Booking ${status}`);
        fetchBookings(statusFilter);
      }
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          bgColor: 'bg-green-500',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: 'Confirmed'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          bgColor: 'bg-red-500',
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          bgColor: 'bg-amber-500',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Pending'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E8437A] to-pink-400 text-white px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Manage Bookings</h1>
            <p className="text-white/80 text-sm">{bookings.length} total bookings</p>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { key: '', label: 'All', count: bookings.length },
            { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
            { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
            { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                fetchBookings(key);
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                statusFilter === key
                  ? 'bg-white text-[#E8437A]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              )}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const isExpanded = expandedBooking === booking.id;
            
            return (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Status Bar */}
                <div className={cn('h-1.5', statusConfig.bgColor)} />
                
                <div className="p-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">{booking.customerName || 'Customer'}</h3>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                          statusConfig.color
                        )}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {booking.vendorName || 'Vendor'} • {booking.functionType || 'Function'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Phone className="w-4 h-4 text-[#E8437A]" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{booking.customerPhone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Calendar className="w-4 h-4 text-[#E8437A]" />
                      <div>
                        <p className="text-xs text-gray-500">Event Date</p>
                        <p className="text-sm font-medium">{formatDate(booking.eventDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <MapPin className="w-4 h-4 text-[#E8437A]" />
                      <div>
                        <p className="text-xs text-gray-500">City</p>
                        <p className="text-sm font-medium">{booking.city || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Users className="w-4 h-4 text-[#E8437A]" />
                      <div>
                        <p className="text-xs text-gray-500">Guests</p>
                        <p className="text-sm font-medium">{booking.guests || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                    className="w-full flex items-center justify-center gap-1 py-2 text-sm text-[#E8437A] font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 rotate-180" />
                        View More Details
                      </>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {booking.customerEmail && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm font-medium">{booking.customerEmail}</p>
                          </div>
                        )}
                        {booking.timing && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Event Timing</p>
                            <p className="text-sm font-medium">{booking.timing}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                          <p className="text-sm font-mono font-medium">{booking.bookingId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Vendor ID</p>
                          <p className="text-sm font-medium truncate">{booking.vendorId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Booked On</p>
                          <p className="text-sm font-medium">{formatDate(typeof booking.createdAt === 'string' ? booking.createdAt : booking.createdAt.toISOString())}</p>
                        </div>
                      </div>
                      
                      {booking.specialRequest && (
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-700 font-medium mb-1">Special Request</p>
                          <p className="text-sm text-amber-800">{booking.specialRequest}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {booking.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#FFF0F5] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-[#E8437A]" />
            </div>
            <p className="text-gray-600 font-medium">No bookings found</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter ? `No ${statusFilter} bookings` : 'Bookings will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ADMIN ADD VENDOR PAGE ====================
function AdminAddVendorPage() {
  const { setCurrentView } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    category: 'DJ',
    city: 'Patna',
    area: '',
    priceStart: '',
    priceLabel: '',
    phoneNumber: '',
    description: '',
    isVerified: false,
    isFeatured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.city || !formData.priceStart) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceStart: parseInt(formData.priceStart),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Vendor added successfully!');
        setCurrentView('admin-vendors');
      } else {
        toast.error(data.error || 'Failed to add vendor');
      }
    } catch (error) {
      toast.error('Failed to add vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('admin-vendors')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Add New Vendor</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <Label>Vendor Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <Label>Owner Name</Label>
            <Input
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              placeholder="Enter owner name"
            />
          </div>

          <div>
            <Label>Category *</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div>
              <Label>Area</Label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Area"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Starting Price *</Label>
              <Input
                type="number"
                value={formData.priceStart}
                onChange={(e) => setFormData({ ...formData, priceStart: e.target.value })}
                placeholder="e.g., 25000"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Phone"
              />
            </div>
          </div>

          <div>
            <Label>Price Label</Label>
            <Input
              value={formData.priceLabel}
              onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
              placeholder="e.g., Starting from ₹25,000"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vendor description"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#E8437A] focus:ring-[#E8437A]"
              />
              <span className="text-sm">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#E8437A] focus:ring-[#E8437A]"
              />
              <span className="text-sm">Featured</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#E8437A] hover:bg-[#d63a6d] py-6"
        >
          {isSubmitting ? 'Adding...' : 'Add Vendor'}
        </Button>
      </form>
    </div>
  );
}

// ==================== ADMIN EDIT VENDOR PAGE ====================
function AdminEditVendorPage({ vendor }: { vendor: Vendor }) {
  const { setCurrentView, setVendors, vendors } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: vendor.name,
    ownerName: vendor.ownerName || '',
    category: vendor.category,
    city: vendor.city,
    area: vendor.area || '',
    priceStart: vendor.priceStart.toString(),
    priceLabel: vendor.priceLabel || '',
    phoneNumber: vendor.phoneNumber || '',
    description: vendor.description || '',
    isVerified: vendor.isVerified,
    isFeatured: vendor.isFeatured,
    isActive: vendor.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceStart: parseInt(formData.priceStart),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Vendor updated successfully!');
        setCurrentView('admin-vendors');
      } else {
        toast.error(data.error || 'Failed to update vendor');
      }
    } catch (error) {
      toast.error('Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('admin-vendors')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Edit Vendor</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <Label>Vendor Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Owner Name</Label>
            <Input
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            />
          </div>

          <div>
            <Label>Category *</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label>Area</Label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Starting Price *</Label>
              <Input
                type="number"
                value={formData.priceStart}
                onChange={(e) => setFormData({ ...formData, priceStart: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#E8437A]"
              />
              <span className="text-sm">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#E8437A]"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#E8437A]"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#E8437A] hover:bg-[#d63a6d] py-6"
        >
          {isSubmitting ? 'Updating...' : 'Update Vendor'}
        </Button>
      </form>
    </div>
  );
}

// ==================== ADMIN SETTINGS PAGE ====================
function AdminSettingsPage() {
  const { setCurrentView, setAdminAuthenticated } = useAppStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false, '');
    setCurrentView('home');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Admin Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Password Change Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F5] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#E8437A]" />
            </div>
            <div>
              <h2 className="font-semibold">Change Password</h2>
              <p className="text-xs text-gray-500">Update your admin password</p>
            </div>
          </div>

          {message && (
            <div className={cn(
              'p-3 rounded-xl mb-4 text-sm font-medium',
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            )}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E8437A] hover:bg-[#d63a6d]"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold">Account Info</h2>
              <p className="text-xs text-gray-500">Your admin account details</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Username</span>
              <span className="font-medium">admin</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Role</span>
              <span className="font-medium text-[#E8437A]">Administrator</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Status</span>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 transition-colors text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout from Admin</span>
        </button>
      </div>
    </div>
  );
}

// ==================== ADMIN ADD SERVICE PAGE ====================
function AdminAddServicePage() {
  const { setCurrentView } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    // Vendor/Service Name
    name: '',
    ownerName: '',
    // Service Category
    category: 'DJ',
    // Pricing
    priceStart: '',
    priceLabel: '',
    priceModel: 'fixed',
    advancePercentage: '',
    // Location
    city: 'Patna',
    area: '',
    pincode: '',
    address: '',
    // Contact
    phoneNumber: '',
    // Additional Info
    description: '',
    services: '',
    maxGuests: '',
    extraHourCharge: '',
    distancePolicy: '',
    // Status
    isVerified: false,
    isFeatured: false,
  });

  // Handle image upload - Upload to Supabase Storage via API
  const handleImageUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      // Validate files
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      const validFiles = Array.from(files).filter(file => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`${file.name} is not a valid image type`);
          return false;
        }
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setUploadingImages(false);
        return;
      }

      // Upload via API to Supabase Storage
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        setUploadedImageUrls(prev => [...prev, ...result.data]);
        toast.success(`${result.data.length} image(s) uploaded successfully!`);
      } else {
        toast.error(result.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Available cities for Bihar & UP
  const availableCities = [
    { name: 'Patna', state: 'Bihar' },
    { name: 'Gaya', state: 'Bihar' },
    { name: 'Muzaffarpur', state: 'Bihar' },
    { name: 'Siwan', state: 'Bihar' },
    { name: 'Gopalganj', state: 'Bihar' },
    { name: 'Deoria', state: 'UP' },
    { name: 'Kushinagar', state: 'UP' },
    { name: 'Gorakhpur', state: 'UP' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.city || !formData.priceStart || !formData.phoneNumber) {
      toast.error('Please fill all required fields (marked with *)');
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    if (formData.pincode && formData.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      const vendorData = {
        name: formData.name,
        ownerName: formData.ownerName || null,
        category: formData.category,
        city: formData.city,
        area: formData.area || null,
        pincode: formData.pincode || null,
        priceStart: parseInt(formData.priceStart),
        priceLabel: formData.priceLabel || `Starting from ₹${parseInt(formData.priceStart).toLocaleString()}`,
        priceModel: formData.priceModel || null,
        advancePercentage: formData.advancePercentage ? parseInt(formData.advancePercentage) : null,
        maxGuests: formData.maxGuests || null,
        extraHourCharge: formData.extraHourCharge || null,
        distancePolicy: formData.distancePolicy || null,
        phoneNumber: formData.phoneNumber,
        description: formData.description || null,
        services: formData.services ? formData.services.split(',').map(s => s.trim()) : null,
        isVerified: formData.isVerified,
        isFeatured: formData.isFeatured,
        images: uploadedImageUrls,
      };

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Service added successfully!');
        setFormData({
          name: '',
          ownerName: '',
          category: 'DJ',
          priceStart: '',
          priceLabel: '',
          priceModel: 'fixed',
          advancePercentage: '',
          city: 'Patna',
          area: '',
          pincode: '',
          address: '',
          phoneNumber: '',
          description: '',
          services: '',
          maxGuests: '',
          extraHourCharge: '',
          distancePolicy: '',
          isVerified: false,
          isFeatured: false,
        });
        setUploadedImageUrls([]);
        setCurrentView('admin-vendors');
      } else {
        toast.error(data.error || 'Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E8437A] to-pink-400 text-white sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('admin-dashboard')}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Add New Service</h1>
            <p className="text-white/80 text-sm">Fill all service details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Basic Info Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#FFF0F5] rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-[#E8437A]" />
            </div>
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="space-y-4">
            {/* Vendor/Service Name */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Service/Vendor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., R.K. Sound & DJ Services"
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Owner Name */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Owner Name</Label>
              <Input
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g., Ramesh Kumar"
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Service Category */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Service Category <span className="text-red-500">*</span>
              </Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8437A]/20"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            {/* Services List */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Services Offered</Label>
              <Textarea
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                placeholder="Enter services separated by comma (e.g., DJ Service, Sound System, Lighting)"
                rows={2}
                className="bg-gray-50 border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple services with commas</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <h2 className="font-semibold text-gray-900">Pricing Details</h2>
          </div>

          <div className="space-y-4">
            {/* Starting Price */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Starting Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.priceStart}
                onChange={(e) => setFormData({ ...formData, priceStart: e.target.value })}
                placeholder="e.g., 25000"
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Price Label */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Price Display Label</Label>
              <Input
                value={formData.priceLabel}
                onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
                placeholder="e.g., Starting from ₹25,000"
                className="bg-gray-50 border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generated label</p>
            </div>

            {/* Price Model & Advance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Price Model</Label>
                <select
                  value={formData.priceModel}
                  onChange={(e) => setFormData({ ...formData, priceModel: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="per_event">Per Event</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Advance (%)</Label>
                <Input
                  type="number"
                  value={formData.advancePercentage}
                  onChange={(e) => setFormData({ ...formData, advancePercentage: e.target.value })}
                  placeholder="e.g., 50"
                  max="100"
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Max Guests & Extra Charge */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Max Guests</Label>
                <Input
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                  placeholder="e.g., 500"
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Extra Hour Charge</Label>
                <Input
                  value={formData.extraHourCharge}
                  onChange={(e) => setFormData({ ...formData, extraHourCharge: e.target.value })}
                  placeholder="e.g., ₹2000/hour"
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Distance Policy */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Distance/Travel Policy</Label>
              <Input
                value={formData.distancePolicy}
                onChange={(e) => setFormData({ ...formData, distancePolicy: e.target.value })}
                placeholder="e.g., Within city free, outside ₹10/km"
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Location Details</h2>
          </div>

          <div className="space-y-4">
            {/* City & Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">
                  City <span className="text-red-500">*</span>
                </Label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  {availableCities.map(city => (
                    <option key={city.name} value={city.name}>{city.name} ({city.state})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Area/Locality</Label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Boring Road"
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Area Pin Code</Label>
              <Input
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="e.g., 800001"
                maxLength={6}
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Full Address */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Full Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter complete address with landmark"
                rows={2}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Contact Details</h2>
          </div>

          <div className="space-y-4">
            {/* Phone Number */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-gray-100 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm">+91</span>
                </div>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="9876543210"
                  maxLength={10}
                  className="flex-1 bg-gray-50 border-gray-200"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">WhatsApp messages will be sent to this number</p>
            </div>
          </div>
        </div>

        {/* Service Photos Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <span className="text-lg">📸</span>
            </div>
            <h2 className="font-semibold text-gray-900">Service Photos</h2>
            {uploadedImageUrls.length > 0 && (
              <Badge className="bg-[#E8437A] text-white ml-auto">{uploadedImageUrls.length} uploaded</Badge>
            )}
          </div>

          {/* Upload Area - Drag & Drop */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
              dragActive
                ? 'border-[#E8437A] bg-pink-50'
                : 'border-gray-200 hover:border-[#E8437A]/50 hover:bg-gray-50'
            )}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
            />
            
            {uploadingImages ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-12 h-12 text-[#E8437A] animate-spin" />
                <p className="text-gray-600 font-medium">Uploading images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#FFF0F5] rounded-2xl flex items-center justify-center">
                  <Plus className="w-8 h-8 text-[#E8437A]" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Click to upload or drag & drop</p>
                  <p className="text-gray-400 text-sm mt-1">JPEG, PNG, GIF, WebP (max 5MB each)</p>
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImageUrls.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">Uploaded Images:</p>
              <div className="grid grid-cols-3 gap-3">
                {uploadedImageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Primary Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-[#E8437A] text-white text-xs px-2 py-1 rounded-lg font-medium">
                        Primary
                      </div>
                    )}
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Image Number */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">First image will be used as primary/cover photo</p>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Description</h2>
          </div>

          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Write a brief description about the service, experience, specialties..."
            rows={4}
            className="bg-gray-50 border-gray-200"
          />
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Status & Visibility</h2>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#E8437A] focus:ring-[#E8437A]"
              />
              <div>
                <span className="text-sm font-medium">Verified</span>
                <p className="text-xs text-gray-500">Show verified badge</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#E8437A] focus:ring-[#E8437A]"
              />
              <div>
                <span className="text-sm font-medium">Featured</span>
                <p className="text-xs text-gray-500">Show on homepage</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#E8437A] hover:bg-[#d63a6d] py-6 text-lg font-semibold rounded-2xl shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Adding Service...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Service
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
