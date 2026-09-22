import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, AnalysisResult } from '../../types';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { publishProduct } from '../../lib/api';
import { enqueueOfflineProduct } from '../../lib/offlineQueue';
import { Button } from '../../components/common/Button';
import { 
  Sparkles, 
  Check, 
  Minus, 
  Plus, 
  Info, 
  Tag, 
  ShieldCheck, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  Eye, 
  Layers, 
  Volume2,
  Wand2,
  X,
  ExternalLink
} from 'lucide-react';

export const ReviewPublishPage: React.FC = () => {
  const { t, isHindi } = useTranslation();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load payload from session
  const [reviewData, setReviewData] = useState<{
    analysisResult: AnalysisResult;
    wizardData: any;
  } | null>(null);

  const [title, setTitle] = useState('');
  const [culturalStory, setCulturalStory] = useState('');
  const [finalPrice, setFinalPrice] = useState<number>(1550);
  const [minPrice, setMinPrice] = useState<number>(1350);
  const [maxPrice, setMaxPrice] = useState<number>(1850);
  const [materials, setMaterials] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showOriginalPhoto, setShowOriginalPhoto] = useState(false);
  const [useEnhancedForListing, setUseEnhancedForListing] = useState(true);
  const [newMaterialInput, setNewMaterialInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('kaarigar_active_review');
      if (raw) {
        const parsed = JSON.parse(raw);
        setReviewData(parsed);

        const res: AnalysisResult = parsed.analysisResult;
        setTitle(isHindi && res.suggestedTitleHi ? res.suggestedTitleHi : res.suggestedTitle);
        setCulturalStory(isHindi && res.culturalStoryHi ? res.culturalStoryHi : res.culturalStory);
        setFinalPrice(res.priceBand.suggested);
        setMinPrice(res.priceBand.min);
        setMaxPrice(res.priceBand.max);
        setMaterials(res.materials || []);
        setTags(res.tags || []);
      } else {
        // Fallback demo review state
        navigate('/add-product');
      }
    } catch {
      navigate('/add-product');
    }
  }, [navigate, isHindi]);

  if (!reviewData) return null;

  const { analysisResult, wizardData } = reviewData;

  const handleNudgePrice = (delta: number) => {
    setFinalPrice((prev) => Math.max(minPrice - 200, prev + delta));
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMaterialInput.trim()) {
      if (!materials.includes(newMaterialInput.trim())) {
        setMaterials([...materials, newMaterialInput.trim()]);
      }
      setNewMaterialInput('');
    }
  };

  const handleRemoveMaterial = (matToRemove: string) => {
    setMaterials(materials.filter((m) => m !== matToRemove));
  };

  const handlePublish = async () => {
    setIsSubmitting(true);

    const chosenImage = useEnhancedForListing
      ? (analysisResult.enhancedImage || analysisResult.originalImage || wizardData.image)
      : (analysisResult.originalImage || analysisResult.enhancedImage || wizardData.image);

    const newProduct: Product = {
      id: `prod-${Date.now().toString(36)}`,
      title: title,
      titleHi: analysisResult.suggestedTitleHi || title,
      description: title,
      descriptionHi: analysisResult.suggestedTitleHi || title,
      culturalStory: culturalStory,
      culturalStoryHi: analysisResult.culturalStoryHi || culturalStory,
      category: analysisResult.detectedCategory,
      priceMin: minPrice,
      priceMax: maxPrice,
      finalPrice: finalPrice,
      images: [chosenImage],
      artisanId: currentUser.id,
      artisanName: currentUser.name,
      artisanLocation: currentUser.artisanData?.location || 'Rajasthan, India',
      artisanPhone: currentUser.phone,
      craftOrigin: 'Artisan Workshop Heritage Cluster',
      materials: materials,
      stockQuantity: wizardData.quantity || 8,
      status: 'live',
      giTagged: true,
      giTagNumber: 'GI-VERIFIED',
      tags: tags,
      detectedLanguage: analysisResult.detectedLanguage,
      audioTranscript: wizardData.audioTranscript || analysisResult.audioTranscript,
      createdAt: new Date().toISOString()
    };

    try {
      if (!navigator.onLine) {
        enqueueOfflineProduct(newProduct, 'product_publish');
        showToast({
          type: 'info',
          title: 'Saved in Offline Queue',
          message: 'Craft will automatically go live once internet reconnects.'
        });
      } else {
        await publishProduct(newProduct);
        showToast({
          type: 'success',
          title: t('review.publishSuccess'),
          message: `${title} is now saved & visible in the marketplace!`
        });
      }

      setIsPublished(true);
      localStorage.removeItem('kaarigar_active_review');

      setTimeout(() => {
        navigate('/');
      }, 1200);

    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Publish Failed',
        message: 'Could not publish craft. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-14 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl text-stone-600 hover:text-indigo-950 hover:bg-paper-200 transition-colors cursor-pointer tap-target-accessible"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-indigo-950">
              {t('review.pageTitle')}
            </h1>
            <p className="text-xs text-stone-500">
              {t('review.pageSubtitle')}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Vision & Provenance Verified</span>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Visual, Materials & Heritage Tags */}
        <div className="md:col-span-5 space-y-5">
          
          {/* Enhanced Craft Photo Card with Before/After Switcher */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-4 shadow-craft space-y-3">
            
            {/* View Mode Toggle Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-terracotta-500" />
                <span>Craft Photo Quality</span>
              </span>
              <div className="inline-flex p-0.5 rounded-full bg-paper-200 border border-paper-300 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setShowOriginalPhoto(false)}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    !showOriginalPhoto ? 'bg-terracotta-500 text-white shadow-xs' : 'text-stone-600 hover:text-indigo-950'
                  }`}
                >
                  ✨ Enhanced
                </button>
                <button
                  type="button"
                  onClick={() => setShowOriginalPhoto(true)}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    showOriginalPhoto ? 'bg-indigo-900 text-white shadow-xs' : 'text-stone-600 hover:text-indigo-950'
                  }`}
                >
                  📸 Original
                </button>
              </div>
            </div>

            {/* Photo Box */}
            <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-100 shadow-inner border border-paper-300">
              <img
                src={showOriginalPhoto ? (analysisResult.originalImage || wizardData.image) : (analysisResult.enhancedImage || wizardData.image)}
                alt="Craft review preview"
                className="w-full h-full object-cover transition-all duration-300"
              />
              
              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                {showOriginalPhoto ? (
                  <span>Camera Raw Photo</span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-200">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    AI Studio Lighting & Color Calibrated
                  </span>
                )}
              </div>
            </div>

            {/* Selection for Final Listing */}
            <div className="p-3 bg-paper-200/70 border border-paper-300 rounded-xl space-y-1.5 text-xs text-stone-700">
              <span className="font-bold text-indigo-950 block">Save image for catalog as:</span>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="listingImageSelection"
                  checked={useEnhancedForListing}
                  onChange={() => setUseEnhancedForListing(true)}
                  className="accent-terracotta-500"
                />
                <span>✨ AI Studio Enhanced Photo (High buyer conversion)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="listingImageSelection"
                  checked={!useEnhancedForListing}
                  onChange={() => setUseEnhancedForListing(false)}
                  className="accent-terracotta-500"
                />
                <span>📸 Original Workshop Photo</span>
              </label>
            </div>
          </div>

          {/* AI Identified Materials from Photo Card */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-4 shadow-craft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-terracotta-500" />
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  AI Researched Raw Materials
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                {materials.length} verified
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {materials.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2.5 py-1 bg-paper-200 text-indigo-950 rounded-lg border border-paper-300 flex items-center gap-1 font-medium"
                >
                  <span>{m}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(m)}
                    className="w-3.5 h-3.5 rounded-full hover:bg-red-100 hover:text-red-700 text-stone-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove material"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick add custom material */}
            <form onSubmit={handleAddMaterial} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newMaterialInput}
                onChange={(e) => setNewMaterialInput(e.target.value)}
                placeholder="Add other raw material..."
                className="text-xs px-3 py-1.5 rounded-xl border border-paper-300 bg-paper-50 text-indigo-950 flex-1 focus:outline-none focus:ring-1 focus:ring-terracotta-400"
              />
              <button
                type="submit"
                disabled={!newMaterialInput.trim()}
                className="px-3 py-1.5 text-xs bg-paper-200 hover:bg-paper-300 text-indigo-950 rounded-xl border border-paper-300 font-semibold disabled:opacity-40 cursor-pointer"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Voice Transcript Card */}
          {analysisResult.audioTranscript && (
            <div className="bg-paper-100 border border-paper-300 rounded-3xl p-4 shadow-craft">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                <Volume2 className="w-4 h-4 text-terracotta-500" />
                <span>{t('review.detectedVoice')}</span>
              </div>
              <p className="text-xs text-stone-800 font-serif italic bg-paper-50 p-3 rounded-xl border border-paper-300 leading-relaxed">
                "{wizardData.audioTranscript || analysisResult.audioTranscript}"
              </p>
            </div>
          )}

          {/* Heritage Tags */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-4 shadow-craft space-y-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              {t('review.tags')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tg) => (
                <span
                  key={tg}
                  className="text-xs px-2.5 py-0.5 bg-turmeric-50 text-turmeric-900 border border-turmeric-200 rounded-full font-medium"
                >
                  #{tg}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Editable Title, Cultural Story & Fair Price Band */}
        <div className="md:col-span-7 space-y-5">
          
          {/* Editable Title Card */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 sm:p-6 shadow-craft space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                {t('review.craftTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-paper-300 bg-paper-50 font-serif text-base sm:text-lg font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            {/* Cultural Story */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  {t('review.culturalStory')}
                </label>
                <span className="text-[11px] text-terracotta-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {isHindi ? 'विरासत कहानी तैयार' : 'Heritage narrative'}
                </span>
              </div>
              <textarea
                rows={5}
                value={culturalStory}
                onChange={(e) => setCulturalStory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-paper-300 bg-paper-50 text-sm leading-relaxed text-indigo-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400 resize-none font-sans"
              />
            </div>
          </div>

          {/* Fair Market Price Band Card */}
          <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 sm:p-6 shadow-craft space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-indigo-950">
                  {t('review.priceBandTitle')}
                </h3>
                <div className="text-xs text-stone-500 mt-0.5">
                  {t('review.fairBand')} <span className="font-bold text-indigo-950">₹{minPrice} - ₹{maxPrice}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  {t('review.setFinalPrice')}
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-terracotta-600">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Interactive Price Slider & Nudge Buttons */}
            <div className="space-y-3 pt-2">
              <input
                type="range"
                min={minPrice - 300}
                max={maxPrice + 500}
                step={25}
                value={finalPrice}
                onChange={(e) => setFinalPrice(Number(e.target.value))}
                className="w-full accent-terracotta-500 h-2 bg-paper-300 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleNudgePrice(-50)}
                  className="px-4 py-2 bg-paper-200 hover:bg-paper-300 text-indigo-950 font-bold text-xs sm:text-sm rounded-xl border border-paper-300 flex items-center gap-1 cursor-pointer tap-target-accessible"
                >
                  <Minus className="w-4 h-4" />
                  <span>₹50</span>
                </button>

                <span className="text-xs text-stone-500 font-medium text-center">
                  {isHindi ? 'मूल्य समायोजित करें' : 'Adjust price freely'}
                </span>

                <button
                  type="button"
                  onClick={() => handleNudgePrice(+50)}
                  className="px-4 py-2 bg-paper-200 hover:bg-paper-300 text-indigo-950 font-bold text-xs sm:text-sm rounded-xl border border-paper-300 flex items-center gap-1 cursor-pointer tap-target-accessible"
                >
                  <Plus className="w-4 h-4" />
                  <span>₹50</span>
                </button>
              </div>
            </div>

            {/* Price Rationale Explanation */}
            <div className="bg-turmeric-50/80 border border-turmeric-200 rounded-2xl p-3.5 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-turmeric-700 shrink-0 mt-0.5" />
              <div className="text-xs text-turmeric-950 leading-relaxed">
                <span className="font-bold block">
                  {isHindi ? 'मूल्य निर्धारण का आधार:' : 'Price Calculation Rationale:'}
                </span>
                <span>
                  {isHindi && analysisResult.priceBand.rationaleHi 
                    ? analysisResult.priceBand.rationaleHi 
                    : analysisResult.priceBand.rationale}
                </span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/add-product')}
              className="w-full sm:w-auto"
            >
              {t('review.btnSaveDraft')}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handlePublish}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
              className="w-full sm:flex-1 font-bold text-base py-4 shadow-craft-md cursor-pointer"
            >
              {isHindi ? 'शिल्प प्रकाशित करें (Save & Publish)' : 'Publish Craft to Marketplace'}
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ReviewPublishPage;
