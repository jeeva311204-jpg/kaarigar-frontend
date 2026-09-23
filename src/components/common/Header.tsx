import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { UserRole } from '../../types';
import { 
  Sparkles, 
  Globe, 
  Store, 
  PlusCircle, 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Wifi, 
  WifiOff,
  Shield,
  LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const { role, setRole, currentUser } = useAuth();
  const { language, setLanguage, t, isHindi } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

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
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-paper-300 bg-paper-50 hover:bg-paper-200 text-xs sm:text-sm font-semibold text-indigo-950 shadow-xs transition-colors cursor-pointer tap-target-accessible min-h-[40px]"
              title="Toggle Language / भाषा बदलें"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4 text-terracotta-500" />
              <span>{isHindi ? 'English' : 'हिंदी'}</span>
            </button>

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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-paper-300 bg-paper-50 hover:bg-paper-200 text-xs sm:text-sm font-semibold text-stone-700 hover:text-indigo-950 shadow-xs transition-colors cursor-pointer tap-target-accessible min-h-[40px]"
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
