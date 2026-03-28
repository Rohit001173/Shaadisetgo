'use client';

import { Home, Grid3X3, Store, User } from 'lucide-react';
import { useAppStore, ViewType } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'categories', icon: Grid3X3, label: 'Categories' },
  { id: 'vendors', icon: Store, label: 'Vendors' },
  { id: 'profile', icon: User, label: 'Profile' },
] as const;

export function BottomNav() {
  const { currentView, setCurrentView } = useAppStore();

  const isActive = (id: string) => {
    if (id === 'home' && currentView === 'home') return true;
    if (id === 'categories' && currentView === 'categories') return true;
    if (id === 'vendors' && (currentView === 'vendors' || currentView === 'vendor-detail')) return true;
    if (id === 'profile' && (currentView === 'profile' || currentView.startsWith('admin'))) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ id, icon: Icon, label }) => {
          const active = isActive(id);
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id as ViewType)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                active ? 'text-[#E8437A]' : 'text-gray-400'
              )}
            >
              <Icon className={cn('w-6 h-6', active && 'fill-current')} />
              <span className={cn(
                'text-xs mt-0.5 font-medium',
                active ? 'text-[#E8437A]' : 'text-gray-400'
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-white" />
    </nav>
  );
}
