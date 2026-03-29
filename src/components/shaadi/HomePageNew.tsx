'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAppStore, type Service } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { 
  Search, MapPin, ChevronDown, Star, Heart, Phone, MessageCircle,
  ArrowRight, Check, X, Sparkles, BadgeCheck
} from 'lucide-react';
import type { Vendor } from '@/types';
import { weddingCategories } from '@/lib/categories';

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

interface SearchResult {
  type: 'category' | 'vendor' | 'service' | 'location';
  id: string;
  name: string;
  emoji?: string;
  category?: string;
  city?: string;
  price?: number;
  service?: Service;
}

// Parse service description to extract details
function parseServiceDescription(description: string | null) {
  if (!description) return { vendorName: '', contact: '', whatsapp: '', pricing: '', about: '' };
  
  const lines = description.split('\n');
  const result: { vendorName: string; contact: string; whatsapp: string; pricing: string; about: string } = {
    vendorName: '',
    contact: '',
    whatsapp: '',
    pricing: '',
    about: ''
  };
  
  let aboutLines: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('Vendor:')) {
      result.vendorName = line.replace('Vendor:', '').trim();
    } else if (line.startsWith('Contact:')) {
      result.contact = line.replace('Contact:', '').trim();
    } else if (line.startsWith('WhatsApp:')) {
      result.whatsapp = line.replace('WhatsApp:', '').trim();
    } else if (line.startsWith('Pricing:')) {
      result.pricing = line.replace('Pricing:', '').trim();
    } else if (line.trim() && !line.startsWith('Vendor:') && !line.startsWith('Contact:') && !line.startsWith('WhatsApp:') && !line.startsWith('Pricing:')) {
      aboutLines.push(line);
    }
  }
  
  result.about = aboutLines.join('\n').trim();
  return result;
}

