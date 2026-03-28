'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore, ViewType, VendorUser, VendorService, VendorBooking } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Home, 
  Briefcase, 
  PlusCircle, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Camera,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  TrendingUp,
  Package,
  ShoppingCart,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Constants
const CATEGORIES = [
  'DJ', 
  'Photography', 
  'Catering', 
  'Mehndi', 
  'Pandit Ji', 
  'Makeup', 
  'Tent & Decoration', 
  'Band Baja', 
  'Honeymoon Package', 
  'Hotel & Banquet', 
  'Beauty Parlour'
];

const CITIES = [
  'Patna', 
  'Gaya', 
  'Muzaffarpur', 
  'Siwan', 
  'Gopalganj',
  'Deoria', 
  'Kushinagar', 
  'Gorakhpur'
];

const PRIMARY_COLOR = '#E8437A';

// Helper function to get vendor ID from localStorage
const getVendorId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vendorId');
  }
  return null;
};

// Helper function to set vendor ID in localStorage
const setVendorId = (id: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vendorId', id);
  }
};

// Helper function to remove vendor ID from localStorage
const removeVendorId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vendorId');
  }
};

// Status badge colors
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Category emoji mapping
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'DJ': '🎧',
    'Photography': '📸',
    'Catering': '🍽️',
    'Mehndi': '✋',
    'Pandit Ji': '🙏',
    'Makeup': '💄',
    'Tent & Decoration': '🎪',
    'Band Baja': '🎺',
    'Honeymoon Package': '✈️',
    'Hotel & Banquet': '🏨',
    'Beauty Parlour': '💇',
  };
  return emojiMap[category] || '🎉';
};

