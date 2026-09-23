import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { 
  Shield, 
  Phone, 
  Building, 
  Briefcase, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  User,
  Store,
  KeyRound
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginWithDetails } = useAuth();
  const { isHindi } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('Savitri Bai');
  const [phone, setPhone] = useState('9811099882');
  const [organization, setOrganization] = useState('Rajasthan Handicrafts Cluster Mission (NABARD SHG)');
  const [designation, setDesignation] = useState('State Cluster Lead & Quality Inspector');
  const [email, setEmail] = useState('coordinator@civicsync.org');
  const [otp, setOtp] = useState('1234');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);

  const handleUseDemo = () => {
    setName('Savitri Bai');
    setPhone('9811099882');
    setOrganization('Rajasthan Handicrafts Cluster Mission (NABARD SHG)');
    setDesignation('State Cluster Lead & Quality Inspector');
    setEmail('coordinator@civicsync.org');
    setOtp('1234');
    showToast({
      type: 'info',
      title: isHindi ? 'डेमो एडमिन विवरण भरे गए' : 'Demo Admin Details Loaded',
      message: 'Savitri Bai • +91 98110 99882'
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
        title: isHindi ? 'सुरक्षा पासकोड भेजा गया' : 'Security Passcode Sent',
        message: isHindi ? 'डेमो पिन: 1234 दर्ज करें।' : 'Enter security PIN 1234 to proceed.'
      });
    }, 400);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await loginWithDetails({
      role: 'admin',
      name,
      phone,
      otp,
      email,
      clusterOrLocation: organization,
      designationOrOrganization: designation
    });
    setIsLoading(false);

    if (success) {
      showToast({
        type: 'success',
        title: isHindi ? 'प्रशासक प्रमाणीकरण सफल' : 'Administrator Authenticated',
        message: isHindi ? `नमस्ते ${name}, क्लस्टर डैशबोर्ड में आपका स्वागत है!` : `Welcome ${name} to Cluster Governance Workspace!`
      });
      navigate('/admin');
    } else {
      showToast({
        type: 'error',
        title: isHindi ? 'अमान्य सुरक्षा पिन' : 'Invalid Security PIN',
        message: isHindi ? 'कृपया वैध 4-अंकीय पिन दर्ज करें (जैसे 1234)।' : 'Please enter valid security PIN (e.g. 1234).'
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
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
            {isHindi ? 'क्लस्टर एडमिन पोर्टल' : 'Cluster Governance'}
          </span>
        </div>

        {/* Hero Card */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-900 flex items-center justify-center mx-auto text-terracotta-400 shadow-craft">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-indigo-950">
            {isHindi ? 'क्लस्टर प्रशासक प्रवेश' : 'Cluster Admin Sign-In'}
          </h1>
          <p className="text-xs text-stone-600 max-w-xs mx-auto">
            {isHindi 
              ? 'कारीगर क्लस्टर निगरानी, कैटलॉग अनुमोदन एवं बाज़ार लिंकेज प्रबंधन' 
              : 'SHG cluster governance, artisan directory oversight, catalog verification & market linkage metrics'}
          </p>
        </div>

        {/* Quick Demo Preload Pill */}
        <div className="flex items-center justify-between p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-900" />
            <span className="text-xs font-semibold text-indigo-950">
              {isHindi ? 'त्वरित परीक्षण के लिए डेमो विवरण' : 'Quick Demo Test Preset'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleUseDemo}
            className="text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 px-3 py-1 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isHindi ? 'डेमो भरें' : 'Fill Demo'}
          </button>
        </div>

        {/* Step 1: Admin Details */}
        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'प्रशासक / अधिकारी का नाम' : 'Administrator Full Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Savitri Bai"
                className="w-full px-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-900"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'मोबाइल नंबर (10 अंक)' : 'Registered Mobile Number (10 Digits)'}
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
                  placeholder="98110 99882"
                  maxLength={10}
                  className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            {/* Organization / Cluster */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'क्लस्टर / स्वयं सहायता समूह / संस्था' : 'Cluster Organization / SHG Mission'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="e.g. Rajasthan Handicrafts Cluster Mission"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'पदनाम / दायित्व' : 'Official Designation / Responsibility'}
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. State Cluster Lead & Quality Inspector"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'आधिकारिक ईमेल' : 'Official Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. coordinator@civicsync.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-paper-300 bg-white text-sm font-medium text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold bg-indigo-950 hover:bg-indigo-900 flex items-center justify-center gap-2"
            >
              <span>{isHindi ? 'सुरक्षा पासकोड प्राप्त करें' : 'Send Security Passcode'}</span>
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
                  className="text-xs font-semibold text-indigo-900 hover:underline cursor-pointer"
                >
                  {isHindi ? 'विवरण बदलें' : 'Edit Details'}
                </button>
              </div>
              <div className="text-xs text-stone-500 font-mono">+91 {phone} • {designation}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                {isHindi ? 'सुरक्षा पिन / ओटीपी दर्ज करें' : 'Enter Security PIN / One-Time Passcode'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="1234"
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-paper-300 bg-white font-mono text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                <span>{isHindi ? 'डेमो पिन:' : 'Demo PIN:'} <strong className="font-mono text-indigo-950">1234</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp('1234')}
                  className="text-indigo-900 font-semibold hover:underline cursor-pointer"
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
              className="w-full font-bold bg-indigo-950 hover:bg-indigo-900 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isHindi ? 'सत्यापित करें और एडमिन पैनल खोलें' : 'Verify & Enter Admin Workspace'}</span>
            </Button>
          </form>
        )}

        {/* Other Persona Quick Links */}
        <div className="pt-4 border-t border-paper-300 flex items-center justify-between text-xs text-stone-600">
          <Link to="/login/artisan" className="hover:text-terracotta-700 flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{isHindi ? 'कारीगर लॉगिन' : 'Artisan Sign-In'}</span>
          </Link>
          <Link to="/login/buyer" className="hover:text-emerald-700 flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            <span>{isHindi ? 'खरीदार लॉगिन' : 'Buyer Sign-In'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
