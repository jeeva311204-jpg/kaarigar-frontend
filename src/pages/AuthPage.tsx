import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Phone, ShieldCheck, Sparkles, User, Store } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { role, setRole, loginWithPhone } = useAuth();
  const { t, isHindi } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('9829044211');
  const [otp, setOtp] = useState('1234');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      showToast({
        type: 'error',
        title: 'Invalid Phone Number',
        message: 'Please enter a valid 10-digit mobile number.'
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      showToast({
        type: 'info',
        title: 'OTP Sent',
        message: 'Enter demo code 1234 to proceed.'
      });
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await loginWithPhone(phone, otp);
    setIsLoading(false);

    if (success) {
      showToast({
        type: 'success',
        title: isHindi ? 'सफलतापूर्वक लॉग इन' : 'Authentication Successful',
        message: isHindi ? 'कारीगर कार्यशाला में आपका स्वागत है!' : 'Welcome to your Kaarigar workspace!'
      });
      navigate(role === 'artisan' ? '/' : '/marketplace');
    } else {
      showToast({
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter a valid OTP code (e.g. 1234).'
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="bg-paper-100 rounded-3xl border border-paper-300 shadow-craft-lg max-w-md w-full p-6 sm:p-8">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-900 border border-indigo-950 flex items-center justify-center mx-auto mb-3 text-terracotta-400 font-serif font-bold text-2xl shadow-craft">
            क
          </div>
          <h2 className="font-serif text-2xl font-bold text-indigo-950">
            {t('common.appName')}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {isHindi ? 'कारीगरों और कद्रदानों के लिए सरल डिजिटल प्रवेश' : 'Voice-first market linkage for Indian artisans & patrons'}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-paper-200 rounded-2xl mb-6 border border-paper-300">
          <button
            type="button"
            onClick={() => setRole('artisan')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'artisan'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-indigo-950'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isHindi ? 'कारीगर (Artisan)' : 'Master Artisan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'buyer'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-indigo-950'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{isHindi ? 'खरीदार (Buyer)' : 'Buyer / Patron'}</span>
          </button>
        </div>

        {/* Auth Forms */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Phone Number'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-stone-500 font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98290 44211"
                  maxLength={10}
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-paper-300 bg-paper-50 font-mono text-base focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold"
            >
              {isHindi ? 'ओटीपी (OTP) प्राप्त करें' : 'Send One-Time Passcode'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-indigo-950">
                  {isHindi ? '4-अंकीय ओटीपी दर्ज करें' : 'Enter 4-Digit Passcode'}
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-terracotta-600 hover:underline"
                >
                  {isHindi ? 'नंबर बदलें' : 'Change number'}
                </button>
              </div>

              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-paper-300 bg-paper-50 font-mono text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
              <p className="text-[11px] text-stone-500 text-center mt-1">
                {isHindi ? 'डेमो कोड: 1234' : 'Demo Passcode: 1234'}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold"
            >
              {isHindi ? 'सत्यापित करें और प्रवेश करें' : 'Verify & Continue'}
            </Button>
          </form>
        )}

        {/* Trust Footer */}
        <div className="mt-6 pt-4 border-t border-paper-300 flex items-center justify-center gap-2 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'सुरक्षित एवं निःशुल्क कारीगर सहायता' : 'CivicSync Certified Artisan Security'}</span>
        </div>

      </div>
    </div>
  );
};
