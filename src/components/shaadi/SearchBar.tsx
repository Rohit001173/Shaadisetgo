'use client';

import { Search, X, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const popularCities = ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Varanasi', 'Lucknow', 'Kanpur'];

interface SearchBarProps {
  variant?: 'default' | 'hero';
  onSearch?: (query: string, city: string) => void;
}

export function SearchBar({ variant = 'default', onSearch }: SearchBarProps) {
  const { searchQuery, setSearchQuery, selectedCity, setSelectedCity, setCurrentView } = useAppStore();
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [localCity, setLocalCity] = useState(selectedCity || '');

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalCity(selectedCity || '');
  }, [selectedCity]);

  const handleSearch = () => {
    setSearchQuery(localQuery);
    setSelectedCity(localCity);
    onSearch?.(localQuery, localCity);
    setCurrentView('vendors');
  };

  if (variant === 'hero') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for DJ, Catering, Photography..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#E8437A] focus:ring-2 focus:ring-[#E8437A]/20 outline-none transition-all"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="w-full sm:w-auto flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#E8437A] transition-colors min-w-[140px]"
            >
              <MapPin className="w-5 h-5 text-[#E8437A]" />
              <span className={cn('truncate', !localCity && 'text-gray-400')}>
                {localCity || 'Select City'}
              </span>
            </button>
            
            {showCityDropdown && (
              <div className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[160px] mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                {popularCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setLocalCity(city);
                      setShowCityDropdown(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 text-left hover:bg-[#FFF0F5] transition-colors',
                      localCity === city && 'bg-[#FFF0F5] text-[#E8437A]'
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-[#E8437A] to-pink-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search vendors..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#E8437A] focus:ring-2 focus:ring-[#E8437A]/20 outline-none transition-all"
      />
      {localQuery && (
        <button
          onClick={() => {
            setLocalQuery('');
            setSearchQuery('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}
