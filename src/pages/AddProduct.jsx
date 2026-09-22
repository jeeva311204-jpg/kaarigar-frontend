import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyzeProduct } from '../lib/api';
import { enqueueOfflineProduct } from '../lib/offlineQueue';
import { Button } from '../components/common/Button';
import { WizardStep1Photo } from '../components/artisan/WizardStep1Photo';
import { VoiceTextStep } from '../components/wizard/VoiceTextStep';
import { WizardStep3Details } from '../components/artisan/WizardStep3Details';
import { ProcessingModal } from '../components/artisan/ProcessingModal';
import { ArrowLeft, ArrowRight, Save, Sparkles, Check } from 'lucide-react';

/**
 * AddProduct Wizard (3 Steps)
 * Step 1: Photo + Category
 * Step 2: Voice-over / Description (VoiceTextStep)
 * Step 3: Material + Quantity
 */
export const AddProduct = () => {
  const { t, isHindi } = useTranslation();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Wizard Step State (1: Photo + Category, 2: Voice/Text, 3: Material + Quantity)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Photo + Category
  const [category, setCategory] = useState('pottery');
  const [imagePreview, setImagePreview] = useState(
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  );
  const [imageFile, setImageFile] = useState(undefined);

  // Step 2: Voice-over / Description State
  const [voiceData, setVoiceData] = useState({
    language: 'hi-IN',
    description: '',
    audioUrl: null,
    audioBlob: null
  });

  // Step 3: Materials + Quantity
  const [selectedMaterials, setSelectedMaterials] = useState([
    'Quartz Stone Powder',
    'Multani Mitti (Fuller’s Earth)'
  ]);
  const [quantity, setQuantity] = useState(8);

  // AI Processing Modal State
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStage, setAiStage] = useState(1);
  const [aiStageMessage, setAiStageMessage] = useState('');

  const handleToggleMaterial = (mat) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!imagePreview) {
        showToast({
          type: 'error',
          title: 'Photo Required',
          message: 'Please take or choose a photo of your craft.'
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Disable / prevent proceeding until description is non-empty
      if (!voiceData.description || !voiceData.description.trim()) {
        showToast({
          type: 'error',
          title: 'Description Required',
          message: 'Please provide a voice recording or type a craft description before continuing.'
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSaveDraft = () => {
    const draftProduct = {
      id: `draft-${Date.now().toString(36)}`,
      title: `${category.toUpperCase()} Handcrafted Item (Draft)`,
      description: voiceData.description || 'Handmade artisanal craft pending final publish.',
      culturalStory: 'Artisan craft story pending review.',
      category,
      priceMin: 1200,
      priceMax: 1800,
      finalPrice: 1500,
      images: [imagePreview || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'],
      artisanId: currentUser.id,
      artisanName: currentUser.name,
      artisanLocation: currentUser.artisanData?.location || 'Rajasthan, India',
      artisanPhone: currentUser.phone,
      craftOrigin: 'Artisan Workshop',
      materials: selectedMaterials,
      stockQuantity: quantity,
      status: 'draft',
      giTagged: false,
      tags: [category, 'Handmade', 'Draft'],
      createdAt: new Date().toISOString()
    };

    enqueueOfflineProduct(draftProduct, 'product_draft');
    showToast({
      type: 'success',
      title: 'Draft Saved',
      message: 'You can resume editing this craft from your dashboard.'
    });
    navigate('/');
  };

  // Final submission calling /api/analyze-product via analyzeProduct
  const handleExecuteAnalysis = async () => {
    setIsProcessing(true);
    setAiStage(1);

    try {
      // Pass voiceData.description, voiceData.language, and voiceData.audioUrl
      // alongside image, category, materials, quantity
      const result = await analyzeProduct(
        {
          imageFile: imageFile || (imagePreview || undefined),
          category,
          voiceNoteBlob: voiceData.audioBlob,
          materials: selectedMaterials,
          quantity,
          description: voiceData.description,
          language: voiceData.language,
          audioUrl: voiceData.audioUrl
        },
        (stage, msg) => {
          setAiStage(stage);
          setAiStageMessage(msg);
        }
      );

      // Store analysis result & wizard payload in session/localStorage for ReviewPublishPage
      const reviewPayload = {
        analysisResult: result,
        wizardData: {
          category,
          image: imagePreview,
          materials: selectedMaterials,
          quantity,
          audioTranscript: voiceData.description || result.audioTranscript,
          language: voiceData.language,
          audioUrl: voiceData.audioUrl
        }
      };

      localStorage.setItem('kaarigar_active_review', JSON.stringify(reviewPayload));

      setTimeout(() => {
        setIsProcessing(false);
        navigate('/review-publish');
      }, 400);

    } catch (err) {
      setIsProcessing(false);
      showToast({
        type: 'error',
        title: 'AI Analysis Error',
        message: 'Could not complete catalog generation. Please retry.'
      });
    }
  };

  const stepsList = [
    { num: 1, label: t('wizard.step1Title') },
    { num: 2, label: 'Step 2: Story & Voice' },
    { num: 3, label: t('wizard.step3Title') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      
      {/* Wizard Step Progress Tracker */}
      <div className="bg-paper-100 border border-paper-300 rounded-3xl p-4 sm:p-6 shadow-craft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-xl text-stone-600 hover:text-indigo-950 hover:bg-paper-200 transition-colors cursor-pointer tap-target-accessible"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-indigo-950">
              {isHindi ? 'नया शिल्प कैटलॉग बनाएं' : 'Add Craft to Workshop'}
            </h1>
          </div>

          <button
            onClick={handleSaveDraft}
            className="text-xs font-semibold text-stone-600 hover:text-terracotta-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-paper-200 transition-colors cursor-pointer tap-target-accessible"
          >
            <Save className="w-4 h-4" />
            <span>{t('wizard.saveDraft')}</span>
          </button>
        </div>

        {/* Stepper Dots & Line */}
        <div className="grid grid-cols-3 gap-2 relative">
          {stepsList.map((stg) => {
            const isCurrent = currentStep === stg.num;
            const isCompleted = currentStep > stg.num;

            return (
              <div key={stg.num} className="flex flex-col items-center text-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all mb-1 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-terracotta text-white shadow-craft ring-4 ring-terracotta-200'
                      : 'bg-paper-200 text-stone-500 border border-paper-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stg.num}
                </div>
                <span className={`text-[11px] sm:text-xs font-medium line-clamp-1 ${
                  isCurrent ? 'font-bold text-indigo-950' : 'text-stone-500'
                }`}>
                  {stg.label.split(':')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-paper-100 border border-paper-300 rounded-3xl p-5 sm:p-8 shadow-craft">
        
        {/* Step 1: Photo + Category */}
        {currentStep === 1 && (
          <WizardStep1Photo
            selectedCategory={category}
            onSelectCategory={setCategory}
            imagePreview={imagePreview}
            onImageChange={(url, file) => {
              setImagePreview(url);
              if (file) setImageFile(file);
            }}
            onAnalysisComplete={(analysis) => {
              if (analysis.materials?.length) {
                setSelectedMaterials((prev) => Array.from(new Set([...prev, ...analysis.materials])));
              }
            }}
          />
        )}

        {/* Step 2: Voice / Text Description */}
        {currentStep === 2 && (
          <VoiceTextStep
            value={voiceData}
            onChange={(data) => {
              setVoiceData(data);
            }}
          />
        )}

        {/* Step 3: Material + Quantity */}
        {currentStep === 3 && (
          <WizardStep3Details
            category={category}
            selectedMaterials={selectedMaterials}
            onToggleMaterial={handleToggleMaterial}
            quantity={quantity}
            onChangeQuantity={setQuantity}
            onSubmitAnalysis={handleExecuteAnalysis}
            isLoading={isProcessing}
          />
        )}

        {/* Wizard Footer Step Navigation Buttons */}
        {currentStep < 3 && (
          <div className="mt-8 pt-5 border-t border-paper-300 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              {t('common.back')}
            </Button>

            {/* Requirement 3: Disable Continue button until description is non-empty */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="font-bold min-w-[140px]"
              disabled={currentStep === 2 && (!voiceData.description || !voiceData.description.trim())}
            >
              {currentStep === 2 ? 'Continue' : t('common.next')}
            </Button>
          </div>
        )}
      </div>

      {/* Processing Modal Overlay */}
      <ProcessingModal
        isOpen={isProcessing}
        currentStage={aiStage}
        stageMessage={aiStageMessage}
      />

    </div>
  );
};

export default AddProduct;
