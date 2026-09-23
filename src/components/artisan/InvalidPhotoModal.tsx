import React from 'react';
import { AlertTriangle, Camera, Image as ImageIcon, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Button } from '../common/Button';

interface InvalidPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
  rejectionReason?: string;
  rejectionReasonHi?: string;
  detectedSubject?: string;
  detectedNonCraftObject?: string;
  detectedNonCraftObjectHi?: string;
}

export const InvalidPhotoModal: React.FC<InvalidPhotoModalProps> = ({
  isOpen,
  onClose,
  onRetake,
  rejectionReason,
  rejectionReasonHi,
  detectedSubject,
  detectedNonCraftObject,
  detectedNonCraftObjectHi
}) => {
  const { isHindi } = useTranslation();

  if (!isOpen) return null;

  const subject = detectedSubject || detectedNonCraftObject;
  const craftSubjectText = subject
    ? `This looks like a ${subject}, not a handmade craft.`
    : 'This does not look like a handmade craft.';
  const defaultReason = rejectionReason
    ? (rejectionReason.startsWith('This looks like') ? rejectionReason : `${craftSubjectText} ${rejectionReason}`)
    : `${craftSubjectText} Please upload a photo of your handmade product instead.`;
  const defaultReasonHi =
    rejectionReasonHi ||
    (subject
      ? `यह तस्वीर ${subject} प्रतीत होती है, यह कोई प्रामाणिक हस्तशिल्प उत्पाद नहीं है। कृपया इसके स्थान पर अपने उत्पाद की फ़ोटो अपलोड करें।`
      : 'यह छवि एक प्रामाणिक हस्तशिल्प उत्पाद नहीं लग रही है। कृपया अपने हस्तनिर्मित शिल्प की स्पष्ट फ़ोटो अपलोड करें।');

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-red-300 shadow-2xl max-w-lg w-full p-6 sm:p-7 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Warning Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center text-red-600 shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-red-950 mb-1">
          {isHindi ? 'यह कोई हस्तशिल्प उत्पाद नहीं है' : 'Not a Handcrafted Craft Item'}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-red-700 mb-3">
          {isHindi ? 'अमान्य फ़ोटो या गैर-शिल्प वस्तु पहचानी गई' : 'Invalid photo or non-craft item detected'}
        </p>

        {/* Detected Non-Craft Object Chip */}
        {detectedNonCraftObject && (
          <div className="bg-red-100/90 border border-red-300 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-1 text-xs mb-3 text-left">
            <div className="flex items-center gap-1.5 font-bold text-red-950">
              <span>🔍 {isHindi ? 'पहचानी गई वस्तु:' : 'AI Identified:'}</span>
              <span className="text-red-700 font-semibold underline decoration-red-300">{detectedNonCraftObject}</span>
            </div>
            {isHindi && detectedNonCraftObjectHi && (
              <span className="text-red-800 text-[11px] font-hindi">({detectedNonCraftObjectHi})</span>
            )}
          </div>
        )}

        {/* Reason Box */}
        <div className="bg-red-50/90 border border-red-200 rounded-2xl p-4 text-left space-y-2 mb-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-red-900 leading-relaxed font-medium">
              {defaultReason}
            </div>
          </div>
          {defaultReasonHi && (
            <div className="text-xs sm:text-sm text-red-800 leading-relaxed font-hindi pt-1 border-t border-red-200/60 pl-6">
              {defaultReasonHi}
            </div>
          )}
        </div>

        {/* Artisan Guidelines Card */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-left text-xs text-stone-700 space-y-2 mb-6">
          <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider">
            {isHindi ? '💡 फोटो दिशा-निर्देश:' : '💡 Photo Guidelines for Artisans:'}
          </span>
          <div className="space-y-1.5 text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {isHindi
                  ? 'हस्तनिर्मित मिट्टी के बर्तन, वस्त्र, काष्ठ कला, धातु शिल्प, आभूषण या पेंटिंग'
                  : 'Handmade pottery, textiles, woodwork, metalcraft, jewelry, or paintings'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-red-800">
              <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>
                {isHindi
                  ? 'सेल्फी, चेहरे, वाहन, जानवर, रसीदें/दस्तावेज़ या स्क्रीनशॉट मान्य नहीं हैं'
                  : 'Selfies, faces, vehicles, animals, documents/receipts, or screenshots are not accepted'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onClose();
              onRetake();
            }}
            leftIcon={<Camera className="w-4 h-4" />}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-md"
          >
            {isHindi ? 'नई शिल्प फोटो लें / अपलोड करें' : 'Upload Valid Craft Photo'}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto text-stone-600 border-stone-300 hover:bg-stone-100"
          >
            {isHindi ? 'बंद करें' : 'Dismiss'}
          </Button>
        </div>

      </div>
    </div>
  );
};
