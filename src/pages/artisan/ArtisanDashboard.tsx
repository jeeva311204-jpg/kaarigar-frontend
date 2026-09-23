import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, ProductStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../i18n';
import { fetchProducts, fetchInquiries, markProductAsSoldRecord, deleteProductRecord } from '../../lib/firebase';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { 
  PlusCircle, 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck,
  ChevronRight,
  Filter,
  CheckCircle2,
  Trash2,
  Tag
} from 'lucide-react';

export const ArtisanDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { t, isHindi } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | ProductStatus>('all');
  const [openInquiriesCount, setOpenInquiriesCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allProds = await fetchProducts();
      setProducts(allProds);
      const inqs = await fetchInquiries(currentUser.id);
      setOpenInquiriesCount(inqs.filter(i => i.status === 'new').length);
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
  }, [currentUser.id]);

  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  const activeListingsCount = products.filter((p) => p.status === 'live').length;
  const pendingCount = products.filter((p) => p.status === 'pending_sync').length;
  const soldCount = products.filter((p) => p.status === 'sold').length;

  const handleMarkSold = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markProductAsSoldRecord(productId);
    showToast({
      type: 'success',
      title: isHindi ? 'शिल्प बिक गया' : 'Marked as Sold',
      message: isHindi ? 'उत्पाद को सफलतापूर्वक बिक गया चिह्नित किया गया।' : 'Craft marked as sold successfully!'
    });
    await loadData();
  };

  const handleDelete = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(isHindi ? 'क्या आप इस शिल्प को सूची से हटाना चाहते हैं?' : 'Are you sure you want to delete this listing?')) {
      return;
    }
    await deleteProductRecord(productId);
    showToast({
      type: 'info',
      title: isHindi ? 'शिल्प हटाया गया' : 'Craft Deleted',
      message: isHindi ? 'उत्पाद सूची से हटा दिया गया।' : 'Product deleted from your catalog.'
    });
    await loadData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12">
      
      {/* Welcome & Master Artisan Greeting Header */}
      <div className="bg-paper-100 border border-paper-300 rounded-3xl p-6 sm:p-8 shadow-craft relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-turmeric-100 text-turmeric-900 border border-turmeric-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-turmeric-700" />
            <span>{isHindi ? 'उस्ताद शिल्पी (Master Craftsman)' : 'Master Artisan Certified'}</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-indigo-950">
            {isHindi ? `नमस्ते, ${currentUser.name.split(' ')[0]} जी` : `Namaste, ${currentUser.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Primary CTA: Catalog New Craft */}
        <div className="z-10 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/add-product')}
            leftIcon={<PlusCircle className="w-5 h-5" />}
            className="w-full sm:w-auto shadow-craft-md font-bold text-base"
          >
            {t('dashboard.addNewButton')}
          </Button>
        </div>

        {/* Decorative corner craft watermark */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-terracotta-100/50 -z-0 pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Listings */}
        <div className="bg-paper-100 border border-paper-300 rounded-2xl p-5 shadow-craft flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              {t('dashboard.statListings')}
            </span>
            <div className="font-serif text-3xl font-bold text-indigo-950">
              {activeListingsCount}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {pendingCount > 0 ? `${pendingCount} ${t('dashboard.tabPending')}` : 'All live online'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-paper-200 border border-paper-300 flex items-center justify-center text-terracotta-600 shadow-xs">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Open Inquiries */}
        <Link 
          to="/inbox"
          className="bg-paper-100 border border-paper-300 rounded-2xl p-5 shadow-craft flex items-center justify-between hover:border-terracotta-400 transition-colors group"
        >
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              {t('dashboard.statInquiries')}
            </span>
            <div className="font-serif text-3xl font-bold text-indigo-950 flex items-center gap-2">
              <span>{openInquiriesCount}</span>
              {openInquiriesCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta-500 animate-ping" />
              )}
            </div>
            <div className="text-[11px] text-terracotta-600 font-semibold mt-1 group-hover:underline flex items-center gap-0.5">
              <span>{isHindi ? 'संदेश देखें' : 'View inquiries'}</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-turmeric-100 border border-turmeric-200 flex items-center justify-center text-turmeric-800 shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
        </Link>

        {/* This Month Sales */}
        <Link 
          to="/profile"
          className="bg-paper-100 border border-paper-300 rounded-2xl p-5 shadow-craft flex items-center justify-between hover:border-terracotta-400 transition-colors group"
        >
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              {t('dashboard.statSales')}
            </span>
            <div className="font-serif text-3xl font-bold text-indigo-950">
              ₹1,06,000
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% {isHindi ? 'वृद्धि' : 'from last month'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Workshop Catalog Section */}
      <div className="space-y-4">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-indigo-950">
              {t('dashboard.myCrafts')}
            </h2>
            <p className="text-xs text-stone-500">
              {isHindi ? 'आपकी कार्यशाला में तैयार हस्तशिल्प और उनका बाज़ार स्तर' : 'Craft items cataloged and synced to patrons'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-paper-200 rounded-2xl border border-paper-300 self-start sm:self-auto overflow-x-auto">
            {(['all', 'live', 'draft', 'sold', 'pending_sync'] as ('all' | ProductStatus)[]).map((tab) => {
              const isSelected = activeFilter === tab;
              let label = t('dashboard.tabAll');
              if (tab === 'live') label = t('dashboard.tabLive');
              if (tab === 'draft') label = t('dashboard.tabDraft');
              if (tab === 'sold') label = isHindi ? 'बिका हुआ (Sold)' : 'Sold Out';
              if (tab === 'pending_sync') label = t('dashboard.tabPending');

              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer tap-target-accessible min-h-[38px] ${
                    isSelected
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-indigo-950'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-stone-500 font-medium">
            {t('common.loading')}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-paper-100 border border-dashed border-paper-300 rounded-3xl p-10 text-center space-y-3">
            <Package className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-indigo-950">
              {t('dashboard.emptyMessage')}
            </h3>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/add-product')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              {t('dashboard.addNewButton')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-paper-100 rounded-2xl border border-paper-300 overflow-hidden shadow-craft flex flex-col group hover:shadow-craft-md transition-all"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <Badge status={prod.status} />
                    {prod.giTagged && <Badge giCertified={true} />}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {prod.stockQuantity} {t('common.pieces')}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-indigo-950 line-clamp-1 mb-1">
                      {isHindi && prod.titleHi ? prod.titleHi : prod.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                      {isHindi && prod.descriptionHi ? prod.descriptionHi : prod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-paper-300 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-500 block">
                          {t('review.setFinalPrice')}
                        </span>
                        <span className="font-serif font-bold text-lg text-indigo-950">
                          ₹{prod.finalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <Link
                        to={`/product/${prod.id}`}
                        className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>{t('marketplace.viewDetails')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Artisan Management Toolbar */}
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-paper-300/80">
                      {prod.status === 'live' ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkSold(prod.id, e)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>{isHindi ? 'बिक गया चिह्नित करें' : 'Mark as Sold'}</span>
                        </button>
                      ) : prod.status === 'sold' ? (
                        <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          <span>{isHindi ? 'सफलतापूर्वक बिक चुका है' : 'Sold to Patron'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 capitalize">
                          {prod.status}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(prod.id, e)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title={isHindi ? 'सूची से हटाएं' : 'Delete listing'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
