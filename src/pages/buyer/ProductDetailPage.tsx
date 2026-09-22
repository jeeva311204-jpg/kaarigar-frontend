import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product, InquiryChannel } from '../../types';
import { useTranslation } from '../../i18n';
import { fetchProductById } from '../../lib/firebase';
import { ContactModal } from '../../components/marketplace/ContactModal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Smartphone, 
  ShieldCheck, 
  Layers, 
  Package, 
  Calendar, 
  Sparkles, 
  Check, 
  Volume2, 
  User 
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isHindi } = useTranslation();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactChannel, setContactChannel] = useState<InquiryChannel>('chat');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await fetchProductById(id);
        if (found) {
          setProduct(found);
        } else {
          navigate('/marketplace');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);

  if (isLoading || !product) {
    return (
      <div className="py-24 text-center text-stone-500 font-medium">
        {t('common.loading')}
      </div>
    );
  }

  const title = isHindi && product.titleHi ? product.titleHi : product.title;
  const description = isHindi && product.descriptionHi ? product.descriptionHi : product.description;
  const culturalStory = isHindi && product.culturalStoryHi ? product.culturalStoryHi : product.culturalStory;

  const handleOpenContactWithChannel = (channel: InquiryChannel) => {
    setContactChannel(channel);
    setIsContactOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-14 space-y-8">
      
      {/* Back Button & Category Trail */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-stone-600 hover:text-indigo-950 hover:bg-paper-200 transition-colors cursor-pointer tap-target-accessible"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-stone-500 font-medium">
          <Link to="/marketplace" className="hover:underline">{t('nav.marketplace')}</Link> / <span className="text-stone-800 font-semibold capitalize">{product.category}</span>
        </span>
      </div>

      {/* Main Product Layout: Visuals & Core Specs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Gallery (5 cols) */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-1/1 rounded-3xl overflow-hidden border border-paper-300 bg-stone-100 shadow-craft">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {product.giTagged && <Badge giCertified={true} giTagNumber={product.giTagNumber} />}
              <Badge status={product.status} />
            </div>
          </div>

          {/* Thumbnails if multiple */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-terracotta-500 ring-2 ring-terracotta-300'
                      : 'border-paper-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details, Artisan Provenance & 3-Way Contact (6 cols) */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Provenance Location Tag */}
          <div className="flex items-center gap-1.5 text-xs text-terracotta-700 font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>{product.artisanLocation || product.craftOrigin}</span>
          </div>

          {/* Title & Short Description */}
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-indigo-950 leading-tight">
            {title}
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed font-sans">
            {description}
          </p>

          {/* Fair Price Band Card */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 shadow-craft space-y-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              {t('marketplace.fairPrice')}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-indigo-950">
                ₹{product.finalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                (Fair Band: ₹{product.priceMin} - ₹{product.priceMax})
              </span>
            </div>
            <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% of payment goes directly to master artisan workshop.</span>
            </div>
          </div>

          {/* 3 Contact Actions Panel */}
          <div className="bg-paper-200/80 border border-paper-300 rounded-3xl p-5 shadow-craft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-indigo-950">
                {t('detail.contactHeading')}
              </h3>
              <span className="text-[11px] text-terracotta-700 font-semibold">Zero Middlemen</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. In-App Message */}
              <button
                type="button"
                onClick={() => handleOpenContactWithChannel('chat')}
                className="p-3 rounded-2xl bg-indigo-900 hover:bg-indigo-950 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer tap-target-accessible min-h-[48px]"
              >
                <MessageSquare className="w-4 h-4 text-turmeric-300" />
                <span>{t('detail.btnChat')}</span>
              </button>

              {/* 2. Direct Call */}
              <button
                type="button"
                onClick={() => handleOpenContactWithChannel('call')}
                className="p-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer tap-target-accessible min-h-[48px]"
              >
                <Phone className="w-4 h-4" />
                <span>{t('detail.btnCall')}</span>
              </button>

              {/* 3. Send SMS */}
              <button
                type="button"
                onClick={() => handleOpenContactWithChannel('sms')}
                className="p-3 rounded-2xl bg-paper-100 hover:bg-paper-50 text-indigo-950 border border-paper-300 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer tap-target-accessible min-h-[48px]"
              >
                <Smartphone className="w-4 h-4 text-terracotta-600" />
                <span>{t('detail.btnSms')}</span>
              </button>
            </div>
          </div>

          {/* Artisan Profile Mini Card */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 shadow-craft flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-serif text-lg font-bold">
                {product.artisanName[0]}
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-indigo-950">
                  {product.artisanName}
                </h4>
                <div className="text-xs text-stone-500">
                  {product.artisanLocation}
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800"
            >
              {isHindi ? 'कारीगर परिचय' : 'View Bio'} →
            </Link>
          </div>

        </div>

      </div>

      {/* Cultural Heritage Story & Materials Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
        
        {/* Story Narrative (8 cols) */}
        <div className="md:col-span-8 bg-paper-100 border border-paper-300 rounded-3xl p-6 sm:p-8 shadow-craft space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-turmeric-500" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-indigo-950">
              {t('detail.heritageStory')}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-indigo-950 leading-relaxed font-sans">
            {culturalStory}
          </p>

          {/* Audio Transcript snippet if recorded */}
          {product.audioTranscript && (
            <div className="mt-4 pt-4 border-t border-paper-200 bg-paper-50 p-4 rounded-2xl border border-paper-300">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                <Volume2 className="w-4 h-4 text-terracotta-500" />
                <span>{isHindi ? 'कारीगर की अपनी आवाज़ में:' : 'Artisan\'s Words (Voice Note):'}</span>
              </div>
              <p className="font-serif italic text-sm text-stone-800 leading-relaxed">
                "{isHindi && product.audioTranscriptHi ? product.audioTranscriptHi : product.audioTranscript}"
              </p>
            </div>
          )}
        </div>

        {/* Materials & GI Provenance (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-6 shadow-craft space-y-3">
            <h3 className="font-serif text-base font-bold text-indigo-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-terracotta-500" />
              <span>{t('detail.materials')}</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {product.materials.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 bg-paper-200 text-indigo-950 rounded-xl text-xs font-medium border border-paper-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-6 shadow-craft space-y-3">
            <h3 className="font-serif text-base font-bold text-indigo-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-turmeric-600" />
              <span>{t('detail.provenance')}</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {product.craftOrigin}
            </p>
            {product.giTagged && (
              <div className="pt-2 border-t border-paper-200 text-xs font-bold text-turmeric-800">
                GI Certificate: {product.giTagNumber || 'GI-REG-IN'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3-Way Contact Modal */}
      <ContactModal
        product={product}
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        defaultChannel={contactChannel}
      />

    </div>
  );
};
