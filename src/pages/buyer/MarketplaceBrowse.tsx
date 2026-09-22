import React, { useState, useEffect, useMemo } from 'react';
import { Product, CraftCategory } from '../../types';
import { useTranslation } from '../../i18n';
import { fetchProducts } from '../../lib/firebase';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { FilterBar } from '../../components/marketplace/FilterBar';
import { ContactModal } from '../../components/marketplace/ContactModal';
import { Sparkles, Package, MapPin, Store } from 'lucide-react';

export const MarketplaceBrowse: React.FC = () => {
  const { t, isHindi } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [giOnly, setGiOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [contactProduct, setContactProduct] = useState<Product | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await fetchProducts();
      // Only show live crafts in buyer marketplace
      setProducts(list.filter(p => p.status === 'live'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStoreChange = () => {
      loadData();
    };
    window.addEventListener('kaarigar_store_updated', handleStoreChange);
    return () => {
      window.removeEventListener('kaarigar_store_updated', handleStoreChange);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Category filter
        if (selectedCategory !== 'all' && prod.category !== selectedCategory) {
          return false;
        }

        // GI only filter
        if (giOnly && !prod.giTagged) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = prod.title.toLowerCase().includes(q) || (prod.titleHi && prod.titleHi.includes(q));
          const matchDesc = prod.description.toLowerCase().includes(q) || (prod.descriptionHi && prod.descriptionHi.includes(q));
          const matchOrigin = prod.craftOrigin.toLowerCase().includes(q) || prod.artisanLocation.toLowerCase().includes(q);
          const matchArtisan = prod.artisanName.toLowerCase().includes(q);
          const matchTags = prod.tags.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchOrigin && !matchArtisan && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.finalPrice - b.finalPrice;
        if (sortBy === 'price_high') return b.finalPrice - a.finalPrice;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0; // featured default
      });
  }, [products, searchQuery, selectedCategory, giOnly, sortBy]);

  const handleOpenContact = (product: Product) => {
    setContactProduct(product);
    setIsContactOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      
      {/* Marketplace Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-craft-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turmeric-500/20 text-turmeric-300 border border-turmeric-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? '100% प्रामाणिक भारतीय हस्तकला' : 'Direct Artisan Heritage Platform'}</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-paper-50">
            {t('marketplace.title')}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {t('marketplace.subtitle')}
          </p>
        </div>

        {/* Decorative Indian mandala/craft silhouette */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-terracotta-500/10 -z-0 pointer-events-none" />
      </div>

      {/* Filter & Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        giOnly={giOnly}
        onToggleGiOnly={() => setGiOnly(!giOnly)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Craft Listings Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-500 font-medium">
          {t('common.loading')}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-paper-100 border border-dashed border-paper-300 rounded-3xl p-12 text-center space-y-3">
          <Store className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-indigo-950">
            {isHindi ? 'कोई शिल्प नहीं मिला' : 'No authentic crafts matched your criteria'}
          </h3>
          <p className="text-xs text-stone-500">
            {isHindi ? 'फ़िल्टर हटाकर दोबारा खोजें' : 'Try adjusting your search terms or clearing category filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onContactClick={handleOpenContact}
            />
          ))}
        </div>
      )}

      {/* Direct Contact Modal */}
      <ContactModal
        product={contactProduct}
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

    </div>
  );
};
