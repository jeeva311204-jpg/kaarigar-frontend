import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  User,
  Shield,
  Heart
} from 'lucide-react';

export const BuyerLoginPage: React.FC = () => {
  const { loginWithDetails } = useAuth();
  const { isHindi } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('Anita Deshmukh');
  const [phone, setPhone] = useState('9820154321');
  const [email, setEmail] = useState('anita.deshmukh@craftstudio.in');
  const [city, setCity] = useState('Mumbai, Maharashtra');
  const [buyerType, setBuyerType] = useState('Boutique Curator & Heritage Collector');
  const [otp, setOtp] = useState('1234');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);

  const handleUseDemo = () => {
    setName('Anita Deshmukh');
    setPhone('9820154321');
    setEmail('anita.deshmukh@craftstudio.in');
    setCity('Mumbai, Maharashtra');
    setBuyerType('Boutique Curator & Heritage Collector');
    setOtp('1234');
    showToast({
      type: 'info',
      title: isHindi ? 'डेमो खरीदार विवरण भरे गए' : 'Demo Buyer Details Loaded',
      message: 'Anita Deshmukh • +91 98201 54321'
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({
        type: 'error',
        title: isHindi ? 'नाम दर्ज करें' : 'Name Required',
        message: isHindi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your full name.'
      });
      return;
    }
    if (phone.length < 10) {
      showToast({
        type: 'error',
        title: isHindi ? 'अमान्य मोबाइल नंबर' : 'Invalid Mobile Number',
        message: isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      showToast({
        type: 'info',
        title: isHindi ? 'ओटीपी भेजा गया' : 'OTP Sent Successfully',
        message: isHindi ? 'डेमो कोड: 1234 दर्ज करें।' : 'Enter demo code 1234 to proceed.'
      });
    }, 400);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await loginWithDetails({
      role: 'buyer',
      name,
      phone,
      otp,
      email,
      clusterOrLocation: city,
      craftOrSpecialty: buyerType
    });
    setIsLoading(false);

    if (success) {
      showToast({
        type: 'success',
        title: isHindi ? 'सफलतापूर्वक प्रवेश' : 'Welcome to Marketplace',
        message: isHindi ? `नमस्ते ${name}, भारतीय धरोहर शिल्प बाज़ार में आपका स्वागत है!` : `Welcome ${name} to Kaarigar Heritage Marketplace!`
      });
      navigate('/marketplace');
    } else {
      showToast({
        type: 'error',
        title: isHindi ? 'अमान्य पासकोड' : 'Invalid Code',
        message: isHindi ? 'कृपया 4-अंकीय कोड (जैसे 1234) दर्ज करें।' : 'Please enter valid 4-digit code (e.g. 1234).'
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-paper-100 rounded-3xl border border-paper-300 shadow-craft-lg max-w-lg w-full p-6 sm:p-8 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-indigo-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'सभी पोर्टल' : 'All Portals'}</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {isHindi ? 'खरीदार पोर्टल' : 'Buyer & Patron Portal'}
          </span>
        </div>

        {/* Hero Card */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 border border-emerald-800 flex items-center justify-center mx-auto text-white shadow-craft">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-indigo-950">
            {isHindi ? 'खरीदार एवं कद्रदान प्रवेश' : 'Craft Patron & Buyer Sign-In'}
          </h1>
          <p className="text-xs text-stone-600 max-w-xs mx-auto">
            {isHindi 
              ? 'प्रमाणित जीआई शिल्प खोजने और सीधे कारीगरों से जुड़ने के लिए विवरण दर्ज करें' 
              : 'Discover authentic GI certified handicrafts with transparent pricing directly from master artisans'}
          </p>
        </div>

        {/* Quick Demo Preload Pill */}
        <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold text-emerald-950">
              {isHindi ? 'त्वरित परीक्षण के लिए डेमो विवरण' : 'Quick Demo Test Preset'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUseDemo}
            className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isHindi ? 'डेमो भरें' : 'Fill Demo'}
          </button>
        </div>

        {/* Step 1: Buyer Details */}
        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'कद्रदान / खरीदार का नाम' : 'Patron / Buyer Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Anita Deshmukh"
                className="w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Phone Number (10 Digits)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-stone-500 font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98201 54321"
                  maxLength={10}
                  className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'ईमेल पता' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. anita.deshmukh@craftstudio.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* City / State */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'डिलीवरी शहर एवं राज्य' : 'City & State (Delivery Location)'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Buyer Purpose */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'खरीदारी का उद्देश्य / प्रकार' : 'Patron Purpose / Buyer Type'}
              </label>
              <select
                value={buyerType}
                onChange={e => setBuyerType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Boutique Curator & Heritage Collector">Boutique Curator & Collector / बुटीक क्यूरेटर</option>
                <option value="Individual Craft Patron">Individual Craft Patron / व्यक्तिगत कद्रदान</option>
                <option value="Corporate & Festive Gifting">Corporate & Festive Gifting / कॉर्पोरेट उपहार</option>
                <option value="Interior Architecture & Design Studio">Interior Architecture & Design / इंटीरियर डिज़ाइन</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center gap-2"
            >
              <span>{isHindi ? 'ओटीपी (OTP) प्राप्त करें' : 'Send One-Time Passcode'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            
            <div className="p-4 bg-paper-50 rounded-2xl border border-paper-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950">{name}</span>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  {isHindi ? 'विवरण बदलें' : 'Edit Details'}
                </button>
              </div>
              <div className="text-xs text-stone-500 font-mono">+91 {phone} • {email}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? '4-अंकीय ओटीपी दर्ज करें' : 'Enter 4-Digit Passcode'}
              </label>
              <input
                type="text"
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="1234"
                maxLength={6}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-paper-300 bg-white font-mono text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                <span>{isHindi ? 'डेमो पासकोड:' : 'Demo Passcode:'} <strong className="font-mono text-indigo-950">1234</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp('1234')}
                  className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  {isHindi ? 'ऑटो-भरें 1234' : 'Auto-fill 1234'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isHindi ? 'सत्यापित करें और बाज़ार देखें' : 'Verify & Enter Marketplace'}</span>
            </Button>
          </form>
        )}

        {/* Other Persona Quick Links */}
        <div className="pt-4 border-t border-paper-300 flex items-center justify-between text-xs text-stone-600">
          <Link to="/login/artisan" className="hover:text-terracotta-700 flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{isHindi ? 'कारीगर लॉगिन' : 'Artisan Sign-In'}</span>
          </Link>
          <Link to="/login/admin" className="hover:text-indigo-950 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>{isHindi ? 'प्रशासक लॉगिन' : 'Admin Sign-In'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
