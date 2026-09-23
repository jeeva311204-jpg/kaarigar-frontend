import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, defaultProfiles } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { 
  User, 
  Phone, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft,
  Store,
  Shield,
  Layers
} from 'lucide-react';

export const ArtisanLoginPage: React.FC = () => {
  const { loginWithDetails } = useAuth();
  const { isHindi } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('Ramswaroop Sharma');
  const [phone, setPhone] = useState('9829044211');
  const [craftSpecialty, setCraftSpecialty] = useState('Jaipur Blue Pottery (जयपुर ब्लू पॉटरी)');
  const [clusterLocation, setClusterLocation] = useState('Kot Jewar, Jaipur, Rajasthan');
  const [otp, setOtp] = useState('1234');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);

  const handleUseDemo = () => {
    setName('Ramswaroop Sharma');
    setPhone('9829044211');
    setCraftSpecialty('Jaipur Blue Pottery (जयपुर ब्लू पॉटरी)');
    setClusterLocation('Kot Jewar, Jaipur, Rajasthan');
    setOtp('1234');
    showToast({
      type: 'info',
      title: isHindi ? 'डेमो कारीगर विवरण भरे गए' : 'Demo Artisan Details Loaded',
      message: 'Ramswaroop Sharma • +91 98290 44211'
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
      role: 'artisan',
      name,
      phone,
      otp,
      clusterOrLocation: clusterLocation,
      craftOrSpecialty: craftSpecialty
    });
    setIsLoading(false);

    if (success) {
      showToast({
        type: 'success',
        title: isHindi ? 'सफलतापूर्वक प्रवेश' : 'Welcome Master Artisan',
        message: isHindi ? `नमस्ते ${name}, आपकी कार्यशाला खुल गई है!` : `Welcome ${name} to your artisan workshop!`
      });
      navigate('/');
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
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-terracotta-100 text-terracotta-800 border border-terracotta-300">
            {isHindi ? 'कारीगर पोर्टल' : 'Artisan Portal'}
          </span>
        </div>

        {/* Hero Card */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-terracotta-600 border border-terracotta-700 flex items-center justify-center mx-auto text-white shadow-craft">
            <User className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-indigo-950">
            {isHindi ? 'कारीगर कार्यशाला प्रवेश' : 'Master Artisan Sign-In'}
          </h1>
          <p className="text-xs text-stone-600 max-w-xs mx-auto">
            {isHindi 
              ? 'आवाज़ से उत्पाद जोड़ने और कद्रदानों से जुड़ने के लिए अपना विवरण दर्ज करें' 
              : 'Sign in to catalog crafts with voice, manage listings & connect with patrons across India'}
          </p>
        </div>

        {/* Quick Demo Preload Pill */}
        <div className="flex items-center justify-between p-3 bg-terracotta-50/60 rounded-2xl border border-terracotta-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-terracotta-600" />
            <span className="text-xs font-semibold text-terracotta-900">
              {isHindi ? 'त्वरित परीक्षण के लिए डेमो विवरण' : 'Quick Demo Test Preset'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUseDemo}
            className="text-xs font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 px-3 py-1 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isHindi ? 'डेमो भरें' : 'Fill Demo'}
          </button>
        </div>

        {/* Step 1: Artisan Details */}
        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'कारीगर का पूरा नाम' : 'Artisan Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramswaroop Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
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
                  placeholder="98290 44211"
                  maxLength={10}
                  className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>
            </div>

            {/* Craft Specialty */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'प्रमुख हस्तशिल्प विधा / परंपरा' : 'Primary Craft Specialty'}
              </label>
              <input
                type="text"
                required
                value={craftSpecialty}
                onChange={e => setCraftSpecialty(e.target.value)}
                placeholder="e.g. Jaipur Blue Pottery, Bastar Dhokra, Woodwork"
                className="w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            {/* Cluster Location */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'गांव / क्लस्टर क्षेत्र' : 'Artisan Village / Cluster Location'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={clusterLocation}
                  onChange={e => setClusterLocation(e.target.value)}
                  placeholder="e.g. Kot Jewar, Jaipur, Rajasthan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold bg-terracotta-600 hover:bg-terracotta-700 flex items-center justify-center gap-2"
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
                  className="text-xs font-semibold text-terracotta-600 hover:underline cursor-pointer"
                >
                  {isHindi ? 'विवरण बदलें' : 'Edit Details'}
                </button>
              </div>
              <div className="text-xs text-stone-500 font-mono">+91 {phone} • {craftSpecialty}</div>
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
                className="w-full px-4 py-3 rounded-xl border border-paper-300 bg-white font-mono text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                <span>{isHindi ? 'डेमो पासकोड:' : 'Demo Passcode:'} <strong className="font-mono text-indigo-950">1234</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp('1234')}
                  className="text-terracotta-600 font-semibold hover:underline cursor-pointer"
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
              className="w-full font-bold bg-terracotta-600 hover:bg-terracotta-700 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isHindi ? 'सत्यापित करें और कार्यशाला खोलें' : 'Verify & Open Workshop'}</span>
            </Button>
          </form>
        )}

        {/* Other Persona Quick Links */}
        <div className="pt-4 border-t border-paper-300 flex items-center justify-between text-xs text-stone-600">
          <Link to="/login/buyer" className="hover:text-emerald-700 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            <span>{isHindi ? 'खरीदार लॉगिन' : 'Buyer Sign-In'}</span>
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
