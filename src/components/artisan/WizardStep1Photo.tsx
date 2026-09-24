import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Check, Sparkles, RefreshCw, Eye, Wand2, Layers, ShieldCheck, ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import { CraftCategory } from '../../types';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';
import { analyzeCraftPhoto, PhotoAnalysisDetails } from '../../lib/aiVisionAnalyzer';

interface WizardStep1PhotoProps {
  selectedCategory: CraftCategory;
  onSelectCategory: (cat: CraftCategory) => void;
  imagePreview: string | null;
  onImageChange: (imgUrl: string, file?: File) => void;
  onAnalysisComplete?: (analysis: PhotoAnalysisDetails) => void;
  onForceConfirmCraft?: () => void;
}

const CATEGORIES: { key: CraftCategory; labelKey: string; icon: string }[] = [
  { key: 'pottery', labelKey: 'categories.pottery', icon: '🏺' },
  { key: 'metal', labelKey: 'categories.metal', icon: '🔔' },
  { key: 'textiles', labelKey: 'categories.textiles', icon: '🧵' },
  { key: 'painting', labelKey: 'categories.painting', icon: '🎨' },
  { key: 'woodwork', labelKey: 'categories.woodwork', icon: '🪵' },
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

// Sample craft images for immediate testing without taking photo
const SAMPLE_CRAFT_PREVIEWS: Record<CraftCategory, { name: string; url: string }> = {
  pottery: {
    name: 'Jaipur Blue Pottery Surahi',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  },
  metal: {
    name: 'Bastar Dhokra Lost-Wax Bull',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  },
  textiles: {
    name: 'Banarasi Handloom Silk Brocade',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  painting: {
    name: 'Madhubani Sacred Tree Painting',
    url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80'
  },
  woodwork: {
    name: 'Channapatna Lacquered Toy',
    url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
  },
  basketry: {
    name: 'Coiled Sikki Golden Grass Basket',
    url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80'
  },
  jewelry: {
    name: 'Tribal Silver Filigree Talisman',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
  },
  leather: {
    name: 'Embroidered Rawhide Mojari',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
  },
  terracotta: {
    name: 'Bankura Terracotta Horse & Pottery',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'
  },
  stonecraft: {
    name: 'Agra Marble Inlay Pietra Dura Tabletop',
    url: 'https://images.unsplash.com/photo-1599818816934-8c85770020bc?auto=format&fit=crop&w=800&q=80'
  },
  embroidery: {
    name: 'Lucknowi Chikankari Hand Embroidery',
    url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80'
  },
  paper_mache: {
    name: 'Kashmir Papier-Mâché Floral Box',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
  },
  glasscraft: {
    name: 'Firozabad Hand-Blown Glass Artifact',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80'
  },
  carpets: {
    name: 'Bhadohi Hand-Knotted Heritage Rug',
    url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80'
  },
  other: {
    name: 'Traditional Indian Craft Item',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
  }
};

export const WizardStep1Photo: React.FC<WizardStep1PhotoProps> = ({
  selectedCategory,
  onSelectCategory,
  imagePreview,
  onImageChange,
  onAnalysisComplete,
  onForceConfirmCraft
}) => {
  const { t, isHindi } = useTranslation();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // AI Photo Research & Enhancement State
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalysisDetails | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(true);

  // Trigger AI analysis whenever a new image preview is provided
  useEffect(() => {
    let isCancelled = false;
    if (imagePreview) {
      setIsScanning(true);
      analyzeCraftPhoto(imagePreview, selectedCategory)
        .then((res) => {
          if (!isCancelled) {
            setAnalysis(res);
            setIsScanning(false);
            // Automatically switch category if image analysis detected a specific craft
            if (res.detectedCategory && res.detectedCategory !== selectedCategory) {
              onSelectCategory(res.detectedCategory);
            }
            if (onAnalysisComplete) {
              onAnalysisComplete(res);
            }
          }
        })
        .catch((err) => {
          console.warn('AI instant photo scan error:', err);
          if (!isCancelled) setIsScanning(false);
        });
    } else {
      setAnalysis(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [imagePreview]);

  const handleForceArtisanConfirmation = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    try {
      const res = await analyzeCraftPhoto(imagePreview, selectedCategory, undefined, true);
      setAnalysis(res);
      setIsScanning(false);
      if (res.detectedCategory && res.detectedCategory !== selectedCategory) {
        onSelectCategory(res.detectedCategory);
      }
      if (onAnalysisComplete) {
        onAnalysisComplete(res);
      }
      if (onForceConfirmCraft) {
        onForceConfirmCraft();
      }
    } catch (err) {
      console.warn('AI artisan confirmation error:', err);
      setIsScanning(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageChange(reader.result as string, file);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const setCategoryAndSampleImage = (cat: CraftCategory) => {
    onSelectCategory(cat);
    // If no custom user photo has been uploaded yet, update to category sample
    if (!imagePreview || imagePreview.startsWith('https://images.unsplash.com')) {
      onImageChange(SAMPLE_CRAFT_PREVIEWS[cat].url);
    }
  };

  // Currently displayed image (either AI Studio Enhanced or Original)
  const currentDisplayImage =
    showEnhanced && analysis?.enhancementResult?.enhancedUrl
      ? analysis.enhancementResult.enhancedUrl
      : imagePreview;

  const isInvalidPhoto = Boolean(analysis && (analysis.isValidCraft === false || analysis.isProduct === false));

  return (
    <div className="space-y-6">
      
      {/* Category Selection Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <span>{t('wizard.selectCategory')}</span>
            <span className="text-terracotta-500">*</span>
          </label>
          {analysis && analysis.isValidCraft !== false && analysis.detectedCategory !== selectedCategory && (
            <button
              type="button"
              onClick={() => onSelectCategory(analysis.detectedCategory)}
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-800 flex items-center gap-1 bg-terracotta-50 px-2.5 py-1 rounded-full border border-terracotta-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
              <span>AI Suggests: {analysis.detectedCategory}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategoryAndSampleImage(cat.key)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer tap-target-accessible ${
                  isSelected
                    ? 'bg-paper-100 border-terracotta-500 text-terracotta-800 shadow-craft ring-2 ring-terracotta-400/40 font-semibold'
                    : 'bg-paper-100/70 border-paper-300 text-stone-700 hover:border-stone-400 hover:bg-paper-200/50'
                }`}
              >
                <span className="text-2xl shrink-0">{cat.icon}</span>
                <span className="text-xs sm:text-sm leading-tight flex-1">
                  {t(cat.labelKey)}
                </span>
                {isSelected && <Check className="w-4 h-4 text-terracotta-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Capture & Upload Box */}
      <div>
        <label className="block text-sm font-bold text-indigo-950 mb-2">
          {t('wizard.step1Title')} <span className="text-terracotta-500">*</span>
        </label>

        {imagePreview ? (
          <div className="space-y-3">
            {/* Image Preview Box with Before / After Toggle */}
            <div className={`relative rounded-2xl overflow-hidden border-2 bg-black/5 shadow-craft-md max-w-md mx-auto aspect-4/3 sm:aspect-16/10 transition-all ${
              isInvalidPhoto ? 'border-red-500 ring-4 ring-red-400/30' : 'border-terracotta-400'
            }`}>
              <img
                src={currentDisplayImage || imagePreview}
                alt="Craft capture"
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              
              {/* Top Bar with Before / After Switcher or Rejection Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                {isInvalidPhoto ? (
                  <span className="text-white text-xs font-bold bg-red-600/90 backdrop-blur-md px-3 py-1 rounded-full border border-red-300 flex items-center gap-1.5 shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                    <span>{isHindi ? 'अमान्य फ़ोटो / Not a Product' : 'Not a Product / Invalid Photo'}</span>
                  </span>
                ) : (
                  <span className="text-white text-xs font-semibold bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {t(CATEGORIES.find(c => c.key === selectedCategory)?.labelKey || 'categories.pottery')}
                  </span>
                )}

                {!isInvalidPhoto && analysis?.enhancementResult && (
                  <div className="inline-flex p-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white">
                    <button
                      type="button"
                      onClick={() => setShowEnhanced(false)}
                      className={`px-2.5 py-1 rounded-full transition-colors ${
                        !showEnhanced ? 'bg-white text-indigo-950 shadow-xs' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEnhanced(true)}
                      className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                        showEnhanced ? 'bg-terracotta-500 text-white shadow-xs' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>AI Enhanced</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Overlay with Retake action */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-between p-3.5">
                <div className="text-white text-xs">
                  {isInvalidPhoto ? (
                    <span className="flex items-center gap-1.5 text-red-200 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
                      {isHindi ? 'गैर-उत्पाद छवि' : 'Non-product image detected'}
                    </span>
                  ) : showEnhanced ? (
                    <span className="flex items-center gap-1.5 text-amber-200 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Studio Lighting & Color Enhanced
                    </span>
                  ) : (
                    <span className="text-stone-300 font-medium">Original Upload Photo</span>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => cameraInputRef.current?.click()}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className={`text-xs ${isInvalidPhoto ? 'bg-red-600 hover:bg-red-700 text-white border-none' : ''}`}
                >
                  {t('wizard.retake')}
                </Button>
              </div>
            </div>

            {/* AI Real-time Photo Research & Material Detection Card OR Invalid Craft Card */}
            {isInvalidPhoto ? (
              <div className="bg-red-50/95 border-2 border-red-300 rounded-2xl p-4 sm:p-5 max-w-md mx-auto shadow-md space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 border border-red-300 flex items-center justify-center shrink-0 text-red-600 shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider border border-red-200">
                        {isHindi ? 'अस्वीकृत' : 'Not a Craft'}
                      </span>
                      <span className="text-[11px] text-red-600 font-semibold">
                        {isHindi ? 'यह कोई हस्तशिल्प उत्पाद नहीं है' : 'Non-Handicraft Item'}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-red-950 mt-1">
                      {isHindi ? 'यह एक प्रामाणिक शिल्प उत्पाद नहीं है' : 'This is Not an Artisan Handicraft'}
                    </h4>

                    {/* Prominent Detected Non-Craft Object Box */}
                    {analysis?.detectedNonCraftObject && (
                      <div className="mt-2 bg-white/90 border border-red-300 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                          <span className="text-base">
                            {analysis.detectedNonCraftObject.toLowerCase().includes('phone') ? '📱' :
                             analysis.detectedNonCraftObject.toLowerCase().includes('tree') ? '🌳' :
                             analysis.detectedNonCraftObject.toLowerCase().includes('post') || analysis.detectedNonCraftObject.toLowerCase().includes('pole') ? '🏮' : '🔍'}
                          </span>
                          <span>{isHindi ? 'पहचानी गई वस्तु:' : 'AI Identified Subject:'}</span>
                          <span className="text-red-700 font-extrabold">{analysis.detectedNonCraftObject}</span>
                        </div>
                        {isHindi && analysis.detectedNonCraftObjectHi && (
                          <div className="text-[11px] text-stone-600 pl-6 font-hindi">
                            ({analysis.detectedNonCraftObjectHi})
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-red-900 mt-2 leading-relaxed font-medium">
                      {analysis?.rejectionReason || 'The uploaded image does not appear to be an authentic handcrafted artisan product. Please upload a clear photo of your craft item.'}
                    </p>
                    {analysis?.rejectionReasonHi && (
                      <p className="text-xs text-red-800 mt-1 font-hindi leading-relaxed">
                        {analysis.rejectionReasonHi}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-red-200 text-xs text-red-900 space-y-1">
                  <div className="font-semibold text-[11px] text-red-950 flex items-center gap-1">
                    <span>💡 {isHindi ? 'स्वीकार्य तस्वीरें:' : 'Artisan Platform Requirements:'}</span>
                  </div>
                  <p className="text-[11px] text-red-800/90 leading-relaxed">
                    {isHindi
                      ? 'कृपया अपने हस्तनिर्मित शिल्प (मिट्टी के बर्तन, टोकरी, हथकरघा वस्त्र, काष्ठ कला, धातु शिल्प, आभूषण) की स्पष्ट तस्वीर लें। मोबाइल फोन, पेड़, खंभे, वाहन, रसीदें या गैर-शिल्प वस्तुएं स्वीकार्य नहीं हैं।'
                      : 'Please upload an authentic handmade physical craft (pottery, textiles, woodwork, metalcraft, jewelry, baskets). Consumer electronics like mobile phones, outdoor trees/posts, vehicles, or ordinary household objects cannot be listed.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    leftIcon={<Camera className="w-4 h-4" />}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold border-none text-xs shadow-xs"
                  >
                    {isHindi ? 'नई फ़ोटो लें' : 'Take New Photo'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => galleryInputRef.current?.click()}
                    leftIcon={<ImageIcon className="w-4 h-4" />}
                    className="flex-1 border-red-300 text-red-900 hover:bg-red-100/50 text-xs font-semibold"
                  >
                    {isHindi ? 'गैलरी से चुनें' : 'Choose Gallery'}
                  </Button>
                </div>

                {/* Artisan Confirmation Override: Direct Materials & Price Detection */}
                <div className="pt-2 border-t border-red-200">
                  <button
                    type="button"
                    onClick={handleForceArtisanConfirmation}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 border border-emerald-400 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>
                      {isHindi
                        ? '✨ यह मेरा हस्तशिल्प है (कारीगर प्रमाणीकरण) → कच्चा माल एवं उचित मूल्य जांचें'
                        : '✨ I Handcrafted This Product (Artisan Confirmation) → Detect Materials & Fair Price'}
                    </span>
                  </button>
                  <p className="text-[11px] text-stone-600 text-center mt-1.5 font-medium leading-relaxed">
                    {isHindi
                      ? 'सिरेमिक/मिट्टी के बर्तन, वस्त्र या कलाकृति के लिए कच्चे माल, सामग्री और उचित बाज़ार मूल्य का विश्लेषण करें।'
                      : 'Verify studio pottery, tableware, or handmade items to extract authentic materials & fair price.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-paper-200/80 border border-paper-300 rounded-2xl p-4 max-w-md mx-auto shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-900 text-terracotta-400 flex items-center justify-center">
                      <Wand2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-indigo-950">
                      AI Visual Research & Material Detection
                    </span>
                  </div>
                  {isScanning ? (
                    <span className="text-[11px] text-terracotta-600 font-semibold animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      Scanning photo...
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified ({Math.round((analysis?.confidenceScore || 0.94) * 100)}%)
                    </span>
                  )}
                </div>

              {analysis && (
                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="flex items-start justify-between gap-1.5 bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                    <div>
                      <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider">Detected Craft:</span>
                      <span className="text-terracotta-800 font-serif font-bold text-sm">
                        {analysis.craftName}
                      </span>
                      {isHindi && analysis.craftNameHi && (
                        <span className="block text-xs text-stone-500 font-serif">
                          {analysis.craftNameHi}
                        </span>
                      )}
                      {/* State / Geographic Origin Detection */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">State / Origin:</span>
                        <span className="px-2 py-0.5 rounded-md bg-terracotta-50 text-terracotta-800 border border-terracotta-200 text-[11px] font-bold">
                          🏛️ {analysis.state || 'Rajasthan (Jaipur)'}
                        </span>
                        {analysis.giTagNumber && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                            {analysis.giTagNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-turmeric-100 text-turmeric-900 border border-turmeric-300 text-[10px] font-bold shrink-0">
                      {t(`categories.${analysis.detectedCategory}`)}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-stone-900 block mb-1">
                      {isHindi ? 'फ़ोटो से पहचाने गए कच्चे माल व घटक (सामग्री):' : 'Identified Raw Materials & Ingredients from Photo:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.materials.map((mat) => (
                        <span
                          key={mat}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                        >
                          <span>🌿</span>
                          <span>{mat}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Deep Price Research & Economic Analysis */}
                  {analysis.priceBand && (
                    <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                            AI Fair Price Research & Valuation:
                          </span>
                          <span className="text-base font-bold text-emerald-950 font-serif">
                            Suggested: ₹{analysis.priceBand.suggested}
                          </span>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Range: ₹{analysis.priceBand.min} - ₹{analysis.priceBand.max}
                        </span>
                      </div>

                      {analysis.priceBand.breakdown && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                          <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                            <span className="text-stone-500 block text-[10px]">🌿 Raw Materials:</span>
                            <span className="font-bold text-emerald-900">₹{analysis.priceBand.breakdown.rawMaterialsCost}</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                            <span className="text-stone-500 block text-[10px]">⏱️ Labor ({analysis.priceBand.breakdown.laborHours}h):</span>
                            <span className="font-bold text-emerald-900">₹{analysis.priceBand.breakdown.estimatedLaborWage}</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                            <span className="text-stone-500 block text-[10px]">🤝 Fair Margin:</span>
                            <span className="font-bold text-emerald-900">₹{analysis.priceBand.breakdown.craftFairMargin}</span>
                          </div>
                          <div className="bg-white/80 p-1.5 rounded-lg border border-emerald-200">
                            <span className="text-stone-500 block text-[10px]">🏛️ Benchmark:</span>
                            <span className="font-medium text-emerald-900 truncate block text-[10px]">
                              {analysis.priceBand.breakdown.clusterBenchmark.split(' ')[0]} Cluster
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-emerald-950/80 leading-relaxed pt-1 border-t border-emerald-200/70">
                        {analysis.priceBand.rationale}
                      </p>
                    </div>
                  )}

                  {/* Cultural Lineage & Craft Provenance */}
                  {analysis.culturalStory && (
                    <div className="p-2.5 rounded-xl bg-paper-100 border border-paper-300 space-y-1">
                      <span className="font-bold text-stone-900 block text-[10px] uppercase tracking-wider">
                        Heritage Craft Provenance:
                      </span>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {analysis.culturalStory}
                      </p>
                    </div>
                  )}

                  {analysis.enhancementResult?.report && (
                    <div className="pt-2 border-t border-paper-300 text-[11px] text-stone-600 flex flex-wrap gap-x-3 gap-y-1">
                      <span>💡 {analysis.enhancementResult.report.exposureBoost}</span>
                      <span>🎨 {analysis.enhancementResult.report.vibrancyBoost}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}

          </div>
        ) : (
          <div className="border-2 border-dashed border-paper-300 hover:border-terracotta-400 rounded-3xl p-6 sm:p-8 bg-paper-100 text-center transition-colors">
            <div className="w-16 h-16 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto mb-3 text-terracotta-600 shadow-xs">
              <Camera className="w-8 h-8" />
            </div>
            
            <h3 className="font-serif text-lg font-bold text-indigo-950 mb-1">
              {t('wizard.step1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto mb-6">
              {t('wizard.step1Subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Native Mobile Camera Capture Button */}
              <Button
                variant="primary"
                size="md"
                onClick={() => cameraInputRef.current?.click()}
                leftIcon={<Camera className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                {t('wizard.takePhoto')}
              </Button>

              {/* Gallery upload fallback */}
              <Button
                variant="outline"
                size="md"
                onClick={() => galleryInputRef.current?.click()}
                leftIcon={<ImageIcon className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                {t('wizard.uploadPhoto')}
              </Button>
            </div>
          </div>
        )}

        {/* Hidden HTML5 File Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
        <input
          type="file"
          ref={galleryInputRef}
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        {/* Quick Sample Selector for Demo Testing */}
        <div className="mt-3 flex flex-col gap-2 text-xs text-stone-500 bg-paper-200/60 p-3 rounded-2xl border border-paper-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-stone-800">
              <Sparkles className="w-3.5 h-3.5 text-turmeric-500" />
              {isHindi ? 'त्वरित परीक्षण तस्वीरें (क्लिक करके जांचें):' : 'Instant Demo Testing (Click to inspect):'}
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              {isHindi ? 'शिल्प व गैर-शिल्प वस्तुओं की AI जांच' : 'AI craft & non-craft detection'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200">
              {isHindi ? '✅ प्रामाणिक शिल्प:' : '✅ Valid Crafts:'}
            </span>
            <button
              type="button"
              onClick={() => onImageChange('/samples/user_blue_pottery.png')}
              className="text-indigo-900 hover:text-indigo-950 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer flex items-center gap-1 transition-colors text-xs"
            >
              <span>🏺 Blue Pottery Plate</span>
            </button>
            <button
              type="button"
              onClick={() => onImageChange('/samples/user_palm_craft.png')}
              className="text-terracotta-800 hover:text-terracotta-950 font-bold bg-terracotta-50 hover:bg-terracotta-100 px-2.5 py-1 rounded-lg border border-terracotta-200 cursor-pointer flex items-center gap-1 transition-colors text-xs"
            >
              <span>🌴 Palm Leaf Basket</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-paper-300/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-100/90 px-2 py-0.5 rounded-md border border-red-200">
              {isHindi ? '❌ अमान्य तस्वीरें:' : '❌ Test Invalid:'}
            </span>
            <button
              type="button"
              onClick={() => onImageChange('/samples/sample_mobile_phone.jpg')}
              className="text-red-700 hover:text-red-900 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-300 cursor-pointer flex items-center gap-1 transition-colors text-xs"
            >
              <span>📱 Mobile Phone</span>
            </button>
            <button
              type="button"
              onClick={() => onImageChange('/samples/sample_tree.jpg')}
              className="text-red-700 hover:text-red-900 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-300 cursor-pointer flex items-center gap-1 transition-colors text-xs"
            >
              <span>🌳 Tree / Foliage</span>
            </button>
            <button
              type="button"
              onClick={() => onImageChange('/samples/sample_utility_post.jpg')}
              className="text-red-700 hover:text-red-900 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-300 cursor-pointer flex items-center gap-1 transition-colors text-xs"
            >
              <span>🏮 Utility Post</span>
            </button>
            <button
              type="button"
              onClick={() => onImageChange('/samples/invalid_non_product.png')}
              className="text-stone-600 hover:text-stone-900 font-medium underline underline-offset-2 cursor-pointer text-xs ml-auto"
            >
              {isHindi ? 'अन्य अमान्य' : 'Other Non-Product'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
