import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { LayoutDashboard, PlusCircle, Store, MessageSquare, User, Shield } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { role } = useAuth();
  const { t, isHindi } = useTranslation();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-100/95 backdrop-blur-md border-t border-paper-300 pb-safe shadow-craft-lg">
      <div className="flex items-center justify-around px-2 py-1 h-16">
        
        {role === 'admin' ? (
          <>
            {/* Admin Cluster Dashboard */}
            <Link
              to="/admin"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/admin') ? 'text-indigo-900 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <Shield className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{isHindi ? 'क्लस्टर' : 'Cluster'}</span>
            </Link>

            {/* Marketplace view */}
            <Link
              to="/marketplace"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/marketplace') ? 'text-indigo-900 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.marketplace')}</span>
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/profile') ? 'text-indigo-900 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.profile')}</span>
            </Link>
          </>
        ) : role === 'artisan' ? (
          <>
            {/* Dashboard */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/') ? 'text-terracotta-600 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.dashboard')}</span>
            </Link>

            {/* Add Craft Center Highlight Button */}
            <Link
              to="/add-product"
              className="flex flex-col items-center justify-center -mt-5 relative tap-target-accessible group"
            >
              <div className="w-13 h-13 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white flex items-center justify-center shadow-craft-md border-2 border-paper-50 group-active:scale-95 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-terracotta-700 mt-0.5">
                {t('nav.addCraft')}
              </span>
            </Link>

            {/* Inquiries */}
            <Link
              to="/inbox"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/inbox') ? 'text-terracotta-600 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.inbox')}</span>
            </Link>

            {/* Marketplace view */}
            <Link
              to="/marketplace"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/marketplace') ? 'text-terracotta-600 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.marketplace')}</span>
            </Link>
          </>
        ) : (
          <>
            {/* Buyer Marketplace */}
            <Link
              to="/marketplace"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/marketplace') ? 'text-emerald-700 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.marketplace')}</span>
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center flex-1 h-full tap-target-accessible transition-colors ${
                isCurrent('/profile') ? 'text-emerald-700 font-bold' : 'text-stone-600 hover:text-indigo-950'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] leading-tight">{t('nav.profile')}</span>
            </Link>
          </>
        )}

      </div>
    </div>
  );
};
