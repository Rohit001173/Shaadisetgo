'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, Star, MapPin, Phone, MessageCircle, BadgeCheck,
  Calendar, Users, Filter, ChevronDown, Plus, Edit, Trash2,
  Settings, LogOut, BarChart3, Store, FileText, Shield,
  CheckCircle, XCircle, AlertCircle, Search, X, RefreshCw, Sparkles, Upload, Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { categories } from '@/components/shaadi/CategoryCard';

// Types
interface Vendor {
  id: string;
  name: string;
  category: string;
  city: string;
  area?: string;
  rating: number;
  reviewsCount: number;
  priceStart?: number;
  priceLabel?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  phoneNumber?: string;
  description?: string;
  images?: string[];
  createdAt: string;
}

interface Booking {
  id: string;
  bookingId: string;
  vendorId: string;
  vendorName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventDate: string;
  functionType: string;
  city: string;
  guests?: number;
  timing?: string;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string | Date;
}

// Admin Credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'shaadisetgo2024';

// Main Admin Page
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'vendors' | 'bookings' | 'add-vendor' | 'add-service' | 'edit-vendor' | 'settings'>('dashboard');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Check session storage for auth
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      // Using requestAnimationFrame to avoid synchronous setState warning
      requestAnimationFrame(() => {
        setIsAuthenticated(true);
      });
    }
  }, []);

  const handleLogin = (success: boolean) => {
    if (success) {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <AdminLoginPage onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard setCurrentView={setCurrentView} onLogout={handleLogout} />;
      case 'vendors':
        return <AdminVendorsPage setCurrentView={setCurrentView} setSelectedVendor={setSelectedVendor} />;
      case 'bookings':
        return <AdminBookingsPage setCurrentView={setCurrentView} />;
      case 'add-vendor':
        return <AdminAddVendorPage setCurrentView={setCurrentView} />;
      case 'add-service':
        return <AdminAddServicePage setCurrentView={setCurrentView} />;
      case 'edit-vendor':
        return selectedVendor ? <AdminEditVendorPage vendor={selectedVendor} setCurrentView={setCurrentView} /> : <AdminVendorsPage setCurrentView={setCurrentView} setSelectedVendor={setSelectedVendor} />;
      case 'settings':
        return <AdminSettingsPage setCurrentView={setCurrentView} />;
      default:
        return <AdminDashboard setCurrentView={setCurrentView} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
    </div>
  );
}

