'use client';

import { useState } from 'react';
import { Calendar, Users, Clock, Phone, User, Mail, MessageSquare, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/types';

interface BookingFormProps {
  vendor: Vendor;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isSubmitting?: boolean;
}

interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string;
  city: string;
  functionType: string;
  guests: string;
  timing: string;
  specialRequest: string;
}

const functionTypes = [
  'Wedding',
  'Reception',
  'Engagement',
  'Mehndi',
  'Sangeet',
  'Haldi',
  'Tilak',
  'Birthday',
  'Anniversary',
  'Corporate Event',
  'Other',
];

const cities = ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Varanasi', 'Lucknow', 'Kanpur', 'Other'];

export function BookingForm({ vendor, onSubmit, isSubmitting = false }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventDate: '',
    city: vendor.city,
    functionType: '',
    guests: '',
    timing: '',
    specialRequest: '',
  });

  const [showFunctionDropdown, setShowFunctionDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Enter a valid 10-digit phone number';
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (!formData.functionType) {
      newErrors.functionType = 'Function type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const updateField = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Your Name *</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={formData.customerName}
            onChange={(e) => updateField('customerName', e.target.value)}
            className={cn('pl-10', errors.customerName && 'border-red-500 focus-visible:ring-red-500')}
          />
        </div>
        {errors.customerName && <p className="text-sm text-red-500">{errors.customerName}</p>}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={formData.customerPhone}
            onChange={(e) => updateField('customerPhone', e.target.value)}
            className={cn('pl-10', errors.customerPhone && 'border-red-500 focus-visible:ring-red-500')}
            maxLength={10}
          />
        </div>
        {errors.customerPhone && <p className="text-sm text-red-500">{errors.customerPhone}</p>}
      </div>

      {/* Email (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.customerEmail}
            onChange={(e) => updateField('customerEmail', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Event Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Event Date *</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="date"
            type="date"
            value={formData.eventDate}
            onChange={(e) => updateField('eventDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={cn('pl-10', errors.eventDate && 'border-red-500 focus-visible:ring-red-500')}
          />
        </div>
        {errors.eventDate && <p className="text-sm text-red-500">{errors.eventDate}</p>}
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border text-left',
              errors.city ? 'border-red-500' : 'border-gray-200'
            )}
          >
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className={cn('flex-1', !formData.city && 'text-gray-400')}>
              {formData.city || 'Select city'}
            </span>
            <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', showCityDropdown && 'rotate-180')} />
          </button>
          {showCityDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    updateField('city', city);
                    setShowCityDropdown(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left hover:bg-[#FFF0F5]',
                    formData.city === city && 'bg-[#FFF0F5] text-[#E8437A]'
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
      </div>

      {/* Function Type */}
      <div className="space-y-2">
        <Label htmlFor="functionType">Function Type *</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFunctionDropdown(!showFunctionDropdown)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border text-left',
              errors.functionType ? 'border-red-500' : 'border-gray-200'
            )}
          >
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className={cn('flex-1', !formData.functionType && 'text-gray-400')}>
              {formData.functionType || 'Select function type'}
            </span>
            <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', showFunctionDropdown && 'rotate-180')} />
          </button>
          {showFunctionDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
              {functionTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    updateField('functionType', type);
                    setShowFunctionDropdown(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left hover:bg-[#FFF0F5]',
                    formData.functionType === type && 'bg-[#FFF0F5] text-[#E8437A]'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.functionType && <p className="text-sm text-red-500">{errors.functionType}</p>}
      </div>

      {/* Number of Guests */}
      <div className="space-y-2">
        <Label htmlFor="guests">Number of Guests</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="guests"
            type="text"
            placeholder="e.g., 200-300"
            value={formData.guests}
            onChange={(e) => updateField('guests', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Timing */}
      <div className="space-y-2">
        <Label htmlFor="timing">Event Timing</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="timing"
            type="text"
            placeholder="e.g., Evening 6 PM - 10 PM"
            value={formData.timing}
            onChange={(e) => updateField('timing', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Special Request */}
      <div className="space-y-2">
        <Label htmlFor="request">Special Requests</Label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Textarea
            id="request"
            placeholder="Any special requirements or requests..."
            value={formData.specialRequest}
            onChange={(e) => updateField('specialRequest', e.target.value)}
            className="pl-10 min-h-[100px]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#E8437A] to-pink-400 hover:opacity-90 text-white py-6 text-lg font-semibold rounded-xl"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Booking...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>Send Booking Request</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">via ShaadiSetGo</span>
          </span>
        )}
      </Button>

      <div className="text-center space-y-1">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
          <span className="text-green-500">📱</span>
          Booking details vendor ke WhatsApp par bhej di jayengi
        </p>
        <p className="text-xs text-gray-400">
          💒 ShaadiSetGo - Bihar & UP's #1 Wedding Marketplace
        </p>
      </div>
    </form>
  );
}
