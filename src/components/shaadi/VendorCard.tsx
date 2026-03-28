'use client';

import Image from 'next/image';
import { Star, MapPin, BadgeCheck, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/types';
import { weddingCategories } from '@/lib/categories';

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured' | 'large';
}

// Check if URL is a direct image URL or needs special handling
const isDirectImageUrl = (url: string) => {
  // Check for common image file extensions
  const imageExtensionRegex = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i;
  const hasImageExtension = imageExtensionRegex.test(url);
  
  // Check for known image hosting domains
  const knownImageDomains = [
    'images.unsplash.com',
    'supabase.co',
    'imgur.com',
    'i.imgur.com',
    'cloudinary.com',
    'res.cloudinary.com',
  ];
  const isKnownDomain = knownImageDomains.some(domain => url.includes(domain));
  
  return hasImageExtension || isKnownDomain;
};

// Get image URL with fallback
const getSafeImageUrl = (url: string) => {
  if (!url || url === '/placeholder-vendor.jpg') return '/placeholder-vendor.jpg';
  
  // If it's a Google Photos short URL or other redirect URL, use unoptimized mode
  if (url.includes('photos.app.goo.gl') || url.includes('drive.google.com')) {
    // These are redirect URLs and won't work directly with next/image
    return '/placeholder-vendor.jpg';
  }
  
  return url;
};

export function VendorCard({ vendor, onClick, variant = 'default' }: VendorCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const rawImage = vendor.images?.find(img => img.isPrimary)?.imageUrl || 
                   vendor.images?.[0]?.imageUrl || 
                   '/placeholder-vendor.jpg';
  
  const primaryImage = imageError ? '/placeholder-vendor.jpg' : getSafeImageUrl(rawImage);
  
  // Check if we should use unoptimized mode for this image
  const shouldUseUnoptimized = !isDirectImageUrl(primaryImage) && primaryImage !== '/placeholder-vendor.jpg';

  // Find matching category
  const categoryData = weddingCategories.find(c => 
    c.id === vendor.category.toLowerCase() || 
    c.name.toLowerCase() === vendor.category.toLowerCase()
  );

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className="flex-shrink-0 w-44 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="relative h-32 bg-gray-100">
          <Image
            src={primaryImage}
            alt={vendor.name}
            fill
            unoptimized={shouldUseUnoptimized}
            className="object-cover"
            onError={() => setImageError(true)}
          />
          {vendor.isVerified && (
            <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1">
              <BadgeCheck className="w-3.5 h-3.5 text-[#E8437A]" />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{vendor.name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{vendor.city}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-[#E8437A]">
              {vendor.priceStart ? formatPrice(vendor.priceStart) + '+' : 'Contact'}
            </span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs">{vendor.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200 group"
      >
        {/* Image Section - Much Bigger */}
        <div className="relative aspect-[16/10] bg-gray-100">
          <Image
            src={primaryImage}
            alt={vendor.name}
            fill
            unoptimized={shouldUseUnoptimized}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {vendor.isFeatured && (
              <span className="bg-gradient-to-r from-[#E8437A] to-pink-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={cn(
                'ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg',
                isLiked 
                  ? 'bg-[#E8437A] text-white' 
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              )}
            >
              <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
            </button>
          </div>

          {/* Bottom badges */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            {vendor.isVerified && (
              <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                <BadgeCheck className="w-4 h-4 text-[#E8437A]" />
                <span className="text-sm font-semibold text-gray-700">Verified</span>
              </div>
            )}
            <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-gray-800">{vendor.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({vendor.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Content - Enhanced with more padding */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl truncate">{vendor.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{categoryData?.icon || '💒'}</span>
                <p className="text-gray-500 truncate">{vendor.category}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mt-3 text-gray-600">
            <MapPin className="w-4 h-4 text-[#E8437A]" />
            <span className="text-sm">{vendor.area ? `${vendor.area}, ` : ''}{vendor.city}</span>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Starting from</p>
              <p className="text-[#E8437A] font-bold text-2xl">
                {vendor.priceLabel || (vendor.priceStart ? `₹${vendor.priceStart.toLocaleString()}` : 'Contact')}
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#E8437A] to-pink-400 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default - Enhanced card
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200 group"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={primaryImage}
          alt={vendor.name}
          fill
          unoptimized={shouldUseUnoptimized}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {vendor.isFeatured && (
            <span className="bg-gradient-to-r from-[#E8437A] to-pink-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={cn(
              'ml-auto w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md',
              isLiked 
                ? 'bg-[#E8437A] text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-white'
            )}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
          </button>
        </div>

        {vendor.isVerified && (
          <div className="absolute bottom-3 right-3 bg-white rounded-full px-2.5 py-1 flex items-center gap-1 shadow-md">
            <BadgeCheck className="w-4 h-4 text-[#E8437A]" />
            <span className="text-xs font-semibold text-gray-700">Verified</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{vendor.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-base">{categoryData?.icon || '💒'}</span>
              <p className="text-sm text-gray-500 truncate">{vendor.category} • {vendor.area || vendor.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-amber-700">{vendor.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({vendor.reviewsCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-[#E8437A] font-bold text-xl">
              {vendor.priceLabel || (vendor.priceStart ? `₹${vendor.priceStart.toLocaleString()}` : 'Contact for price')}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <MapPin className="w-4 h-4 text-[#E8437A]" />
              <span>{vendor.city}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
