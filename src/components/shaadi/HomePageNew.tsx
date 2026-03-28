'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { 
  Search, MapPin, ChevronDown, Star, Heart, 
  ArrowRight, Check, SlidersHorizontal, X, Sparkles, BadgeCheck, Menu
} from 'lucide-react';
import type { Vendor } from '@/types';
import { weddingCategories, getAllSubcategories } from '@/lib/categories';

// Available locations - Bihar & UP
const availableLocations = [
  { id: 'patna', name: 'Patna', state: 'Bihar', emoji: '🏛️' },
  { id: 'gaya', name: 'Gaya', state: 'Bihar', emoji: '🕉️' },
  { id: 'muzaffarpur', name: 'Muzaffarpur', state: 'Bihar', emoji: '🍯' },
  { id: 'siwan', name: 'Siwan', state: 'Bihar', emoji: '🏰' },
  { id: 'gopalganj', name: 'Gopalganj', state: 'Bihar', emoji: '🌾' },
  { id: 'deoria', name: 'Deoria', state: 'UP', emoji: '🌿' },
  { id: 'kushinagar', name: 'Kushinagar', state: 'UP', emoji: '☸️' },
  { id: 'gorakhpur', name: 'Gorakhpur', state: 'UP', emoji: '🏯' },
];

// Home page categories - first 8 from wedding categories
const homeCategories = weddingCategories.slice(0, 8).map(cat => ({
  id: cat.id,
  name: cat.name.split(' ')[0],
  emoji: cat.icon,
  bgColor: `bg-[${cat.color}15]`,
  color: cat.color,
}));

// Banner slides data
const bannerSlides = [
  {
    id: 1,
    gradient: 'from-orange-400 to-amber-400',
    emoji: '📍',
    title: 'Apne Area ke Vendors Dhundho',
    subtitle: 'Location se search — turant contact karo',
    buttonText: 'Search',
  },
  {
    id: 2,
    gradient: 'from-purple-500 to-pink-500',
    emoji: '💒',
    title: 'Plan Your Dream Wedding',
    subtitle: 'Best vendors in Bihar & UP at best prices',
    buttonText: 'Explore',
  },
  {
    id: 3,
    gradient: 'from-teal-500 to-cyan-500',
    emoji: '💰',
    title: 'Save up to 30%',
    subtitle: 'Compare prices & get the best deals',
    buttonText: 'Compare',
  },
];

// Service cards for Top Rated section
const serviceCards = [
  { id: 1, name: 'Wedding Photography', nameHindi: 'वेडिंग फोटोग्राफी', emoji: '📸', gradient: 'from-violet-500 to-purple-600', rating: 4.9, reviews: 125, price: '₹25K', category: 'photography-videography' },
  { id: 2, name: 'Pandit Services', nameHindi: 'पंडित जी सर्विस', emoji: '🪔', gradient: 'from-orange-400 to-amber-500', rating: 4.8, reviews: 98, price: '₹15K', category: 'pandit-rituals' },
  { id: 3, name: 'Mehndi Artist', nameHindi: 'मेहंदी आर्टिस्ट', emoji: '🌿', gradient: 'from-green-500 to-emerald-600', rating: 4.9, reviews: 156, price: '₹8K', category: 'makeup-beauty' },
  { id: 4, name: 'Bridal Makeup', nameHindi: 'ब्राइडल मेकअप', emoji: '💄', gradient: 'from-pink-500 to-rose-600', rating: 4.7, reviews: 89, price: '₹20K', category: 'makeup-beauty' },
  { id: 5, name: 'DJ & Music', nameHindi: 'डीजे और म्यूजिक', emoji: '🎵', gradient: 'from-indigo-500 to-blue-600', rating: 4.8, reviews: 203, price: '₹30K', category: 'dj-music' },
  { id: 6, name: 'Catering', nameHindi: 'केटरिंग सर्विस', emoji: '🍽️', gradient: 'from-amber-500 to-orange-600', rating: 4.7, reviews: 178, price: '₹35K', category: 'catering-food' },
  { id: 7, name: 'Decoration', nameHindi: 'डेकोरेशन', emoji: '🎨', gradient: 'from-fuchsia-500 to-pink-600', rating: 4.9, reviews: 145, price: '₹50K', category: 'decoration-setup' },
  { id: 8, name: 'Tent House', nameHindi: 'टेंट हाउस', emoji: '🎪', gradient: 'from-teal-500 to-cyan-600', rating: 4.6, reviews: 67, price: '₹40K', category: 'tent-furniture' },
];

