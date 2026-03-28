'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, TrendingUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { weddingCategories, type Category, type SubCategory } from '@/lib/categories';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  onSubcategoryClick?: (categoryId: string, subcategoryId: string) => void;
  variant?: 'default' | 'compact' | 'large';
  showSubcategories?: boolean;
}

export function CategoryCard({ 
  category, 
  onClick, 
  onSubcategoryClick,
  variant = 'default',
  showSubcategories = false 
}: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="flex-shrink-0 flex flex-col items-center gap-2 p-3 min-w-[80px] transition-transform active:scale-95"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
          style={{ backgroundColor: `${category.color}15` }}
        >
          {category.icon}
        </div>
        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
          {category.name}
        </span>
        <span className="text-[10px] text-gray-400">
          {category.subcategories.length} services
        </span>
      </button>
    );
  }

  if (variant === 'large') {
    return (
      <div 
        className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
        style={{ borderLeftWidth: '4px', borderLeftColor: category.color }}
      >
        {/* Gradient Header */}
        <div 
          className="p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${category.color}10 0%, ${category.color}05 100%)` }}
        >
          <button
            onClick={() => {
              onClick?.();
              setIsExpanded(!isExpanded);
            }}
            className="w-full flex items-start gap-4 text-left"
          >
            {/* Icon */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                {category.nameHindi && (
                  <span className="text-sm text-gray-500">• {category.nameHindi}</span>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {category.description}
              </p>
              
              <div className="flex items-center gap-3 mt-3">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  <Sparkles className="w-3 h-3" />
                  {category.subcategories.length} services
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  Popular
                </span>
              </div>
            </div>
            
            {/* Expand Icon */}
            <ChevronDown 
              className={cn(
                'w-6 h-6 text-gray-400 transition-transform duration-300 flex-shrink-0 mt-2',
                isExpanded && 'rotate-180',
                isExpanded && 'text-[#E8437A]'
              )} 
            />
          </button>
        </div>

        {/* Subcategories */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="grid grid-cols-2 gap-2">
              {category.subcategories.map((subcategory, index) => (
                <button
                  key={subcategory.id}
                  onClick={() => onSubcategoryClick?.(category.id, subcategory.id)}
                  className="flex items-start gap-2 p-3 rounded-xl hover:bg-gray-50 text-left transition-all group border border-gray-100 hover:border-[#E8437A]/30 hover:shadow-sm"
                >
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-[#E8437A] truncate">
                      {subcategory.name}
                    </p>
                    {subcategory.nameHindi && (
                      <p className="text-xs text-gray-400 truncate">{subcategory.nameHindi}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#E8437A]/30 transition-all">
      {/* Category Header */}
      <button
        onClick={() => {
          onClick?.();
          setIsExpanded(!isExpanded);
        }}
        className="w-full p-4 flex items-center gap-3"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${category.color}15` }}
        >
          {category.icon}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500">
            {category.subcategories.length} services
          </p>
        </div>
        <ChevronDown 
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )} 
        />
      </button>

      {/* Subcategories */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 mt-3">
            {category.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => onSubcategoryClick?.(category.id, subcategory.id)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-left transition-colors group"
              >
                <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#E8437A]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {subcategory.name}
                  </p>
                  {subcategory.nameHindi && (
                    <p className="text-xs text-gray-400 truncate">
                      {subcategory.nameHindi}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CategoryGrid({ 
  onSelectCategory,
  onSelectSubcategory 
}: { 
  onSelectCategory?: (categoryId: string) => void;
  onSelectSubcategory?: (categoryId: string, subcategoryId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {weddingCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          variant="large"
          onClick={() => onSelectCategory?.(category.id)}
          onSubcategoryClick={onSelectSubcategory}
          showSubcategories
        />
      ))}
    </div>
  );
}

export function CategoryScroller({ 
  onSelectCategory 
}: { 
  onSelectCategory?: (categoryId: string) => void;
}) {
  // Show first 8 categories in scroller
  const displayCategories = weddingCategories.slice(0, 8);

  return (
    <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-2">
      {displayCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          variant="compact"
          onClick={() => onSelectCategory?.(category.id)}
        />
      ))}
      {/* View All button */}
      <button
        onClick={() => onSelectCategory?.('all')}
        className="flex-shrink-0 flex flex-col items-center gap-2 p-3 min-w-[80px]"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8437A] to-pink-400 flex items-center justify-center text-white text-xl">
          +{weddingCategories.length - 8}
        </div>
        <span className="text-xs font-medium text-[#E8437A] text-center leading-tight">
          View All
        </span>
      </button>
    </div>
  );
}

export function CategoryAccordion({ 
  onSelectSubcategory,
  selectedCategoryId 
}: { 
  onSelectSubcategory?: (categoryId: string, subcategoryId: string, subcategoryName: string) => void;
  selectedCategoryId?: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(selectedCategoryId || null);

  return (
    <div className="space-y-4">
      {weddingCategories.map((category, catIndex) => (
        <div 
          key={category.id}
          className={cn(
            "rounded-3xl overflow-hidden transition-all duration-300",
            expandedId === category.id 
              ? 'shadow-xl' 
              : 'shadow-md hover:shadow-lg'
          )}
          style={{ 
            borderLeftWidth: '5px',
            borderLeftColor: category.color,
          }}
        >
          {/* Category Header */}
          <button
            onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
            className={cn(
              "w-full p-5 flex items-center gap-4 transition-colors",
              expandedId === category.id 
                ? 'bg-white' 
                : 'bg-white hover:bg-gray-50'
            )}
          >
            {/* Icon with gradient background */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)` }}
            >
              {category.icon}
            </div>
            
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                {category.nameHindi && (
                  <span className="text-sm text-gray-500">• {category.nameHindi}</span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  <Sparkles className="w-3 h-3" />
                  {category.subcategories.length} services
                </span>
              </div>
            </div>
            
            <ChevronDown 
              className={cn(
                'w-6 h-6 transition-transform duration-300 flex-shrink-0',
                expandedId === category.id 
                  ? 'rotate-180 text-[#E8437A]' 
                  : 'text-gray-400'
              )} 
            />
          </button>

          {/* Subcategories */}
          {expandedId === category.id && (
            <div className="bg-gradient-to-b from-gray-50 to-white p-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.subcategories.map((subcategory, index) => (
                  <button
                    key={subcategory.id}
                    onClick={() => onSelectSubcategory?.(category.id, subcategory.id, subcategory.name)}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white hover:shadow-md text-left transition-all group border border-gray-100 hover:border-[#E8437A]/40"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 group-hover:text-[#E8437A]">
                        {subcategory.name}
                      </p>
                      {subcategory.nameHindi && (
                        <p className="text-xs text-gray-400 mt-0.5">{subcategory.nameHindi}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#E8437A] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Export for backward compatibility
export { weddingCategories as categories };
