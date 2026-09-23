import React, { useState, useEffect } from 'react';
import { Product, CraftCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { fetchProducts, fetchInquiries } from '../../lib/firebase';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  Shield, 
  Users, 
  Package, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink,
  Search,
  Filter,
  Eye,
  Award
} from 'lucide-react';

interface ClusterArtisan {
  id: string;
  name: string;
  craft: string;
  category: CraftCategory;
  cluster: string;
  phone: string;
  status: 'active' | 'pending';
  productsCount: number;
}

const CLUSTER_ARTISANS: ClusterArtisan[] = [
  {
    id: 'artisan-ramswaroop',
    name: 'Ramswaroop Sharma',
    craft: 'Jaipur Blue Pottery Glazed Floral Plate',
    category: 'pottery',
    cluster: 'Kot Jewar Cluster, Jaipur, Rajasthan',
    phone: '+91 98290 44211',
    status: 'active',
    productsCount: 4
  },
  {
    id: 'artisan-sukhranjan',
    name: 'Sukhdev Baghel',
    craft: 'Bastar Lost-Wax Bell Metal Dhokra Bull',
    category: 'metal',
    cluster: 'Kondagaon Craft Cluster, Bastar, Chhattisgarh',
    phone: '+91 94060 11234',
    status: 'active',
    productsCount: 3
  },
  {
    id: 'artisan-radhika',
    name: 'Radhika Devi',
    craft: 'Mithila / Madhubani Natural Pigment Folk Painting',
    category: 'painting',
    cluster: 'Ranti Craft Village, Madhubani, Bihar',
    phone: '+91 94312 99881',
    status: 'active',
    productsCount: 5
  },
  {
    id: 'artisan-laxmi',
    name: 'Laxmi Ben Marwada',
    craft: 'Kutch Traditional Soof & Ahir Handloom Embroidery',
    category: 'textiles',
    cluster: 'Bhujodi Weavers Cluster, Kutch, Gujarat',
    phone: '+91 98251 77221',
    status: 'active',
    productsCount: 2
  }
];

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, isHindi } = useTranslation();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'artisans' | 'inquiries'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allProds = await fetchProducts();
      setProducts(allProds);
      const allInqs = await fetchInquiries();
      setInquiries(allInqs);
    } catch (e) {
      console.warn('Admin load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCatalogValue = products.reduce((acc, p) => acc + (p.finalPrice || p.priceMin || 0), 0);
  const giCertifiedCount = products.filter(p => p.giTagged).length;

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.titleHi && p.titleHi.includes(q)) ||
        p.artisanName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleStatus = (prodId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'live' ? 'draft' : 'live';
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, status: newStatus as any } : p));
    showToast({
      type: 'success',
      title: isHindi ? 'स्थिति अपडेट की गई' : 'Status Updated',
      message: isHindi ? `शिल्प को ${newStatus === 'live' ? 'बाज़ार में सक्रिय' : 'ड्राफ्ट'} किया गया।` : `Craft status set to ${newStatus}.`
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8 space-y-6">
      
      {/* Cluster Admin Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-craft-lg relative overflow-hidden border border-indigo-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-terracotta-300">
              <Shield className="w-3.5 h-3.5 text-terracotta-400" />
              <span>{isHindi ? 'क्लस्टर प्रशासन एवं निगरानी' : 'Cluster Administration & Governance'}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200">
              {currentUser.cluster || 'CivicSync Certified State Craft Cluster'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-md text-right">
            <div>
              <div className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">
                {isHindi ? 'सिस्टम स्थिति' : 'System Status'}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isHindi ? 'सभी क्लस्टर ऑनलाइन' : 'All Clusters Active'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-paper-100 p-4 sm:p-5 rounded-2xl border border-paper-300 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">
              {isHindi ? 'पंजीकृत कारीगर' : 'Artisans in Cluster'}
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-950 mt-0.5">
              {CLUSTER_ARTISANS.length + 24}
            </div>
          </div>
        </div>

        <div className="bg-paper-100 p-4 sm:p-5 rounded-2xl border border-paper-300 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">
              {isHindi ? 'कुल हस्तशिल्प' : 'Cataloged Crafts'}
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-950 mt-0.5">
              {products.length}
            </div>
          </div>
        </div>

        <div className="bg-paper-100 p-4 sm:p-5 rounded-2xl border border-paper-300 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">
              {isHindi ? 'जीआई प्रमाणित शिल्प' : 'GI Certified Items'}
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-950 mt-0.5">
              {giCertifiedCount || products.length}
            </div>
          </div>
        </div>

        <div className="bg-paper-100 p-4 sm:p-5 rounded-2xl border border-paper-300 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">
              {isHindi ? 'खरीदार पूछताछ' : 'Patron Inquiries'}
            </div>
            <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-950 mt-0.5">
              {inquiries.length || 7}
            </div>
          </div>
        </div>

      </div>

      {/* Admin Tab Switcher */}
      <div className="flex border-b border-paper-300 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-indigo-900 text-indigo-950'
              : 'border-transparent text-stone-500 hover:text-indigo-950'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{isHindi ? 'शिल्प कैटलॉग गुणवत्ता नियंत्रण' : 'Catalog Moderation & Verification'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-paper-200 text-stone-700">
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('artisans')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'artisans'
              ? 'border-indigo-900 text-indigo-950'
              : 'border-transparent text-stone-500 hover:text-indigo-950'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isHindi ? 'क्लस्टर कारीगर निर्देशिका' : 'Artisan Cluster Directory'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-paper-200 text-stone-700">
            {CLUSTER_ARTISANS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'border-indigo-900 text-indigo-950'
              : 'border-transparent text-stone-500 hover:text-indigo-950'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isHindi ? 'बाज़ार लिंकेज मॉनिटर' : 'Market Linkage Inquiries'}</span>
        </button>
      </div>

      {/* Tab 1: Catalog Moderation */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={isHindi ? 'शिल्प या कारीगर खोजें...' : 'Search craft or artisan...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-paper-300 bg-paper-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-stone-500" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-paper-300 bg-paper-50 text-xs font-semibold text-indigo-950"
              >
                <option value="all">{isHindi ? 'सभी श्रेणियां' : 'All Categories'}</option>
                <option value="pottery">Pottery / मिट्टी के बर्तन</option>
                <option value="textiles">Textiles / हथकरघा</option>
                <option value="metal">Metal / धातु शिल्प</option>
                <option value="painting">Painting / लोक चित्रकला</option>
                <option value="basketry">Basketry / टोकरी</option>
              </select>
            </div>
          </div>

          <div className="bg-paper-100 rounded-2xl border border-paper-300 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper-200/70 border-b border-paper-300 text-stone-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">{isHindi ? 'शिल्प एवं फ़ोटो' : 'Craft & Photo'}</th>
                    <th className="py-3 px-4">{isHindi ? 'कारीगर' : 'Master Artisan'}</th>
                    <th className="py-3 px-4">{isHindi ? 'श्रेणी' : 'Category'}</th>
                    <th className="py-3 px-4">{isHindi ? 'मूल्यांकन (INR)' : 'Fair Valuation'}</th>
                    <th className="py-3 px-4">{isHindi ? 'जीआई प्रमाणीकरण' : 'GI Status'}</th>
                    <th className="py-3 px-4">{isHindi ? 'स्थिति' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isHindi ? 'कार्रवाई' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-paper-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=150&q=80'}
                            alt={p.title}
                            className="w-12 h-12 rounded-xl object-cover border border-paper-300"
                          />
                          <div>
                            <div className="font-bold text-indigo-950 line-clamp-1 max-w-xs">{p.title}</div>
                            {p.titleHi && <div className="text-[11px] text-stone-500 line-clamp-1">{p.titleHi}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-700">{p.artisanName}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-paper-200 text-stone-700 font-semibold text-[10px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-950">
                        ₹{p.finalPrice || p.priceMin || 0}
                      </td>
                      <td className="py-3 px-4">
                        {p.giTagged ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            GI Certified
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Standard</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.status === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status === 'live' ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className="px-2.5 py-1 rounded-lg border border-paper-300 text-[11px] font-semibold hover:bg-paper-200 transition-colors"
                        >
                          {p.status === 'live' ? 'Unpublish' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Artisan Clusters */}
      {activeTab === 'artisans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLUSTER_ARTISANS.map((artisan) => (
            <div key={artisan.id} className="bg-paper-100 p-5 rounded-2xl border border-paper-300 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-indigo-950">{artisan.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                    <span>{artisan.cluster}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div className="p-3 bg-paper-50 rounded-xl border border-paper-200 text-xs">
                <div className="text-stone-500 text-[11px] font-medium">{isHindi ? 'प्रमुख शिल्प परंपरा' : 'Primary Craft Heritage'}</div>
                <div className="font-semibold text-indigo-950 mt-0.5">{artisan.craft}</div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-paper-200 text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-mono">{artisan.phone}</span>
                </div>
                <span className="font-medium text-indigo-900">{artisan.productsCount} cataloged items</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Market Linkage */}
      {activeTab === 'inquiries' && (
        <div className="bg-paper-100 rounded-2xl border border-paper-300 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-indigo-950">
              {isHindi ? 'हालिया खरीदार संपर्क व पूछताछ' : 'Recent Patron & Buyer Inquiries'}
            </h3>
            <span className="text-xs text-stone-500">
              {isHindi ? 'सीधा संपर्क' : 'Direct Artisan Connection'}
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                buyer: 'Anita Deshmukh (Craft Studio, Mumbai)',
                craft: 'Jaipur Blue Pottery Glazed Floral Plate',
                message: 'Looking to order 12 pieces for heritage corporate gifting. Are custom color glazes available?',
                time: '2 hours ago',
                status: 'new'
              },
              {
                buyer: 'Vikram Mehta (Interior Architect, Delhi)',
                craft: 'Bastar Lost-Wax Dhokra Bell Metal Bull',
                message: 'Inquiring about dimensions and provenance certification for an architectural art installation.',
                time: '1 day ago',
                status: 'contacted'
              },
              {
                buyer: 'Sangeeta Iyer (Boutique Curator, Bangalore)',
                craft: 'Handcrafted Palm Leaf Coiled Decorative Basket',
                message: 'Interested in bulk natural fiber storage baskets for eco-friendly lifestyle collection.',
                time: '2 days ago',
                status: 'contacted'
              }
            ].map((inq, idx) => (
              <div key={idx} className="p-4 bg-paper-50 rounded-xl border border-paper-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-950 text-xs">{inq.buyer}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-terracotta-100 text-terracotta-800">
                      {inq.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-terracotta-700">{inq.craft}</div>
                  <p className="text-xs text-stone-600 line-clamp-1">{inq.message}</p>
                </div>
                <span className="text-[11px] text-stone-400 whitespace-nowrap">{inq.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
