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
      label: 'Admin Portal',
      description: 'Manage vendors & services',
      onClick: () => window.location.href = '/admin',
      show: true,
      badge: undefined,
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
