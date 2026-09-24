import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, LanguageCode } from '../../i18n';
import { UserRole } from '../../types';
import { 
  Sparkles, 
  Globe, 
  Store, 
  PlusCircle, 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Shield,
  LogIn,
  ChevronDown,
  Check
} from 'lucide-react';

export const Header: React.FC = () => {
  const { role, setRole, currentUser } = useAuth();
  const { language, setLanguage, t, isHindi, currentLangMeta, languages } = useTranslation();
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    ...(role === 'admin' ? [
      { to: '/admin', label: isHindi ? 'क्लस्टर एडमिन' : 'Cluster Admin', icon: <Shield className="w-4 h-4" /> },
      { to: '/marketplace', label: t('nav.marketplace'), icon: <Store className="w-4 h-4" /> },
    ] : role === 'artisan' ? [
      { to: '/', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/add-product', label: t('nav.addCraft'), icon: <PlusCircle className="w-4 h-4" /> },
      { to: '/inbox', label: t('nav.inbox'), icon: <MessageSquare className="w-4 h-4" /> },
      { to: '/marketplace', label: t('nav.marketplace'), icon: <Store className="w-4 h-4" /> },
    ] : [
      { to: '/marketplace', label: t('nav.marketplace'), icon: <Store className="w-4 h-4" /> },
    ]),
    { to: '/profile', label: t('nav.profile'), icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper-100/95 backdrop-blur-md border-b border-paper-300 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-900 border border-indigo-950 flex items-center justify-center shadow-craft group-hover:scale-105 transition-transform">
              <span className="text-terracotta-400 font-serif font-bold text-xl sm:text-2xl leading-none">
                क
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold text-indigo-950 tracking-tight">
                  Kaarigar
                </span>
                <span className="text-xs sm:text-sm font-serif text-terracotta-600 font-semibold">
                  कारीगर
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 hidden sm:block leading-none">
                {t('common.appTagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isCurrentPath(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-paper-200 text-terracotta-700 font-semibold shadow-xs border border-paper-300'
                      : 'text-stone-700 hover:text-indigo-950 hover:bg-paper-200/60'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Switchers */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Multi-Language Dropdown Selector (Tamil, Telugu, Hindi, English, Marathi, Bengali) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-paper-300 bg-paper-50 hover:bg-paper-200 text-xs sm:text-sm font-semibold text-indigo-950 shadow-xs transition-colors cursor-pointer min-h-[38px]"
                title="Select Language / भाषा चुनें"
                aria-label="Select language"
                aria-expanded={isLangOpen}
              >
                <Globe className="w-4 h-4 text-terracotta-500 shrink-0" />
                <span className="font-medium">{currentLangMeta.nativeName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 py-1.5 bg-paper-50 border border-paper-300 rounded-2xl shadow-craft-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider border-b border-paper-200">
                    {t('common.language')} / भाषा
                  </div>
                  {languages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-terracotta-50 text-terracotta-700 font-bold'
                            : 'text-stone-700 hover:bg-paper-200 hover:text-indigo-950'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-[11px] font-bold text-terracotta-600 bg-paper-200 px-1 py-0.5 rounded text-center">
                            {lang.shortLabel}
                          </span>
                          <div>
                            <span className="text-xs font-semibold block leading-tight">{lang.nativeName}</span>
                            <span className="text-[10px] text-stone-400 block">{lang.name}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-terracotta-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Role Demo Switcher Dropdown */}
            <div className="relative flex items-center bg-paper-200/90 border border-paper-300 rounded-xl p-1 shadow-xs">
              <span className="text-[11px] font-medium text-stone-500 px-1.5 hidden xl:inline">
                {t('common.switchRole')}
              </span>
              {(['artisan', 'buyer', 'admin'] as UserRole[]).map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? (r === 'admin' ? 'bg-indigo-950 text-white shadow-xs' : r === 'artisan' ? 'bg-terracotta-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs')
                        : 'text-stone-600 hover:text-indigo-900'
                    }`}
                  >
                    {r === 'artisan' ? (isHindi ? 'कारीगर' : 'Artisan') : r === 'buyer' ? (isHindi ? 'खरीदार' : 'Buyer') : (isHindi ? 'एडमिन' : 'Admin')}
                  </button>
                );
              })}
            </div>

            {/* Separate Login Pages Link */}
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-paper-300 bg-paper-50 hover:bg-paper-200 text-xs sm:text-sm font-semibold text-stone-700 hover:text-indigo-950 shadow-xs transition-colors cursor-pointer tap-target-accessible min-h-[38px]"
              title={isHindi ? 'अलग-अलग लॉगिन पेज (कारीगर / खरीदार / एडमिन)' : 'Dedicated Login Pages (Artisan / Buyer / Admin)'}
            >
              <LogIn className="w-4 h-4 text-terracotta-600" />
              <span className="hidden md:inline">{isHindi ? 'लॉगिन' : 'Login'}</span>
            </Link>

            {/* Profile Avatar Chip */}
            <Link
              to="/profile"
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-paper-300 bg-paper-50 hover:bg-paper-200 transition-colors shadow-xs"
              title="View Profile"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-paper-300"
              />
              <span className="text-xs font-semibold text-indigo-950 hidden lg:inline max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline ${
                role === 'admin' ? 'bg-indigo-900 text-white' : role === 'artisan' ? 'bg-terracotta-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {role}
              </span>
            </Link>

          </div>

        </div>
      </div>
    </header>
  );
};
