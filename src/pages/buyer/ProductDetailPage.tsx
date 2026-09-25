import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product, InquiryChannel } from '../../types';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchProductById, markProductAsSoldRecord, deleteProductRecord } from '../../lib/firebase';
import { purchaseProduct } from '../../lib/api';
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
  User,
  CheckCircle2,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  X
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isHindi, language } = useTranslation();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactChannel, setContactChannel] = useState<InquiryChannel>('chat');
  const [isLoading, setIsLoading] = useState(true);

  // Buyer Direct Purchase & Stock States
  const [purchaseQty, setPurchaseQty] = useState<number>(1);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseReceipt, setPurchaseReceipt] = useState<{
    quantityPurchased: number;
    remainingStock: number;
    totalAmount: number;
    orderId?: string;
  } | null>(null);

  const [buyerName, setBuyerName] = useState(currentUser?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cod'>('upi');

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

  const title = (language !== 'en' && product.titleHi) ? product.titleHi : product.title;
  const description = (language !== 'en' && product.descriptionHi) ? product.descriptionHi : product.description;
  const culturalStory = (language !== 'en' && product.culturalStoryHi) ? product.culturalStoryHi : product.culturalStory;

  const isOwner = Boolean(
    currentUser && (currentUser.id === product.artisanId || currentUser.id === product.ownerId)
  );

  useEffect(() => {
    const handleStoreUpdate = async () => {
      if (!id) return;
      const found = await fetchProductById(id);
      if (found) {
        setProduct(found);
      }
    };
    window.addEventListener('kaarigar_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('kaarigar_store_updated', handleStoreUpdate);
  }, [id]);

  const handlePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!buyerName.trim() || !buyerPhone.trim()) {
      showToast({
        type: 'error',
        title: isHindi ? 'विवरण आवश्यक' : 'Details Required',
        message: isHindi ? 'कृपया अपना नाम और फ़ोन नंबर दर्ज करें।' : 'Please enter your name and phone number.'
      });
      return;
    }

    if (purchaseQty > product.stockQuantity) {
      showToast({
        type: 'error',
        title: isHindi ? 'अपर्याप्त स्टॉक' : 'Insufficient Stock',
        message: isHindi
          ? `केवल ${product.stockQuantity} नग कार्यशाला में उपलब्ध हैं।`
          : `Only ${product.stockQuantity} piece(s) available in workshop.`
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const res = await purchaseProduct(product.id, purchaseQty, {
        name: buyerName.trim(),
        phone: buyerPhone.trim(),
        address: buyerAddress.trim() || 'Direct Workshop Delivery'
      });

      setProduct(res.product);
      setPurchaseReceipt({
        quantityPurchased: purchaseQty,
        remainingStock: res.remainingStock,
        totalAmount: product.finalPrice * purchaseQty,
        orderId: `ORD-${Date.now().toString(36).toUpperCase()}`
      });

      showToast({
        type: 'success',
        title: isHindi ? 'आर्डर सफलतापूर्वक दर्ज!' : 'Order Placed Directly!',
        message: isHindi
          ? `आपने ${purchaseQty} नग खरीदे। कार्यशाला में अब ${res.remainingStock} नग शेष हैं।`
          : `You purchased ${purchaseQty} piece(s). ${res.remainingStock} pieces left in stock.`
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: isHindi ? 'खरीद विफल' : 'Purchase Failed',
        message: err.message || 'Could not complete purchase. Please try again.'
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleMarkSold = async () => {
    if (!product) return;
    await markProductAsSoldRecord(product.id);
    showToast({
      type: 'success',
      title: isHindi ? 'शिल्प बिक गया' : 'Marked as Sold',
      message: isHindi ? 'उत्पाद को सफलतापूर्वक बिक गया चिह्नित किया गया।' : 'Craft marked as sold successfully!'
    });
    setProduct((prev) => prev ? { ...prev, status: 'sold', soldAt: new Date().toISOString() } : null);
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (!window.confirm(isHindi ? 'क्या आप इस शिल्प को सूची से हटाना चाहते हैं?' : 'Are you sure you want to delete this listing?')) {
      return;
    }
    await deleteProductRecord(product.id);
    showToast({
      type: 'info',
      title: isHindi ? 'शिल्प हटाया गया' : 'Craft Deleted',
      message: isHindi ? 'उत्पाद सूची से हटा दिया गया।' : 'Product deleted from your catalog.'
    });
    navigate(-1);
  };

  const handleOpenContactWithChannel = (channel: InquiryChannel) => {
    setContactChannel(channel);
    setIsContactOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-14 space-y-6">
      
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

      {/* Artisan Owner Quick Controls Banner */}
      {isOwner && (
        <div className="bg-indigo-950 text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-craft border border-indigo-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-turmeric-500/20 border border-turmeric-400/30 flex items-center justify-center text-turmeric-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-paper-50">
                {isHindi ? 'आप इस शिल्प के निर्माता हैं (Artisan Controls)' : 'You are the craftsman of this listing (Artisan Controls)'}
              </div>
              <div className="text-[11px] text-stone-300">
                {product.status === 'sold'
                  ? (isHindi ? 'यह शिल्प बिक चुका है' : 'Status: Marked as Sold')
                  : (isHindi ? 'स्थिति: लाइव बाज़ार में सक्रिय' : 'Status: Live in marketplace')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {product.status === 'live' && (
              <button
                type="button"
                onClick={handleMarkSold}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHindi ? 'बिक गया चिह्नित करें' : 'Mark as Sold'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isHindi ? 'सूची से हटाएं' : 'Delete'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Product Layout: Visuals & Core Specs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Gallery (6 cols) */}
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

          {/* Fair Price Band & Workshop Stock Card */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 shadow-craft space-y-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              {t('marketplace.fairPrice')}
            </span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-indigo-950">
                ₹{product.finalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-semibold text-stone-500">
                / {isHindi ? 'नग' : 'piece'}
              </span>
              <span className="text-xs text-stone-500 font-medium ml-1">
                (Fair Band: ₹{product.priceMin} - ₹{product.priceMax} per piece)
              </span>
            </div>

            {/* Live Stock Availability Indicator */}
            <div className="pt-2 border-t border-paper-200">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs ${
                product.stockQuantity <= 0 || product.status === 'sold'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : product.stockQuantity <= 5
                  ? 'bg-terracotta-100 text-terracotta-900 border border-terracotta-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              }`}>
                <Package className="w-4 h-4 text-turmeric-700 shrink-0" />
                <span>
                  {product.stockQuantity <= 0 || product.status === 'sold'
                    ? (isHindi ? 'बिक चुका है (0 नग शेष)' : 'Out of Stock / Sold Out (0 pieces left)')
                    : product.stockQuantity <= 5
                    ? (isHindi ? `🔥 केवल ${product.stockQuantity} नग कार्यशाला में शेष!` : `🔥 Urgent: Only ${product.stockQuantity} piece${product.stockQuantity > 1 ? 's' : ''} left in workshop stock!`)
                    : (isHindi ? `✓ उपलब्ध स्टॉक: ${product.stockQuantity} नग तुरंत तैयार` : `✓ In Stock: ${product.stockQuantity} pieces ready in workshop`)}
                </span>
              </div>
            </div>

            <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% of payment goes directly to master artisan workshop.</span>
            </div>
          </div>

          {/* Direct Buy / Purchase Action Panel or Sold Out Notice */}
          {product.status === 'sold' || product.stockQuantity <= 0 ? (
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 text-center space-y-2.5 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-purple-950">
                {isHindi ? 'यह शिल्प बिक चुका है' : 'This Craft Has Been Sold Out'}
              </h3>
              <p className="text-xs text-purple-800 max-w-sm mx-auto leading-relaxed">
                {isHindi 
                  ? 'यह अनूठी हस्तकला पूरी तरह बिक चुकी है (0 नग शेष)। अन्य प्रामाणिक शिल्पों के लिए बाज़ार ब्राउज़ करें।' 
                  : 'All handcrafted units for this heirloom have been purchased by patrons (0 pieces left). Explore our marketplace for more master craftworks.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/marketplace')}
                className="mt-2 text-purple-900 border-purple-300 hover:bg-purple-100"
              >
                {t('nav.marketplace')}
              </Button>
            </div>
          ) : (
            <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 sm:p-6 shadow-craft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    {isHindi ? 'खरीद संख्या चुनें' : 'Select Quantity to Buy'}
                  </span>
                  <span className="text-xs text-stone-600 font-medium">
                    {isHindi ? `कार्यशाला में उपलब्ध: ${product.stockQuantity} नग` : `Workshop Stock: ${product.stockQuantity} pieces left`}
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPurchaseQty((prev) => Math.max(1, prev - 1))}
                    disabled={purchaseQty <= 1}
                    className="w-10 h-10 rounded-xl bg-paper-200 hover:bg-paper-300 text-indigo-950 font-bold border border-paper-300 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 disabled:opacity-30 transition-transform tap-target-accessible"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-10 text-center font-serif text-xl font-bold text-indigo-950">
                    {purchaseQty}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPurchaseQty((prev) => Math.min(product.stockQuantity, prev + 1))}
                    disabled={purchaseQty >= product.stockQuantity}
                    className="w-10 h-10 rounded-xl bg-paper-200 hover:bg-paper-300 text-indigo-950 font-bold border border-paper-300 flex items-center justify-center cursor-pointer shadow-xs active:scale-95 disabled:opacity-30 transition-transform tap-target-accessible"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Price Calculation Banner */}
              <div className="p-3.5 rounded-2xl bg-paper-50 border border-paper-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-stone-500 block">{isHindi ? 'कुल देय राशि:' : 'Total Payable:'}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl font-bold text-terracotta-600">
                      ₹{(product.finalPrice * purchaseQty).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      ({purchaseQty} {purchaseQty === 1 ? 'piece' : 'pieces'} × ₹{product.finalPrice.toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-stone-500 block">{isHindi ? 'खरीद बाद शेष:' : 'Stock left after order:'}</span>
                  <span className="font-bold text-indigo-950 text-sm">
                    {product.stockQuantity - purchaseQty} {t('common.pieces')}
                  </span>
                </div>
              </div>

              {/* Direct Buy Button */}
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => {
                  setPurchaseReceipt(null);
                  setIsBuyModalOpen(true);
                }}
                leftIcon={<ShoppingBag className="w-5 h-5 text-turmeric-300" />}
                className="w-full font-bold text-base py-4 shadow-craft-md cursor-pointer"
              >
                {isHindi
                  ? `सीधे खरीदें (${purchaseQty} नग — ₹${(product.finalPrice * purchaseQty).toLocaleString('en-IN')})`
                  : `Buy Now (${purchaseQty} ${purchaseQty === 1 ? 'piece' : 'pieces'} — ₹${(product.finalPrice * purchaseQty).toLocaleString('en-IN')})`}
              </Button>
            </div>
          )}
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

      {/* Direct Artisan Purchase Modal */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-paper-50 rounded-3xl border border-paper-300 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-paper-100 border-b border-paper-300 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-indigo-950 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-terracotta-600" />
                  <span>
                    {purchaseReceipt
                      ? (isHindi ? 'आर्डर सफलतापूर्वक दर्ज!' : 'Order Placed Directly!')
                      : (isHindi ? 'कारीगर से सीधे खरीदें' : 'Direct Artisan Purchase')}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  {purchaseReceipt
                    ? (isHindi ? 'कारीगर को आपका विवरण भेज दिया गया है' : 'Order received by craftsman workshop')
                    : (isHindi ? `100% भुगतान सीधे ${product.artisanName} को जाएगा` : `100% of proceeds go directly to ${product.artisanName}`)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsBuyModalOpen(false);
                  setPurchaseReceipt(null);
                }}
                className="w-8 h-8 rounded-full bg-paper-200 hover:bg-paper-300 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {purchaseReceipt ? (
                /* Success Receipt View */
                <div className="space-y-4 text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-xl text-indigo-950">
                      {isHindi ? 'खरीद सफल रही!' : 'Order Confirmed!'}
                    </h4>
                    <span className="text-xs font-mono font-bold text-terracotta-600 uppercase tracking-widest block mt-0.5">
                      {purchaseReceipt.orderId}
                    </span>
                  </div>

                  {/* Stock Deduction Highlight Banner */}
                  <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 shadow-xs ${
                    purchaseReceipt.remainingStock === 0
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}>
                    <Package className="w-6 h-6 text-terracotta-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">
                        {isHindi ? 'कार्यशाला स्टॉक अपडेट:' : 'Live Workshop Stock Updated:'}
                      </div>
                      <div className="text-xs mt-0.5 leading-relaxed">
                        {isHindi
                          ? `आपने ${purchaseReceipt.quantityPurchased} नग खरीदे। `
                          : `You bought ${purchaseReceipt.quantityPurchased} piece(s). `}
                        <strong className="text-terracotta-700 underline font-semibold">
                          {purchaseReceipt.remainingStock === 0
                            ? (isHindi ? 'अब सभी नग बिक चुके हैं (0 नग शेष - Sold Out)' : '0 pieces left — Craft is now Sold Out!')
                            : (isHindi ? `अब केवल ${purchaseReceipt.remainingStock} नग शेष हैं।` : `Now ${purchaseReceipt.remainingStock} piece(s) remaining in stock.`)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Receipt Box */}
                  <div className="bg-paper-100 border border-paper-200 rounded-2xl p-4 text-left space-y-2.5 text-xs text-stone-700">
                    <div className="flex justify-between pb-2 border-b border-paper-200 font-medium">
                      <span>{isHindi ? 'शिल्प का नाम' : 'Craft'}</span>
                      <span className="font-bold text-indigo-950">{title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isHindi ? 'खरीदी गई संख्या' : 'Quantity Purchased'}</span>
                      <span className="font-bold text-indigo-950">{purchaseReceipt.quantityPurchased} {t('common.pieces')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isHindi ? 'प्रति नग मूल्य' : 'Unit Price'}</span>
                      <span>₹{product.finalPrice.toLocaleString('en-IN')} / piece</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-paper-200 text-sm font-bold text-indigo-950">
                      <span>{isHindi ? 'कुल राशि' : 'Total Amount'}</span>
                      <span className="text-terracotta-600 font-serif text-lg">
                        ₹{purchaseReceipt.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-stone-500 bg-paper-100 p-3 rounded-xl border border-paper-200">
                    {isHindi
                      ? `कारीगर (${product.artisanName}) को आपका आर्डर और फ़ोन नंबर (${buyerPhone}) प्राप्त हो गया है। वे सीधे आपसे संपर्क करेंगे।`
                      : `The craftsman (${product.artisanName}) has received your order. Delivery will be coordinated directly via ${buyerPhone}.`}
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setIsBuyModalOpen(false);
                      setPurchaseReceipt(null);
                    }}
                    className="w-full font-bold cursor-pointer"
                  >
                    {isHindi ? 'पूर्ण (Done)' : 'Continue Exploring Crafts'}
                  </Button>
                </div>
              ) : (
                /* Checkout Form View */
                <form onSubmit={handlePurchaseOrder} className="space-y-4">
                  {/* Item Summary Card */}
                  <div className="p-3.5 bg-paper-100 border border-paper-300 rounded-2xl flex items-center gap-3">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80'}
                      alt={title}
                      className="w-16 h-16 rounded-xl object-cover border border-paper-300 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-indigo-950 truncate">
                        {title}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">
                        {product.artisanName} • {product.artisanLocation}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-serif font-bold text-terracotta-600">
                          ₹{product.finalPrice.toLocaleString('en-IN')} / piece
                        </span>
                        <span className="text-[11px] text-stone-500">
                          ({product.stockQuantity} in stock)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Selector inside checkout */}
                  <div className="p-3.5 rounded-2xl bg-paper-100 border border-paper-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-indigo-950">
                        {isHindi ? 'खरीद संख्या (Pieces to Buy)' : 'Number of Pieces to Buy'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {isHindi
                          ? `खरीद बाद शेष: ${product.stockQuantity - purchaseQty} नग`
                          : `Remaining stock after purchase: ${product.stockQuantity - purchaseQty} piece(s)`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPurchaseQty((p) => Math.max(1, p - 1))}
                        disabled={purchaseQty <= 1}
                        className="w-8 h-8 rounded-lg bg-paper-200 hover:bg-paper-300 text-indigo-950 font-bold border border-paper-300 flex items-center justify-center cursor-pointer disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-base text-indigo-950">
                        {purchaseQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPurchaseQty((p) => Math.min(product.stockQuantity, p + 1))}
                        disabled={purchaseQty >= product.stockQuantity}
                        className="w-8 h-8 rounded-lg bg-paper-200 hover:bg-paper-300 text-indigo-950 font-bold border border-paper-300 flex items-center justify-center cursor-pointer disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Buyer Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      {isHindi ? 'आपका नाम (Buyer Name) *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder={isHindi ? 'उदा. राजेश शर्मा' : 'e.g., Rajesh Sharma'}
                      className="w-full px-3.5 py-2.5 bg-paper-100 border border-paper-300 rounded-xl text-sm text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                    />
                  </div>

                  {/* Buyer Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      {isHindi ? 'मोबाइल नंबर (Phone / WhatsApp) *' : 'Mobile Number (Phone / WhatsApp) *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="tel"
                        required
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-paper-100 border border-paper-300 rounded-xl text-sm text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">
                      {isHindi ? 'डिलीवरी पता / शहर (Delivery Address)' : 'Delivery Address & City'}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={buyerAddress}
                        onChange={(e) => setBuyerAddress(e.target.value)}
                        placeholder={isHindi ? 'उदा. 12, रामबाग रोड, जयपुर' : 'e.g., 12, Rambagh Road, Jaipur'}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-paper-100 border border-paper-300 rounded-xl text-sm text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                      />
                    </div>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 block">
                      {isHindi ? 'भुगतान का प्रकार (Payment Method)' : 'Payment Method'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('upi')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          paymentMode === 'upi'
                            ? 'bg-terracotta-50/70 border-terracotta-500 ring-1 ring-terracotta-500'
                            : 'bg-paper-100 border-paper-300 hover:bg-paper-200'
                        }`}
                      >
                        <div className="font-bold text-xs text-indigo-950">
                          {isHindi ? '📱 सीधे UPI' : '📱 Direct UPI'}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          GPay / PhonePe / Paytm
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMode('cod')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          paymentMode === 'cod'
                            ? 'bg-terracotta-50/70 border-terracotta-500 ring-1 ring-terracotta-500'
                            : 'bg-paper-100 border-paper-300 hover:bg-paper-200'
                        }`}
                      >
                        <div className="font-bold text-xs text-indigo-950">
                          {isHindi ? '📦 डिलीवरी पर नकद' : '📦 Cash on Delivery'}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          Pay upon receipt
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Total Amount & Submit Button */}
                  <div className="pt-2 border-t border-paper-200 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600 font-medium">
                        {isHindi ? `कुल देय (${purchaseQty} नग)` : `Total Payable (${purchaseQty} pc)`}
                      </span>
                      <div className="font-serif text-2xl font-bold text-terracotta-600">
                        ₹{(product.finalPrice * purchaseQty).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isPurchasing}
                      className="w-full font-bold py-3.5 shadow-craft-md cursor-pointer"
                    >
                      {isPurchasing
                        ? (isHindi ? 'आर्डर दर्ज हो रहा है...' : 'Confirming Order...')
                        : (isHindi
                            ? `आर्डर कन्फर्म करें (₹${(product.finalPrice * purchaseQty).toLocaleString('en-IN')})`
                            : `Confirm Order (₹${(product.finalPrice * purchaseQty).toLocaleString('en-IN')})`)}
                    </Button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
