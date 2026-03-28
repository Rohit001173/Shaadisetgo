// Configuration helper for ShaadiSetGo

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && !url.includes('your-project') && !key.includes('your-'));
};

// Database configuration
export const dbConfig = {
  isSupabase: isSupabaseConfigured(),
  type: isSupabaseConfigured() ? 'postgresql' : 'sqlite',
};

// App configuration
export const appConfig = {
  name: 'ShaadiSetGo',
  description: 'Wedding Vendor Marketplace',
  region: 'Bihar & UP, India',
  version: '1.0.0',
};

// Admin credentials (for demo purposes)
export const adminCredentials = {
  username: 'admin',
  password: 'shaadisetgo2024',
};

// Categories
export const vendorCategories = [
  { id: 'dj', name: 'DJ & Music', icon: 'Music' },
  { id: 'catering', name: 'Catering', icon: 'UtensilsCrossed' },
  { id: 'photography', name: 'Photography', icon: 'Camera' },
  { id: 'makeup', name: 'Makeup', icon: 'Sparkles' },
  { id: 'tent', name: 'Tent & Decor', icon: 'Tent' },
  { id: 'florist', name: 'Florist', icon: 'Flower2' },
  { id: 'transport', name: 'Transport', icon: 'Car' },
  { id: 'gifts', name: 'Gifts & Invites', icon: 'Gift' },
  { id: 'anchor', name: 'Anchor/Host', icon: 'Mic2' },
  { id: 'mehndi', name: 'Mehndi Artist', icon: 'Palette' },
];

// Cities we serve
export const cities = [
  'Patna',
  'Gaya',
  'Muzaffarpur',
  'Bhagalpur',
  'Varanasi',
  'Lucknow',
  'Kanpur',
];

// Function types for bookings
export const functionTypes = [
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