export function HomePageNew() {
  const { setCurrentView, setSelectedCategory, setSelectedVendor, setSelectedCity, setSelectedService, vendors, services } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedServiceData, setSelectedServiceData] = useState<Service | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Search in services (PRIORITY)
    if (services && services.length > 0) {
      services.forEach(service => {
        if (service.service_name?.toLowerCase().includes(query) ||
            service.category?.toLowerCase().includes(query) ||
            service.city?.toLowerCase().includes(query) ||
            service.description?.toLowerCase().includes(query)) {
          results.push({
            type: 'service',
            id: service.id,
            name: service.service_name,
            emoji: weddingCategories.find(c => c.name.toLowerCase() === service.category?.toLowerCase())?.icon || '💒',
            category: service.category,
            city: service.city,
            price: service.price,
            service: service,
          });
        }
      });
    }

    // Search in categories
    weddingCategories.forEach(cat => {
      if (cat.name.toLowerCase().includes(query)) {
        results.push({
          type: 'category',
          id: cat.id,
          name: cat.name,
          emoji: cat.icon,
        });
      }
    });

    // Search in vendors
    vendors.forEach(vendor => {
      if (vendor.name.toLowerCase().includes(query) ||
          vendor.category.toLowerCase().includes(query) ||
          vendor.city.toLowerCase().includes(query)) {
        results.push({
          type: 'vendor',
          id: vendor.id,
          name: vendor.name,
          emoji: weddingCategories.find(c => c.id === vendor.category.toLowerCase())?.icon || '💒',
          category: vendor.category,
          city: vendor.city,
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
  }, [searchQuery, vendors, services]);

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

  // Filter services by selected location
  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) return [];
    
    if (selectedLocation) {
      return services.filter(s => s.city?.toLowerCase() === selectedLocation.toLowerCase());
    }
    return services;
  }, [services, selectedLocation]);

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

  const handleServiceClick = (service: Service) => {
    setSelectedServiceData(service);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    switch (result.type) {
      case 'category':
        setSelectedCategory(result.id);
        setCurrentView('vendors');
        break;
      case 'service':
        if (result.service) {
          setSelectedServiceData(result.service);
        }
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

  // Service Detail Modal
  const renderServiceDetail = () => {
    if (!selectedServiceData) return null;
    
    const parsed = parseServiceDescription(selectedServiceData.description);
    const categoryIcon = weddingCategories.find(c => c.name.toLowerCase() === selectedServiceData.category?.toLowerCase())?.icon || '💒';

    return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-end lg:items-center justify-center">
        <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-3xl lg:rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-br from-[#E8437A] to-pink-400">
            {selectedServiceData.image_url ? (
              <img 
                src={selectedServiceData.image_url} 
                alt={selectedServiceData.service_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {categoryIcon}
              </div>
            )}
            <button
              onClick={() => setSelectedServiceData(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedServiceData.service_name}</h2>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <span>{categoryIcon}</span>
                <span>{selectedServiceData.category}</span>
                <span>•</span>
                <MapPin className="w-4 h-4" />
                <span>{selectedServiceData.city}</span>
              </p>
            </div>

            {/* Price */}
            <div className="bg-[#FFF0F5] rounded-xl p-4">
              <p className="text-sm text-gray-500">Starting Price</p>
              <p className="text-2xl font-bold text-[#E8437A]">
                {selectedServiceData.price ? `₹${selectedServiceData.price.toLocaleString()}` : 'Contact for Price'}
              </p>
              {parsed.pricing && (
                <p className="text-sm text-gray-500 mt-1">{parsed.pricing}</p>
              )}
            </div>

            {/* Vendor Info */}
            {parsed.vendorName && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Vendor</p>
                <p className="font-semibold text-gray-900">{parsed.vendorName}</p>
              </div>
            )}

            {/* Description */}
            {parsed.about && (
              <div>
                <p className="text-sm text-gray-500 mb-1">About</p>
                <p className="text-gray-700">{parsed.about}</p>
              </div>
            )}

            {/* Contact Buttons */}
            <div className="flex gap-3 pt-4">
              {parsed.contact && (
                <a
                  href={`tel:${parsed.contact}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#E8437A] text-white py-3 rounded-xl font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              )}
              {parsed.whatsapp && (
                <a
                  href={`https://wa.me/91${parsed.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I found your service "${selectedServiceData.service_name}" on ShaadiSetGo. Please share more details.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
            </div>

            {/* Fallback contact */}
            {!parsed.contact && !parsed.whatsapp && (
              <p className="text-center text-gray-500 text-sm">
                Contact information not available
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Service Detail Modal */}
      {selectedServiceData && renderServiceDetail()}

      {/* ========== MOBILE HEADER ========== */}
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
                        <p className="text-xs text-gray-500 capitalize">{result.type} {result.city && `• ${result.city}`}</p>
                      </div>
                      {result.price && (
                        <p className="text-[#E8437A] font-semibold text-sm">₹{result.price.toLocaleString()}</p>
                      )}
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
              <span className="font-medium">{selectedLocation} ke services</span>
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
          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerSlides.map((slide) => (
                <div
                  key={slide.id}
                  className={cn(
                    'min-w-full p-5 relative overflow-hidden',
                    'bg-gradient-to-r',
                    slide.gradient
                  )}
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="text-3xl">{slide.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{slide.title}</h3>
                      <p className="text-white/90 text-sm mt-0.5">{slide.subtitle}</p>
                    </div>
                  </div>
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
                    : 'w-1.5 h-1.5 bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>

        {/* ========== CATEGORY SECTION ========== */}
        <div className="mt-6">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Category se dekho</h2>
            <button 
              onClick={() => setCurrentView('categories')}
              className="flex items-center gap-1 text-[#E8437A] text-sm font-medium"
            >
              All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Horizontal Scroll */}
          <div 
            ref={categoryScrollRef}
            className="flex gap-4 px-4 overflow-x-auto hide-scrollbar py-2"
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
        </div>

        {/* ========== SERVICES SECTION (Only Admin Added) ========== */}
        {filteredServices.length > 0 && (
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Services ⭐</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredServices.map((service) => {
                const categoryIcon = weddingCategories.find(c => c.name.toLowerCase() === service.category?.toLowerCase())?.icon || '💒';
                
                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="relative h-28 bg-gray-100">
                      {service.image_url ? (
                        <img 
                          src={service.image_url} 
                          alt={service.service_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-[#E8437A]/10 to-pink-100">
                          {categoryIcon}
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-gray-700">
                        {categoryIcon} {service.category}
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{service.service_name}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {service.city}
                      </p>
                      <p className="text-[#E8437A] font-bold text-sm mt-1">
                        {service.price ? `₹${service.price.toLocaleString()}` : 'Contact'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== FEATURED VENDORS ========== */}
        {topRatedVendors.length > 0 && (
          <div className="mt-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E8437A]" />
                <h2 className="text-lg font-bold text-gray-900">Featured Vendors</h2>
              </div>
              <button 
                onClick={() => setCurrentView('vendors')}
                className="flex items-center gap-1 text-[#E8437A] text-sm font-medium"
              >
                Sab dekho <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Vertical Cards */}
            <div className="space-y-4">
              {topRatedVendors.slice(0, 4).map((vendor) => {
                const categoryData = weddingCategories.find(c => 
                  c.id === vendor.category.toLowerCase() || 
                  c.name.toLowerCase() === vendor.category.toLowerCase()
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
                          <Image
                            src={vendor.images[0].imageUrl}
                            alt={vendor.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-4xl"
                            style={{ backgroundColor: categoryData ? `${categoryData.color}15` : '#FFF0F5' }}
                          >
                            {categoryData?.icon || '💒'}
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
                            <p className="text-[10px] text-gray-400 uppercase">Starting</p>
                            <p className="text-[#E8437A] font-bold text-base">
                              {vendor.priceStart ? `₹${vendor.priceStart.toLocaleString()}+` : 'Contact'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredServices.length === 0 && topRatedVendors.length === 0 && (
          <div className="mt-10 px-4 text-center py-12">
            <div className="w-20 h-20 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💒</span>
            </div>
            <p className="text-gray-600 font-medium">No services found</p>
            <p className="text-gray-400 text-sm mt-1">Try changing location or search for something else</p>
          </div>
        )}
      </div>
    </div>
  );
}
