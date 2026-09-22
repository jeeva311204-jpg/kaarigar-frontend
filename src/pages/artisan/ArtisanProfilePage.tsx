import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { initialArtisan, salesRecords6Months, categoryDistribution } from '../../lib/mockData';
import { SalesChart } from '../../components/analytics/SalesChart';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Award, 
  Calendar, 
  Users, 
  Sparkles, 
  Star 
} from 'lucide-react';

export const ArtisanProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, isHindi } = useTranslation();

  const artisan = currentUser.artisanData || initialArtisan;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      
      {/* Artisan Heritage Bio Hero Card */}
      <div className="bg-paper-100 border border-paper-300 rounded-3xl p-6 sm:p-8 shadow-craft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={artisan.avatar}
            alt={artisan.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-terracotta-400 shadow-craft-md shrink-0"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turmeric-100 text-turmeric-900 border border-turmeric-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-turmeric-700" />
                <span>{t('profile.cooperativeBadge')}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>{artisan.rating} / 5.0 (184 Patrons)</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-indigo-950">
              {isHindi ? artisan.nameHi : artisan.name}
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-terracotta-700">
              {artisan.craftSpecialty}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>{artisan.location}, {artisan.state}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <Phone className="w-4 h-4 text-stone-400" />
                <span>{artisan.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stone-400" />
                <span>{artisan.cooperativeName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Craft Story */}
        <div className="mt-6 pt-5 border-t border-paper-300">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
            {isHindi ? 'कारीगर की विरासत एवं परंपरा' : 'Artisan Craft Lineage & Bio'}
          </span>
          <p className="text-sm text-indigo-950 leading-relaxed font-sans">
            {isHindi ? artisan.bioHi : artisan.bio}
          </p>
        </div>
      </div>

      {/* 6-Month Sales & Analytics Section */}
      <div className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-indigo-950">
          {t('profile.analytics')}
        </h2>
        <SalesChart
          records={salesRecords6Months}
          distribution={categoryDistribution}
        />
      </div>

    </div>
  );
};
