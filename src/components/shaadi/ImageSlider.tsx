'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: { id: string; imageUrl: string; isPrimary?: boolean }[];
  alt: string;
}

// Check if URL needs unoptimized mode
const needsUnoptimized = (url: string) => {
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
  
  // Return true if NOT a direct image URL (needs unoptimized mode)
  return !(hasImageExtension || isKnownDomain);
};

// Safe image URL - fallback for problematic URLs
const getSafeImageUrl = (url: string, hasError: boolean) => {
  if (hasError) return '/placeholder-vendor.jpg';
  if (!url || url.includes('photos.app.goo.gl') || url.includes('drive.google.com')) {
    return '/placeholder-vendor.jpg';
  }
  return url;
};

export function ImageSlider({ images, alt }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const sliderRef = useRef<HTMLDivElement>(null);

  const displayImages = images.length > 0 ? images : [{ id: 'placeholder', imageUrl: '/placeholder-vendor.jpg' }];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      goToPrev();
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  if (displayImages.length === 1) {
    const imgUrl = getSafeImageUrl(displayImages[0].imageUrl, imageErrors[0]);
    return (
      <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
        <Image
          src={imgUrl}
          alt={alt}
          fill
          unoptimized={needsUnoptimized(imgUrl)}
          className="object-cover"
          priority
          onError={() => handleImageError(0)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {displayImages.map((image, index) => {
            const imgUrl = getSafeImageUrl(image.imageUrl, imageErrors[index]);
            return (
              <div key={image.id} className="flex-shrink-0 w-full h-full relative">
                <Image
                  src={imgUrl}
                  alt={`${alt} - Image ${index + 1}`}
                  fill
                  unoptimized={needsUnoptimized(imgUrl)}
                  className="object-cover"
                  priority={index === 0}
                  onError={() => handleImageError(index)}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {displayImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'w-6 bg-[#E8437A]'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Thumbnail gallery for multiple images
export function ImageGallery({ images, alt }: ImageSliderProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const displayImages = images.length > 0 ? images : [{ id: 'placeholder', imageUrl: '/placeholder-vendor.jpg' }];

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden">
        <Image
          src={getSafeImageUrl(displayImages[selectedImage].imageUrl, imageErrors[selectedImage])}
          alt={alt}
          fill
          unoptimized={needsUnoptimized(displayImages[selectedImage].imageUrl)}
          className="object-cover"
          priority
          onError={() => handleImageError(selectedImage)}
        />
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {displayImages.map((image, index) => {
            const imgUrl = getSafeImageUrl(image.imageUrl, imageErrors[index]);
            return (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                  index === selectedImage
                    ? 'border-[#E8437A]'
                    : 'border-transparent opacity-70 hover:opacity-100'
                )}
              >
                <Image
                  src={imgUrl}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  unoptimized={needsUnoptimized(imgUrl)}
                  className="object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