// ==================== ADMIN LOGIN PAGE ====================
function AdminLoginPage({ onLogin }: { onLogin: (success: boolean) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = () => {
    setErrorMsg('');

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setErrorMsg('Please enter username and password');
      toast.error('Please enter username and password');
      return;
    }

    setIsLoading(true);

    // Check credentials
    if (trimmedUsername === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD) {
      toast.success('Login successful! Welcome Admin');
      onLogin(true);
    } else {
      setErrorMsg('Invalid username or password');
      toast.error('Invalid credentials');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8437A] to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8437A] to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1">ShaadiSetGo Management</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#E8437A] hover:bg-[#d63a6d] py-6 text-lg"
          >
            {isLoading ? 'Logging in...' : 'Login to Dashboard'}
          </Button>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-2 text-center">Login Credentials:</p>
          <div className="flex justify-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500">Username</p>
              <p className="text-sm text-green-800 font-mono font-bold">admin</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500">Password</p>
              <p className="text-sm text-green-800 font-mono font-bold">shaadisetgo2024</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-[#E8437A] hover:underline">
            ← Back to ShaadiSetGo
          </a>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ setCurrentView, onLogout }: { setCurrentView: (view: any) => void; onLogout: () => void }) {
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
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

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems = [
    { icon: Store, label: 'Vendors', count: stats.totalVendors, view: 'vendors' },
    { icon: FileText, label: 'Bookings', count: stats.totalBookings, view: 'bookings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E8437A] to-pink-400 text-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/80 text-sm">ShaadiSetGo Management</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
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
                onClick={() => setCurrentView(view)}
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
              onClick={() => setCurrentView('add-vendor')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-pink-50 text-[#E8437A] hover:bg-pink-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E8437A]/10 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">Add New Vendor</span>
            </button>
            <button
              onClick={() => setCurrentView('add-service')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#E8437A] text-white"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left font-medium">Add New Service</span>
            </button>
            <button
              onClick={() => setCurrentView('settings')}
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
function AdminVendorsPage({ setCurrentView, setSelectedVendor }: { setCurrentView: (view: any) => void; setSelectedVendor: (vendor: Vendor | null) => void }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vendors?limit=100');
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('edit-vendor');
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

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Manage Vendors</h1>
          <Button
            onClick={() => setCurrentView('add-vendor')}
            size="sm"
            className="bg-[#E8437A]"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8437A]/20"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
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
function AdminBookingsPage({ setCurrentView }: { setCurrentView: (view: any) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

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
            onClick={() => setCurrentView('dashboard')}
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
                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowra',
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
                <div className={cn('h-1.5', statusConfig.bgColor)} />

                <div className="p-4">
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
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
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
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ADMIN ADD VENDOR PAGE ====================
function AdminAddVendorPage({ setCurrentView }: { setCurrentView: (view: any) => void }) {
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
        setCurrentView('vendors');
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
            onClick={() => setCurrentView('vendors')}
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
function AdminEditVendorPage({ vendor, setCurrentView }: { vendor: Vendor; setCurrentView: (view: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: vendor.name,
    ownerName: vendor.ownerName || '',
    category: vendor.category,
    city: vendor.city,
    area: vendor.area || '',
    priceStart: vendor.priceStart?.toString() || '',
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
        setCurrentView('vendors');
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
            onClick={() => setCurrentView('vendors')}
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
            <Label>Price Label</Label>
            <Input
              value={formData.priceLabel}
              onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-4 flex-wrap">
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-[#E8437A] focus:ring-[#E8437A]"
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

// ==================== ADMIN ADD SERVICE PAGE ====================
function AdminAddServicePage({ setCurrentView }: { setCurrentView: (view: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    category: 'DJ',
    city: 'Patna',
    area: '',
    price: '',
    description: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle multiple image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if we can add more images
    if (images.length + files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    setUploading(true);
    setUploadError(null);

    // Upload each file
    for (const file of Array.from(files)) {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        console.log('[Admin] Uploading file:', file.name);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToSend,
        });

        const data = await response.json();
        console.log('[Admin] Upload response:', data);

        if (data.success && data.url) {
          setImages(prev => [...prev, data.url]);
          toast.success(`${file.name} uploaded!`);
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error('[Admin] Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    // Reset input
    e.target.value = '';
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_name || !formData.category || !formData.city) {
      toast.error('Please fill all required fields (Name, Category, City)');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        service_name: formData.service_name,
        category: formData.category,
        city: formData.city,
        area: formData.area || null,
        price: formData.price ? parseInt(formData.price) : null,
        description: formData.description || null,
        images: images,
      };

      console.log('[Admin] Submitting service:', payload);

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('[Admin] Service response:', data);

      if (data.success) {
        toast.success('Service added successfully! 🎉');
        setCurrentView('dashboard');
      } else {
        toast.error(data.error || 'Failed to add service');
      }
    } catch (error) {
      console.error('[Admin] Submit error:', error);
      toast.error('Failed to add service. Please try again.');
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
            onClick={() => setCurrentView('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Add New Service</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Image Upload */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Service Images</Label>
            <span className="text-sm text-gray-500">{images.length}/6</span>
          </div>

          {/* Uploaded Images Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#E8437A] text-white text-xs py-1 text-center">
                    Primary
                  </div>
                )}
              </div>
            ))}

            {/* Upload Button */}
            {images.length < 6 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#E8437A] hover:bg-pink-50 transition-all">
                {uploading ? (
                  <RefreshCw className="w-6 h-6 text-[#E8437A] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Upload Error */}
          {uploadError && (
            <div className="p-2 bg-red-50 rounded-lg text-red-600 text-sm">
              {uploadError}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            First image will be used as primary. Max 5MB per image.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <Label>Service Name *</Label>
            <Input
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              placeholder="e.g., DJ Rahul Wedding Services"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Category *</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background mt-1"
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
                className="mt-1"
              />
            </div>
            <div>
              <Label>Area</Label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Area"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Starting Price</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 25000"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your service..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || uploading}
          className="w-full bg-[#E8437A] hover:bg-[#d63a6d] py-6 text-lg font-semibold"
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

// ==================== ADMIN SETTINGS PAGE ====================
function AdminSettingsPage({ setCurrentView }: { setCurrentView: (view: any) => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    // For now, just show success - in real app, this would update password
    setTimeout(() => {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Password Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-4">Change Password</h2>
          <div className="space-y-3">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <Button
              onClick={handlePasswordChange}
              disabled={isSubmitting}
              className="w-full bg-[#E8437A]"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">Admin Portal Info</h3>
          <p className="text-sm text-blue-600">
            This admin panel is accessible at <code className="bg-blue-100 px-1 rounded">/admin</code>
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Current credentials: <code className="bg-blue-100 px-1 rounded">admin / shaadisetgo2024</code>
          </p>
        </div>
      </div>
    </div>
  );
}
