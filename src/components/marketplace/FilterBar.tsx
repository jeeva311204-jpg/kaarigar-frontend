import React from 'react';
import { CraftCategory } from '../../types';
import { useTranslation } from '../../i18n';
import { Search, X, SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string; // 'all' | CraftCategory
  onCategoryChange: (cat: string) => void;
  giOnly: boolean;
  onToggleGiOnly: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const CATEGORY_TABS: { key: string; labelKey: string }[] = [
  { key: 'all', labelKey: 'marketplace.allCategories' },
  { key: 'pottery', labelKey: 'categories.pottery' },
  { key: 'textiles', labelKey: 'categories.textiles' },
  { key: 'metal', labelKey: 'categories.metal' },
  { key: 'painting', labelKey: 'categories.painting' },
  { key: 'woodwork', labelKey: 'categories.woodwork' },
  { key: 'basketry', labelKey: 'categories.basketry' },
  { key: 'jewelry', labelKey: 'categories.jewelry' },
  { key: 'leather', labelKey: 'categories.leather' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  giOnly,
  onToggleGiOnly,
  sortBy,
  onSortChange,
}) => {
  const { t, isHindi } = useTranslation();

  return (
    <div className="space-y-4 mb-6">
      
      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('marketplace.searchPlaceholder')}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-paper-300 bg-paper-100/90 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-indigo-950 placeholder:text-stone-400 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* GI Only Toggle & Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleGiOnly}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer tap-target-accessible ${
              giOnly
                ? 'bg-turmeric-100 border-turmeric-400 text-turmeric-900 shadow-xs ring-1 ring-turmeric-400'
                : 'bg-paper-100 border-paper-300 text-stone-700 hover:bg-paper-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-turmeric-600" />
            <span>{isHindi ? 'जीआई (GI) प्रमाणित' : 'GI Tagged Only'}</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-paper-300 bg-paper-100 text-xs font-semibold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400 shadow-xs cursor-pointer tap-target-accessible"
          >
            <option value="featured">{isHindi ? 'लोकप्रिय शिल्प' : 'Featured'}</option>
            <option value="price_low">{isHindi ? 'मूल्य: कम से ज्यादा' : 'Price: Low to High'}</option>
            <option value="price_high">{isHindi ? 'मूल्य: ज्यादा से कम' : 'Price: High to Low'}</option>
            <option value="newest">{isHindi ? 'नवीनतम' : 'Newest First'}</option>
          </select>
        </div>
      </div>

      {/* Horizontal Scrollable Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onCategoryChange(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer tap-target-accessible min-h-[38px] ${
                isSelected
                  ? 'bg-terracotta-500 text-white shadow-xs border border-terracotta-600'
                  : 'bg-paper-100 text-stone-700 border border-paper-300 hover:bg-paper-200 hover:border-paper-400'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

    </div>
  );
};