// ============================================
// VENDOR LOGIN PAGE
// ============================================
export function VendorLoginPage() {
  const { setCurrentView, setVendorAuthenticated, setVendorUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/vendor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setVendorId(data.data.id);
        setVendorAuthenticated(true, data.data);
        toast.success('Login successful!');
        setCurrentView('vendor-dashboard');
      } else {
        if (data.status === 'pending') {
          setError('Your vendor account is under review. Please wait for admin approval.');
        } else if (data.status === 'rejected') {
          setError('Your vendor account was not approved. Please contact support.');
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E8437A] to-[#FF6B9D] p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-[#E8437A] font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold">ShaadiSetGo</span>
        </div>
        <p className="text-white/80 text-sm">Vendor Portal</p>
      </div>

      {/* Form */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600 mb-6">Login to manage your vendor dashboard</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E8437A] hover:bg-[#d63d6d] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => setCurrentView('vendor-signup')}
                className="text-[#E8437A] font-medium hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VENDOR SIGNUP PAGE
// ============================================
export function VendorSignupPage() {
  const { setCurrentView } = useAppStore();
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    email: '',
    businessName: '',
    city: '',
    category: '',
    description: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/vendor/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast.success('Registration successful!');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex flex-col">
        <div className="bg-gradient-to-r from-[#E8437A] to-[#FF6B9D] p-6 text-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-[#E8437A] font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold">ShaadiSetGo</span>
          </div>
        </div>

        <div className="flex-1 p-6 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your vendor account has been created. Please wait for admin approval. 
                You will receive an email once your account is approved.
              </p>
              <Button
                onClick={() => setCurrentView('vendor-login')}
                className="bg-[#E8437A] hover:bg-[#d63d6d]"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E8437A] to-[#FF6B9D] p-6 text-white">
        <button
          onClick={() => setCurrentView('vendor-login')}
          className="flex items-center gap-1 text-white/80 hover:text-white mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Login
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-[#E8437A] font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold">ShaadiSetGo</span>
        </div>
        <p className="text-white/80 text-sm mt-1">Vendor Registration</p>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Vendor Account</h1>
          <p className="text-gray-600 mb-6">Join our wedding vendor marketplace</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                placeholder="Enter your full name"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className="mt-1"
              />
              {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="mt-1"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="mt-1"
              />
              {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your service category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryEmoji(cat)} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your business"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="mt-1"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E8437A] hover:bg-[#d63d6d] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            By registering, you agree to our Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MENU CONTENT COMPONENT (separate for reusability)
// ============================================
interface MenuContentProps {
  currentView: ViewType;
  onMenuClick: (view: ViewType) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'vendor-dashboard', label: 'Dashboard', icon: Home },
  { id: 'vendor-services', label: 'My Services', icon: Briefcase },
  { id: 'vendor-add-service', label: 'Add Service', icon: PlusCircle },
  { id: 'vendor-bookings', label: 'Bookings', icon: Calendar },
  { id: 'vendor-profile', label: 'Profile', icon: User },
];

function SidebarMenuContent({ currentView, onMenuClick, onLogout }: MenuContentProps) {
  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-[#E8437A] to-[#FF6B9D] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">ShaadiSetGo</span>
            <p className="text-xs text-gray-500">Vendor Portal</p>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-pink-50 text-[#E8437A] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#E8437A]' : ''}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8437A]" />
              )}
            </button>
          );
        })}
      </nav>

      <Separator />

      <div className="px-2 py-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// VENDOR SIDEBAR
// ============================================
interface VendorSidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onLogout: () => void;
}

export function VendorSidebar({ currentView, setCurrentView, onLogout }: VendorSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (view: ViewType) => {
    setCurrentView(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <SidebarMenuContent
          currentView={currentView}
          onMenuClick={handleMenuClick}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#E8437A] to-[#FF6B9D] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-gray-900">ShaadiSetGo</span>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarMenuContent
                currentView={currentView}
                onMenuClick={handleMenuClick}
                onLogout={onLogout}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}

// ============================================
// VENDOR DASHBOARD HOME
// ============================================
export function VendorDashboardHome() {
  const { vendorUser, setCurrentView } = useAppStore();
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<VendorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const vendorId = getVendorId();
    if (!vendorId) return;

    try {
      const response = await fetch('/api/vendor/stats', {
        headers: { 'x-vendor-id': vendorId },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setRecentBookings(data.data.recentBookings);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Services', value: stats.totalServices, icon: Package, color: 'bg-blue-500' },
    { label: 'Active Bookings', value: stats.pendingBookings + stats.confirmedBookings, icon: ShoppingCart, color: 'bg-amber-500' },
    { label: 'Completed', value: stats.completedBookings, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'bg-purple-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8437A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-[#E8437A] to-[#FF6B9D] text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome, {vendorUser?.businessName || 'Vendor'}!
              </h1>
              <p className="text-white/80">
                Here&apos;s your business overview
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-white/30" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setCurrentView('vendor-add-service')}
            >
              <PlusCircle className="w-6 h-6 text-[#E8437A]" />
              <span className="text-sm">Add Service</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setCurrentView('vendor-services')}
            >
              <Briefcase className="w-6 h-6 text-[#E8437A]" />
              <span className="text-sm">View Services</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setCurrentView('vendor-bookings')}
            >
              <Calendar className="w-6 h-6 text-[#E8437A]" />
              <span className="text-sm">View Bookings</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setCurrentView('vendor-profile')}
            >
              <Settings className="w-6 h-6 text-[#E8437A]" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Bookings</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('vendor-bookings')}
            className="text-[#E8437A]"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#E8437A]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">{booking.eventDate}</p>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// VENDOR SERVICES PAGE
// ============================================
export function VendorServicesPage() {
  const { setCurrentView, setSelectedVendorService, removeVendorService } = useAppStore();
  const [services, setServices] = useState<VendorService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices(page);
  }, [page]);

  const fetchServices = async (pageNum: number) => {
    const vendorId = getVendorId();
    if (!vendorId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/vendor/services?page=${pageNum}&limit=10`, {
        headers: { 'x-vendor-id': vendorId },
      });
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service: VendorService) => {
    setSelectedVendorService(service);
    setCurrentView('vendor-edit-service');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const vendorId = getVendorId();
    if (!vendorId) return;

    try {
      const response = await fetch(`/api/vendor/services/${deleteId}`, {
        method: 'DELETE',
        headers: { 'x-vendor-id': vendorId },
      });

      const data = await response.json();

      if (data.success) {
        removeVendorService(deleteId);
        setServices(prev => prev.filter(s => s.id !== deleteId));
        toast.success('Service deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete service');
      }
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8437A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-500">Manage your service offerings</p>
        </div>
        <Button
          onClick={() => setCurrentView('vendor-add-service')}
          className="bg-[#E8437A] hover:bg-[#d63d6d]"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Yet</h3>
              <p className="text-gray-500 mb-4">
                Start adding services to showcase your offerings
              </p>
              <Button
                onClick={() => setCurrentView('vendor-add-service')}
                className="bg-[#E8437A] hover:bg-[#d63d6d]"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.serviceName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-50">
                      <span className="text-4xl">{getCategoryEmoji(service.category)}</span>
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                      <p className="text-sm text-gray-500">{service.category}</p>
                    </div>
                    <Badge variant="secondary" className="bg-pink-50 text-[#E8437A]">
                      ₹{service.price.toLocaleString()}
                    </Badge>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {service.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================
// VENDOR ADD SERVICE PAGE
// ============================================
export function VendorAddServicePage() {
  const { setCurrentView, addVendorService } = useAppStore();
  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    price: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceName.trim()) newErrors.serviceName = 'Service name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseInt(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        return data.data[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const vendorId = getVendorId();
    if (!vendorId) {
      toast.error('Please login again');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          toast.error('Failed to upload image. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/vendor/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vendor-id': vendorId,
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addVendorService(data.data);
        toast.success('Service created successfully!');
        setCurrentView('vendor-services');
      } else {
        toast.error(data.error || 'Failed to create service');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => setCurrentView('vendor-services')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Services
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
        <p className="text-gray-500">Create a new service offering</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {/* Image Upload */}
            <div>
              <Label>Service Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#E8437A] transition-colors">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP (max 5MB)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Service Name */}
            <div>
              <Label htmlFor="serviceName">Service Name *</Label>
              <Input
                id="serviceName"
                placeholder="Enter service name"
                value={formData.serviceName}
                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                className="mt-1"
              />
              {errors.serviceName && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceName}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryEmoji(cat)} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price in INR"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="mt-1"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your service"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </CardContent>

          <CardFooter className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentView('vendor-services')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#E8437A] hover:bg-[#d63d6d]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Service'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// ============================================
// VENDOR EDIT SERVICE PAGE
// ============================================
export function VendorEditServicePage() {
  const { selectedVendorService, setCurrentView, updateVendorService } = useAppStore();
  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    price: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedVendorService) {
      setFormData({
        serviceName: selectedVendorService.serviceName,
        category: selectedVendorService.category,
        price: selectedVendorService.price.toString(),
        description: selectedVendorService.description || '',
      });
      setImagePreview(selectedVendorService.imageUrl || null);
    }
  }, [selectedVendorService]);

  if (!selectedVendorService) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No service selected</p>
        <Button
          onClick={() => setCurrentView('vendor-services')}
          className="mt-4 bg-[#E8437A] hover:bg-[#d63d6d]"
        >
          Back to Services
        </Button>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceName.trim()) newErrors.serviceName = 'Service name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseInt(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        return data.data[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const vendorId = getVendorId();
    if (!vendorId) {
      toast.error('Please login again');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = selectedVendorService.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.error('Failed to upload image. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(`/api/vendor/services/${selectedVendorService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-vendor-id': vendorId,
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateVendorService(data.data);
        toast.success('Service updated successfully!');
        setCurrentView('vendor-services');
      } else {
        toast.error(data.error || 'Failed to update service');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => setCurrentView('vendor-services')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Services
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
        <p className="text-gray-500">Update your service details</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {/* Image Upload */}
            <div>
              <Label>Service Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Service preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#E8437A] transition-colors">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP (max 5MB)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Service Name */}
            <div>
              <Label htmlFor="serviceName">Service Name *</Label>
              <Input
                id="serviceName"
                placeholder="Enter service name"
                value={formData.serviceName}
                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                className="mt-1"
              />
              {errors.serviceName && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceName}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryEmoji(cat)} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price in INR"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="mt-1"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your service"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </CardContent>

          <CardFooter className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentView('vendor-services')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#E8437A] hover:bg-[#d63d6d]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Service'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// ============================================
// VENDOR BOOKINGS PAGE
// ============================================
export function VendorBookingsPage() {
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<VendorBooking | null>(null);

  const fetchBookings = useCallback(async (pageNum: number, status?: string) => {
    const vendorId = getVendorId();
    if (!vendorId) return;

    setIsLoading(true);
    try {
      let url = `/api/vendor/bookings?page=${pageNum}&limit=10`;
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        headers: { 'x-vendor-id': vendorId },
      });
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(page, statusFilter);
  }, [page, statusFilter, fetchBookings]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8437A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500">Manage your customer bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange(status)}
            className={statusFilter === status ? 'bg-[#E8437A] hover:bg-[#d63d6d]' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings</h3>
              <p className="text-gray-500">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} bookings found`
                  : 'You haven\'t received any bookings yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-[#E8437A]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                        <p className="text-sm text-gray-500">{booking.bookingId}</p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Event Date</p>
                      <p className="font-medium">{booking.eventDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{booking.customerPhone}</p>
                    </div>
                    {booking.service && (
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium">{booking.service.serviceName}</p>
                      </div>
                    )}
                    {booking.venue && (
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="font-medium">{booking.venue}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Booking Details Dialog */}
      <AlertDialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Details</AlertDialogTitle>
          </AlertDialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Booking ID</span>
                <span className="font-medium">{selectedBooking.bookingId}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Customer</span>
                <span className="font-medium">{selectedBooking.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Phone</span>
                <span className="font-medium">{selectedBooking.customerPhone}</span>
              </div>
              {selectedBooking.customerEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="font-medium">{selectedBooking.customerEmail}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Event Date</span>
                <span className="font-medium">{selectedBooking.eventDate}</span>
              </div>
              {selectedBooking.eventTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Event Time</span>
                  <span className="font-medium">{selectedBooking.eventTime}</span>
                </div>
              )}
              {selectedBooking.venue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Venue</span>
                  <span className="font-medium">{selectedBooking.venue}</span>
                </div>
              )}
              {selectedBooking.guestCount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Guest Count</span>
                  <span className="font-medium">{selectedBooking.guestCount}</span>
                </div>
              )}
              {selectedBooking.service && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Service</span>
                    <span className="font-medium">{selectedBooking.service.serviceName}</span>
                  </div>
                </>
              )}
              {selectedBooking.specialRequest && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Special Request</span>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedBooking.specialRequest}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================
// VENDOR PROFILE PAGE
// ============================================
export function VendorProfilePage() {
  const { vendorUser, vendorLogout, setCurrentView } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    // Clear localStorage
    removeVendorId();
    
    // Clear store
    vendorLogout();
    
    toast.success('Logged out successfully');
    setCurrentView('vendor-login');
    setIsLoading(false);
  };

  if (!vendorUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please login to view your profile</p>
        <Button
          onClick={() => setCurrentView('vendor-login')}
          className="mt-4 bg-[#E8437A] hover:bg-[#d63d6d]"
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your vendor account</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#E8437A] to-[#FF6B9D] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {vendorUser.businessName?.charAt(0) || 'V'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{vendorUser.businessName}</h2>
              <p className="text-gray-500">{vendorUser.ownerName}</p>
              {getStatusBadge(vendorUser.vendorStatus)}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-medium">{vendorUser.ownerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{getCategoryEmoji(vendorUser.category)} {vendorUser.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{vendorUser.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{vendorUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{vendorUser.phone}</p>
              </div>
            </div>

            {vendorUser.description && (
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{vendorUser.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// MAIN VENDOR DASHBOARD COMPONENT
// ============================================
export default function VendorDashboard() {
  const { 
    currentView, 
    setCurrentView, 
    isVendorAuthenticated,
    vendorUser,
    vendorLogout 
  } = useAppStore();

  // Check authentication on mount
  useEffect(() => {
    const vendorId = getVendorId();
    if (!vendorId && !isVendorAuthenticated) {
      setCurrentView('vendor-login');
    }
  }, [isVendorAuthenticated, setCurrentView]);

  // Handle logout
  const handleLogout = () => {
    removeVendorId();
    vendorLogout();
    setCurrentView('vendor-login');
    toast.success('Logged out successfully');
  };

  // If not authenticated, show login/signup
  if (!isVendorAuthenticated || !vendorUser) {
    if (currentView === 'vendor-signup') {
      return <VendorSignupPage />;
    }
    return <VendorLoginPage />;
  }

  // Render based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'vendor-dashboard':
        return <VendorDashboardHome />;
      case 'vendor-services':
        return <VendorServicesPage />;
      case 'vendor-add-service':
        return <VendorAddServicePage />;
      case 'vendor-edit-service':
        return <VendorEditServicePage />;
      case 'vendor-bookings':
        return <VendorBookingsPage />;
      case 'vendor-profile':
        return <VendorProfilePage />;
      default:
        return <VendorDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <VendorSidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="pt-16 lg:pt-0 p-4 lg:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
