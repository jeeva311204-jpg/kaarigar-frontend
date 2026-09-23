import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, defaultProfiles } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { 
  User, 
  Store, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Mic, 
  ShoppingBag, 
  BarChart3 
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { setRole, loginWithPhone } = useAuth();
  const { t, isHindi } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleQuickDemo = async (targetRole: UserRole) => {
    const demoNumber = defaultProfiles[targetRole].phone.replace(/\D/g, '').slice(-10);
    const success = await loginWithPhone(demoNumber, '1234', targetRole);
    if (success) {
      showToast({
        type: 'success',
        title: isHindi ? 'डेमो सत्र सक्रिय' : 'Demo Session Active',
        message: `${defaultProfiles[targetRole].name} (${targetRole.toUpperCase()})`
      });
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'buyer') navigate('/marketplace');
      else navigate('/');
    }
  };

  const portals = [
    {
      role: 'artisan' as UserRole,
      title: isHindi ? 'उस्ताद कारीगर' : 'Master Artisan',
      titleHi: 'कारीगर प्रवेश द्वार',
      desc: isHindi 
        ? 'आवाज़ से उत्पाद सूचीबद्ध करें, एआई से उचित मूल्य प्राप्त करें और सीधे ग्राहकों से जुड़ें' 
        : 'Voice-first craft cataloging, AI fair market valuation, and direct patron connections across India',
      path: '/login/artisan',
      themeBorder: 'border-terracotta-300 hover:border-terracotta-500',
      badgeBg: 'bg-terracotta-50 text-terracotta-800 border-terracotta-200',
      iconBg: 'bg-terracotta-600 text-white',
      btnBg: 'bg-terracotta-600 hover:bg-terracotta-700 text-white',
      icon: <User className="w-6 h-6" />,
      feature: isHindi ? 'आवाज़ आधारित कैटलॉगिंग' : 'Voice-First AI Studio',
      demoUser: defaultProfiles.artisan
    },
    {
      role: 'buyer' as UserRole,
      title: isHindi ? 'शिल्प कद्रदान / खरीदार' : 'Buyer / Patron',
      titleHi: 'खरीदार प्रवेश द्वार',
      desc: isHindi 
        ? 'प्रमाणित जीआई शिल्प खोजें, कारीगरों की सच्ची कहानियां जानें और सीधा आर्डर दें' 
        : 'Discover authentic GI certified handicrafts, generational artisan heritage stories & direct craft orders',
      path: '/login/buyer',
      themeBorder: 'border-emerald-300 hover:border-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-700 text-white',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      icon: <Store className="w-6 h-6" />,
      feature: isHindi ? 'पारदर्शी उचित मूल्य' : 'Direct GI Linkage',
      demoUser: defaultProfiles.buyer
    },
    {
      role: 'admin' as UserRole,
      title: isHindi ? 'क्लस्टर प्रशासक' : 'Cluster Admin',
      titleHi: 'प्रशासक प्रवेश द्वार',
      desc: isHindi 
        ? 'स्वयं सहायता समूह (SHG) व क्लस्टर कारीगर निर्देशिका, कैटलॉग सत्यापन और विश्लेषण' 
        : 'SHG cluster governance, artisan directory management, catalog moderation & market analytics',
      path: '/login/admin',
      themeBorder: 'border-indigo-300 hover:border-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      iconBg: 'bg-indigo-950 text-terracotta-400',
      btnBg: 'bg-indigo-950 hover:bg-indigo-900 text-white',
      icon: <Shield className="w-6 h-6" />,
      feature: isHindi ? 'क्लस्टर निगरानी' : 'Cluster Oversight',
      demoUser: defaultProfiles.admin
    }
  ];

  return (
    <div className="min-h-[85vh] max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Header Branding */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-900 border border-indigo-950 flex items-center justify-center mx-auto mb-2 text-terracotta-400 font-serif font-bold text-2xl shadow-craft">
          क
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-indigo-950">
          {t('common.appName')} • {isHindi ? 'प्रवेश पोर्टल' : 'Authentication Portals'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          {isHindi 
            ? 'अपनी भूमिका चुनें और अपने समर्पित मोबाइल लॉगिन पृष्ठ पर जाएं' 
            : 'Select your role to access your dedicated mobile phone login page'}
        </p>
      </div>

      {/* 3 Separate Portal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {portals.map((portal) => (
          <div
            key={portal.role}
            className={`bg-paper-100 rounded-3xl border ${portal.themeBorder} p-6 shadow-craft hover:shadow-craft-lg transition-all flex flex-col justify-between space-y-5`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${portal.iconBg} flex items-center justify-center shadow-xs`}>
                  {portal.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${portal.badgeBg}`}>
                  {portal.feature}
                </span>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold text-indigo-950">
                  {portal.title}
                </h2>
                <div className="text-xs font-semibold text-terracotta-700 mt-0.5">
                  {portal.titleHi}
                </div>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {portal.desc}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-paper-200">
              <Link
                to={portal.path}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold ${portal.btnBg} transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer`}
              >
                <span>{isHindi ? 'लॉगिन पृष्ठ पर जाएं' : `Sign In as ${portal.title.split(' ')[0]}`}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => handleQuickDemo(portal.role)}
                className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-stone-600 hover:text-indigo-950 hover:bg-paper-200/80 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-terracotta-600" />
                <span>{isHindi ? '1-क्लिक त्वरित डेमो' : '1-Click Quick Demo'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security Trust Note */}
      <div className="bg-paper-100/70 border border-paper-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            {isHindi 
              ? 'राष्ट्रीय हस्तशिल्प मिशन (SIH26090) समर्थित सुरक्षित मोबाइल ओटीपी प्रमाणीकरण' 
              : 'Secure Indian Mobile OTP authentication certified under CivicSync (SIH26090)'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-terracotta-700">
          <span>+91 SMS Gateway</span>
          <span>•</span>
          <span>100% Free for Artisans</span>
        </div>
      </div>

    </div>
  );
};
