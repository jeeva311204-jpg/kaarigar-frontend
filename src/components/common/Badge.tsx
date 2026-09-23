import React from 'react';
import { ProductStatus } from '../../types';
import { Sparkles, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface BadgeProps {
  status?: ProductStatus;
  giCertified?: boolean;
  giTagNumber?: string;
  category?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  giCertified,
  giTagNumber,
  category,
  className = ''
}) => {
  const { t } = useTranslation();

  if (giCertified) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-turmeric-100 text-turmeric-800 border border-turmeric-300 shadow-xs ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-turmeric-700" />
        <span>{t('common.giTagged')}</span>
        {giTagNumber && <span className="opacity-75 font-mono text-[10px]">({giTagNumber})</span>}
      </span>
    );
  }

  if (category) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-paper-200 text-indigo-900 border border-paper-300 ${className}`}>
        {category}
      </span>
    );
  }

  if (status === 'live') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs ${className}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{t('dashboard.tabLive')}</span>
      </span>
    );
  }

  if (status === 'draft') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>{t('dashboard.tabDraft')}</span>
      </span>
    );
  }

  if (status === 'pending_sync') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-terracotta-50 text-terracotta-800 border border-terracotta-200 animate-pulse ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
        <span>{t('dashboard.tabPending')}</span>
      </span>
    );
  }

  if (status === 'sold') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-900 border border-purple-200 shadow-xs ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
        <span>Sold</span>
      </span>
    );
  }

  return null;
};