interface SearchResult {
  type: 'category' | 'subcategory' | 'vendor' | 'location';
  id: string;
  name: string;
  nameHindi?: string;
  emoji?: string;
  category?: string;
  color?: string;
  city?: string;
  rating?: number;
  priceStart?: number;
}

export function HomePageNew() {
  const { setCurrentView, setSelectedCategory, setSelectedVendor, setSelectedCity, vendors } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all subcategories for search
  const allSubcategories = useMemo(() => getAllSubcategories(), []);

  // Auto-slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Search results - comprehensive search across categories, vendors, services, locations
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search in categories
    weddingCategories.forEach(cat => {
      if (cat.name.toLowerCase().includes(query) || 
          (cat.nameHindi && cat.nameHindi.includes(query))) {
        results.push({
          type: 'category',
          id: cat.id,
          name: cat.name,
          nameHindi: cat.nameHindi,
          emoji: cat.icon,
          color: cat.color,
        });
      }
    });

    // Search in subcategories
    allSubcategories.forEach(item => {
      if (item.subcategory.name.toLowerCase().includes(query) ||
          (item.subcategory.nameHindi && item.subcategory.nameHindi.includes(query))) {
        results.push({
          type: 'subcategory',
          id: item.subcategory.id,
          name: item.subcategory.name,
          nameHindi: item.subcategory.nameHindi,
          emoji: weddingCategories.find(c => c.id === item.categoryId)?.icon,
          category: item.categoryName,
        });
      }
    });

    // Search in vendors
    vendors.forEach(vendor => {
      if (vendor.name.toLowerCase().includes(query) ||
          vendor.category.toLowerCase().includes(query) ||
          (vendor.area && vendor.area.toLowerCase().includes(query)) ||
          vendor.city.toLowerCase().includes(query)) {
        results.push({
          type: 'vendor',
          id: vendor.id,
          name: vendor.name,
          emoji: weddingCategories.find(c => c.id === vendor.category.toLowerCase())?.icon || '💒',
          category: vendor.category,
          city: vendor.city,
          rating: vendor.rating,
          priceStart: vendor.priceStart,
        });
      }
    });

    // Search in locations
    availableLocations.forEach(loc => {
      if (loc.name.toLowerCase().includes(query)) {
        results.push({
          type: 'location',
          id: loc.id,
          name: loc.name,
          emoji: loc.emoji,
        });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, vendors, allSubcategories]);

  // Filter vendors by selected location
  const filteredVendors = useMemo(() => {
    let filtered = [...vendors];
    
    if (selectedLocation) {
      filtered = filtered.filter(v => 
        v.city.toLowerCase() === selectedLocation.toLowerCase() ||
        (v.area && v.area.toLowerCase().includes(selectedLocation.toLowerCase()))
      );
    }
    
    return filtered.sort((a, b) => b.rating - a.rating);
  }, [vendors, selectedLocation]);

  const topRatedVendors = filteredVendors.slice(0, 10);

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      setCurrentView('vendors');
    } else {
      setSelectedCategory(categoryId);
      setCurrentView('vendors');
    }
  };

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('vendor-detail');
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    switch (result.type) {
      case 'category':
        setSelectedCategory(result.id);
        setCurrentView('vendors');
        break;
      case 'subcategory':
        setSelectedCategory(result.category);
        setCurrentView('vendors');
        break;
      case 'vendor':
        const vendor = vendors.find(v => v.id === result.id);
        if (vendor) {
          setSelectedVendor(vendor);
          setCurrentView('vendor-detail');
        }
        break;
      case 'location':
        setSelectedLocation(result.name);
        setSelectedCity(result.name);
        setCurrentView('vendors');
        break;
    }
  };

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
    setSelectedCity(locationName);
    setShowLocationDropdown(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setSelectedCity(null);
  };

  const toggleWishlist = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* ========== DESKTOP HEADER (Hidden on Mobile) ========== */}
      <div className="hidden lg:block bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E8437A] to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💒</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#E8437A]">ShaadiSetGo</h1>
                <p className="text-xs text-gray-500">Bihar & UP's #1 Wedding Marketplace</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-8">
              <button onClick={() => setCurrentView('home')} className="text-gray-700 hover:text-[#E8437A] font-medium">Home</button>
              <button onClick={() => setCurrentView('categories')} className="text-gray-700 hover:text-[#E8437A] font-medium">Categories</button>
              <button onClick={() => setCurrentView('vendors')} className="text-gray-700 hover:text-[#E8437A] font-medium">Vendors</button>
              <button onClick={() => setCurrentView('bookings')} className="text-gray-700 hover:text-[#E8437A] font-medium">Bookings</button>
            </nav>

            {/* Location & Search */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-[#E8437A] transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[#E8437A]" />
                  <span className="font-medium">{selectedLocation || 'Select Location'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border z-50 min-w-[200px]">
                    <div className="px-3 py-2 bg-gray-50 border-b">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Bihar</p>
                    </div>
                    {availableLocations.filter(l => l.state === 'Bihar').map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleLocationSelect(loc.name)}
                        className={cn(
                          'w-full px-4 py-2.5 text-left hover:bg-pink-50 flex items-center gap-2',
                          selectedLocation === loc.name ? 'bg-pink-50 text-[#E8437A] font-semibold' : 'text-gray-700'
                        )}
                      >
                        <span>{loc.emoji}</span> {loc.name}
                      </button>
                    ))}
                    <div className="px-3 py-2 bg-gray-50 border-b border-t">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Uttar Pradesh</p>
                    </div>
                    {availableLocations.filter(l => l.state === 'UP').map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleLocationSelect(loc.name)}
                        className={cn(
                          'w-full px-4 py-2.5 text-left hover:bg-pink-50 flex items-center gap-2',
                          selectedLocation === loc.name ? 'bg-pink-50 text-[#E8437A] font-semibold' : 'text-gray-700'
                        )}
                      >
                        <span>{loc.emoji}</span> {loc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services, vendors, locations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8437A]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="p-3 text-left hover:bg-pink-50 rounded-xl border border-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFF0F5] flex items-center justify-center text-xl">
                          {result.emoji || '🔍'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{result.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========== MOBILE HEADER (Hidden on Desktop) ========== */}
      <div className="lg:hidden bg-gradient-to-b from-[#E8437A] to-[#F472B6] pt-3 pb-5 px-4">
        {/* Top Row - Logo and Location */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-xl">💒</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">ShaadiSetGo</h1>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border-2 border-pink-200 text-pink-600 text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span className="max-w-[80px] truncate">{selectedLocation || 'Location'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden min-w-[200px]">
                <div className="px-3 py-2 bg-gray-50 border-b">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Bihar</p>
                </div>
                {availableLocations.filter(l => l.state === 'Bihar').map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleLocationSelect(loc.name)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm hover:bg-pink-50 flex items-center gap-2',
                      selectedLocation === loc.name ? 'bg-pink-50 text-[#E8437A] font-semibold' : 'text-gray-700'
                    )}
                  >
                    <span className="text-lg">{loc.emoji}</span>
                    <span>{loc.name}</span>
                  </button>
                ))}
                <div className="px-3 py-2 bg-gray-50 border-b border-t">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Uttar Pradesh</p>
                </div>
                {availableLocations.filter(l => l.state === 'UP').map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleLocationSelect(loc.name)}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm hover:bg-pink-50 flex items-center gap-2',
                      selectedLocation === loc.name ? 'bg-pink-50 text-[#E8437A] font-semibold' : 'text-gray-700'
                    )}
                  >
                    <span className="text-lg">{loc.emoji}</span>
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-[#E8437A]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Service, vendor, ya area dhundho..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                className="w-full pl-11 pr-10 py-3.5 bg-white rounded-xl text-sm placeholder:text-gray-400 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border z-50 max-h-[60vh] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-4 py-3 text-left hover:bg-pink-50 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FFF0F5] flex items-center justify-center text-xl">
                        {result.emoji || '🔍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">Koi result nahi mila</p>
                  <p className="text-gray-400 text-sm mt-1">&quot;{searchQuery}&quot; ke liye koi service nahi hai</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trust Strip - Mobile */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-gray-700 text-xs font-medium">
            <Check className="w-4 h-4 text-green-500" />
            Top Verified
          </span>
          <span className="flex items-center gap-1.5 text-gray-700 text-xs font-medium">
            📋 Free Booking
          </span>
          <span className="flex items-center gap-1.5 text-gray-700 text-xs font-medium">
            <MapPin className="w-4 h-4 text-red-500" />
            Bihar & UP
          </span>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="lg:max-w-7xl lg:mx-auto lg:px-6">
        
        {/* Selected Location Banner */}
        {selectedLocation && (
          <div className="mx-4 mt-4 lg:mx-0 lg:mt-6 bg-gradient-to-r from-[#E8437A] to-pink-400 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{selectedLocation} ke vendors</span>
            </div>
            <button
              onClick={clearLocation}
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* ========== AUTO-SLIDING BANNER ========== */}
        <div className="px-4 mt-4 lg:mx-0 lg:mt-6">
          <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerSlides.map((slide) => (
                <div
                  key={slide.id}
                  className={cn(
                    'min-w-full p-5 lg:p-8 relative overflow-hidden',
                    'bg-gradient-to-r',
                    slide.gradient
                  )}
                >
                  <div className="flex items-start gap-3 lg:gap-6 relative z-10">
                    <div className="text-3xl lg:text-5xl">{slide.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg lg:text-2xl">{slide.title}</h3>
                      <p className="text-white/90 text-sm lg:text-base mt-0.5">{slide.subtitle}</p>
                      <button className="mt-3 lg:mt-4 px-5 py-2 lg:px-6 lg:py-3 bg-white rounded-xl text-gray-800 font-semibold text-sm lg:text-base hover:bg-gray-50 transition-colors">
                        {slide.buttonText}
                      </button>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 lg:w-40 lg:h-40 bg-white/10 rounded-full" />
                  <div className="absolute right-8 top-4 w-12 h-12 lg:w-20 lg:h-20 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-1.5 mt-3">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  index === currentSlide 
                    ? 'w-5 h-1.5 bg-[#E8437A]' 
                    : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                )}
              />
            ))}
          </div>
        </div>

        {/* ========== CATEGORY SECTION ========== */}
        <div className="mt-6 lg:mt-10">
          <div className="px-4 lg:px-0 flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Category se dekho</h2>
            <button 
              onClick={() => setCurrentView('categories')}
              className="flex items-center gap-1 text-[#E8437A] text-sm font-medium"
            >
              All {weddingCategories.length} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Mobile: Horizontal Scroll */}
          <div 
            ref={categoryScrollRef}
            className="flex gap-4 px-4 overflow-x-auto hide-scrollbar py-2 lg:hidden"
          >
            <button
              onClick={() => {
                setSelectedCategory(null);
                setCurrentView('vendors');
              }}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-[#E8437A] to-pink-400">
                🎊
              </div>
              <span className="text-xs text-gray-600 font-medium">All</span>
            </button>
            
            {homeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  {category.emoji}
                </div>
                <span className="text-xs text-gray-600 font-medium text-center leading-tight">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-13 gap-4">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setCurrentView('vendors');
              }}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white hover:shadow-lg transition-all border border-gray-100 group"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br from-[#E8437A] to-pink-400 group-hover:scale-110 transition-transform">
                🎊
              </div>
              <span className="text-sm text-gray-700 font-medium">All</span>
            </button>
            
            {weddingCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white hover:shadow-lg transition-all border border-gray-100 group"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  {category.icon}
                </div>
                <span className="text-xs text-gray-700 font-medium text-center leading-tight">{category.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========== TOP RATED SERVICES SECTION ========== */}
        <div className="mt-6 lg:mt-10 px-4 lg:px-0">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-base lg:text-xl font-bold text-gray-900">Top Rated Services ⭐</h2>
            <button 
              onClick={() => setCurrentView('vendors')}
              className="flex items-center gap-1 text-[#E8437A] text-xs lg:text-sm font-medium"
            >
              Sab dekho <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 lg:hidden">
            {serviceCards.map((service) => {
              const isWishlisted = wishlist.has(service.id);
              
              return (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedCategory(service.category);
                    setCurrentView('vendors');
                  }}
                  className="flex-shrink-0 w-[140px] bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className={cn(
                    'relative h-20 flex items-center justify-center',
                    'bg-gradient-to-br',
                    service.gradient
                  )}>
                    <span className="text-4xl opacity-90 group-hover:scale-110 transition-transform duration-300">{service.emoji}</span>
                    
                    <button
                      onClick={(e) => toggleWishlist(e, service.id)}
                      className={cn(
                        'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all',
                        isWishlisted 
                          ? 'bg-[#E8437A] text-white' 
                          : 'bg-white/80 text-gray-400 hover:text-[#E8437A]'
                      )}
                    >
                      <Heart className={cn('w-3 h-3', isWishlisted && 'fill-current')} />
                    </button>
                    
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-gray-800">{service.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-2.5">
                    <h3 className="font-semibold text-gray-900 text-xs truncate">{service.name}</h3>
                    <p className="text-[10px] text-gray-400 truncate">{service.nameHindi}</p>
                    <p className="text-[#E8437A] font-bold text-sm mt-1">{service.price}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {serviceCards.map((service) => {
              const isWishlisted = wishlist.has(service.id);
              
              return (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedCategory(service.category);
                    setCurrentView('vendors');
                  }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className={cn(
                    'relative h-36 flex items-center justify-center',
                    'bg-gradient-to-br',
                    service.gradient
                  )}>
                    <span className="text-6xl opacity-90 group-hover:scale-110 transition-transform duration-300">{service.emoji}</span>
                    
                    <button
                      onClick={(e) => toggleWishlist(e, service.id)}
                      className={cn(
                        'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md',
                        isWishlisted 
                          ? 'bg-[#E8437A] text-white' 
                          : 'bg-white/90 text-gray-400 hover:text-[#E8437A]'
                      )}
                    >
                      <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
                    </button>
                    
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-full shadow-md">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-gray-800">{service.rating}</span>
                      <span className="text-xs text-gray-500">({service.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{service.nameHindi}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="text-[#E8437A] font-bold text-lg">{service.price}</p>
                      </div>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-[#FFF0F5] text-[#E8437A] rounded-xl text-sm font-semibold group-hover:bg-[#E8437A] group-hover:text-white transition-colors">
                        View
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== FEATURED VENDORS ========== */}
        {topRatedVendors.length > 0 && (
          <div className="mt-8 lg:mt-12 px-4 lg:px-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E8437A]" />
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">Featured Vendors</h2>
              </div>
              <button 
                onClick={() => setCurrentView('vendors')}
                className="flex items-center gap-1 text-[#E8437A] text-sm font-medium"
              >
                Sab dekho <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Mobile: Vertical Cards */}
            <div className="space-y-4 lg:hidden">
              {topRatedVendors.slice(0, 4).map((vendor) => {
                const categoryData = weddingCategories.find(c => 
                  c.id === vendor.category.toLowerCase() || 
                  c.name.toLowerCase() === vendor.category.toLowerCase() ||
                  c.subcategories.some(s => s.name.toLowerCase() === vendor.category.toLowerCase())
                );
                
                return (
                  <div
                    key={vendor.id}
                    onClick={() => handleVendorClick(vendor)}
                    className="bg-white rounded-2xl shadow-lg cursor-pointer border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
                  >
                    <div className="flex">
                      <div className="relative w-32 h-32 bg-gray-100 flex-shrink-0 overflow-hidden">
                        {vendor.images?.[0]?.imageUrl ? (
                          <>
                            <Image
                              src={vendor.images[0].imageUrl}
                              alt={vendor.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-4xl relative"
                            style={{ backgroundColor: categoryData ? `${categoryData.color}15` : '#FFF0F5' }}
                          >
                            {categoryData?.icon || '💒'}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
                          </div>
                        )}
                        {vendor.isVerified && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#E8437A] to-pink-400 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-gray-800">{vendor.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-[#E8437A] transition-colors">{vendor.name}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                            <span className="text-base">{categoryData?.icon || '💒'}</span>
                            <span className="truncate">{vendor.category}</span>
                            <span className="text-gray-300">•</span>
                            <MapPin className="w-3 h-3 text-[#E8437A]" />
                            <span className="truncate">{vendor.area || vendor.city}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase">Starting from</p>
                            <p className="text-[#E8437A] font-bold text-lg">
                              ₹{vendor.priceStart ? (vendor.priceStart / 1000).toFixed(0) + 'K' : 'Contact'}
                            </p>
                          </div>
                          <button className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-[#E8437A] to-pink-400 text-white rounded-xl text-xs font-semibold group-hover:shadow-md transition-all">
                            View Details
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6">
              {topRatedVendors.slice(0, 6).map((vendor) => {
                const categoryData = weddingCategories.find(c => 
                  c.id === vendor.category.toLowerCase() || 
                  c.name.toLowerCase() === vendor.category.toLowerCase() ||
                  c.subcategories.some(s => s.name.toLowerCase() === vendor.category.toLowerCase())
                );
                
                return (
                  <div
                    key={vendor.id}
                    onClick={() => handleVendorClick(vendor)}
                    className="bg-white rounded-2xl shadow-md cursor-pointer border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
                  >
                    <div className="flex">
                      <div className="relative w-40 h-40 bg-gray-100 flex-shrink-0 overflow-hidden">
                        {vendor.images?.[0]?.imageUrl ? (
                          <>
                            <Image
                              src={vendor.images[0].imageUrl}
                              alt={vendor.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-5xl relative"
                            style={{ backgroundColor: categoryData ? `${categoryData.color}15` : '#FFF0F5' }}
                          >
                            {categoryData?.icon || '💒'}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />
                          </div>
                        )}
                        {vendor.isVerified && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#E8437A] to-pink-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                            <BadgeCheck className="w-4 h-4" />
                            Verified
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-gray-800">{vendor.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({vendor.reviewsCount})</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-5 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-xl truncate group-hover:text-[#E8437A] transition-colors">{vendor.name}</h3>
                          <p className="text-gray-500 text-base flex items-center gap-2 mt-2">
                            <span className="text-xl">{categoryData?.icon || '💒'}</span>
                            <span className="truncate">{vendor.category}</span>
                            <span className="text-gray-300">•</span>
                            <MapPin className="w-4 h-4 text-[#E8437A]" />
                            <span className="truncate">{vendor.area || vendor.city}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 uppercase">Starting from</p>
                            <p className="text-[#E8437A] font-bold text-2xl">
                              ₹{vendor.priceStart ? (vendor.priceStart / 1000).toFixed(0) + 'K' : 'Contact'}
                            </p>
                          </div>
                          <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#E8437A] to-pink-400 text-white rounded-xl font-semibold group-hover:shadow-lg transition-all">
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No vendors in selected location */}
        {selectedLocation && topRatedVendors.length === 0 && (
          <div className="mt-6 px-4 lg:px-0">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-20 h-20 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-[#E8437A]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {selectedLocation} mein koi vendor nahi mila
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Is location pe abhi koi service available nahi hai. Dusri location try karein.
              </p>
              <button
                onClick={clearLocation}
                className="px-6 py-2.5 bg-[#E8437A] text-white rounded-xl font-medium hover:bg-[#d63a6d] transition-colors"
              >
                Location Clear Karein
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { HomePageNew as HomePage };
