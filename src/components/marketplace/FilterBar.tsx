import React, { useRef } from 'react';
import { CraftCategory } from '../../types';
import { useTranslation } from '../../i18n';
import { Search, X, ShieldCheck, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

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

const CATEGORY_TABS: { key: string; labelKey: string; icon?: string }[] = [
  { key: 'all', labelKey: 'marketplace.allCategories', icon: '✨' },
  { key: 'pottery', labelKey: 'categories.pottery', icon: '🏺' },
  { key: 'textiles', labelKey: 'categories.textiles', icon: '🧵' },
  { key: 'woodwork', labelKey: 'categories.woodwork', icon: '🪵' },
  { key: 'metal', labelKey: 'categories.metal', icon: '🔔' },
  { key: 'painting', labelKey: 'categories.painting', icon: '🎨' },
  { key: 'basketry', labelKey: 'categories.basketry', icon: '🧺' },
  { key: 'jewelry', labelKey: 'categories.jewelry', icon: '💍' },
  { key: 'leather', labelKey: 'categories.leather', icon: '🥿' },
  { key: 'terracotta', labelKey: 'categories.terracotta', icon: '🧱' },
  { key: 'stonecraft', labelKey: 'categories.stonecraft', icon: '🗿' },
  { key: 'embroidery', labelKey: 'categories.embroidery', icon: '🪡' },
  { key: 'paper_mache', labelKey: 'categories.paper_mache', icon: '🎭' },
  { key: 'glasscraft', labelKey: 'categories.glasscraft', icon: '🔮' },
  { key: 'carpets', labelKey: 'categories.carpets', icon: '🧶' },
  { key: 'other', labelKey: 'categories.other', icon: '🪔' },
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
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Localized sort options
  const sortLabels: Record<string, Record<string, string>> = {
    featured: {
      en: 'Featured',
      hi: 'लोकप्रिय शिल्प',
      ta: 'சிறப்பானது',
      te: 'ప్రజాదరణ పొందినవి',
      mr: 'वैशिष्ट्यपूर्ण',
      bn: 'জনপ্রিয়',
    },
    price_low: {
      en: 'Price: Low to High',
      hi: 'मूल्य: कम से ज्यादा',
      ta: 'விலை: குறைவு - அதிகம்',
      te: 'ధర: తక్కువ నుండి ఎక్కువ',
      mr: 'किंमत: कमी ते जास्त',
      bn: 'মূল্য: কম থেকে বেশি',
    },
    price_high: {
      en: 'Price: High to Low',
      hi: 'मूल्य: ज्यादा से कम',
      ta: 'விலை: அதிகம் - குறைவு',
      te: 'ధర: ఎక్కువ నుండి తక్కువ',
      mr: 'किंमत: जास्त ते कमी',
      bn: 'মূল্য: বেশি থেকে কম',
    },
    newest: {
      en: 'Newest First',
      hi: 'नवीनतम',
      ta: 'புதியது',
      te: 'సరికొత్తది',
      mr: 'नवीनतम',
      bn: 'নতুন',
    },
  };

  // Localized GI tag label
  const giLabels: Record<string, string> = {
    en: 'GI Tagged Only',
    hi: 'जीआई (GI) प्रमाणित',
    ta: 'GI சான்றளிக்கப்பட்டது',
    te: 'GI గుర్తింపు పొందినవి',
    mr: 'GI मानांकन प्राप्त',
    bn: 'GI সনদপ্রাপ্ত',
  };

  return (
    <div className="space-y-3.5 mb-6">
      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('marketplace.searchPlaceholder')}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-paper-300 bg-paper-100/90 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-indigo-950 placeholder:text-stone-400 shadow-xs transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
              aria-label="Clear search"
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
            className={`px-3.5 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              giOnly
                ? 'bg-turmeric-100 border-turmeric-400 text-turmeric-900 shadow-xs ring-2 ring-turmeric-400/40'
                : 'bg-paper-100 border-paper-300 text-stone-700 hover:bg-paper-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-turmeric-600 shrink-0" />
            <span className="whitespace-nowrap">{giLabels[language] || giLabels.en}</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3.5 py-3 rounded-2xl border border-paper-300 bg-paper-100 text-xs font-semibold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400 shadow-xs cursor-pointer"
          >
            <option value="featured">{sortLabels.featured[language] || sortLabels.featured.en}</option>
            <option value="price_low">{sortLabels.price_low[language] || sortLabels.price_low.en}</option>
            <option value="price_high">{sortLabels.price_high[language] || sortLabels.price_high.en}</option>
            <option value="newest">{sortLabels.newest[language] || sortLabels.newest.en}</option>
          </select>
        </div>
      </div>

      {/* Categories Row with Arrows and Correct Text Alignment */}
      <div className="relative group">
        {/* Left Scroll Arrow */}
        <button
          onClick={scrollLeft}
          type="button"
          aria-label="Scroll categories left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-paper-100 border border-paper-300 text-stone-700 shadow-md items-center justify-center hover:bg-paper-200 hover:text-indigo-950 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Category Pills with NO Text Truncation */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth scrollbar-none no-scrollbar px-0.5"
        >
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onCategoryChange(tab.key)}
                className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shadow-xs select-none min-h-[38px] ${
                  isSelected
                    ? 'bg-terracotta-600 text-white shadow-sm ring-2 ring-terracotta-400/40 border border-terracotta-700 font-bold scale-[1.02]'
                    : 'bg-paper-100 text-stone-700 border border-paper-300 hover:bg-paper-200 hover:border-paper-400 hover:text-indigo-950'
                }`}
              >
                {tab.icon && <span className="text-xs shrink-0 leading-none">{tab.icon}</span>}
                <span className="text-center">{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={scrollRight}
          type="button"
          aria-label="Scroll categories right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-paper-100 border border-paper-300 text-stone-700 shadow-md items-center justify-center hover:bg-paper-200 hover:text-indigo-950 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
