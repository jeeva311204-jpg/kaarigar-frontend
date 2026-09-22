import React, { useState } from 'react';
import { SalesRecord, CategoryDistribution } from '../../types';
import { useTranslation } from '../../i18n';
import { TrendingUp, Award, Layers, ShoppingBag } from 'lucide-react';

interface SalesChartProps {
  records: SalesRecord[];
  distribution: CategoryDistribution[];
}

export const SalesChart: React.FC<SalesChartProps> = ({
  records,
  distribution
}) => {
  const { t, isHindi } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxRevenue = Math.max(...records.map((r) => r.revenue), 1000);
  const totalRevenue6M = records.reduce((acc, r) => acc + r.revenue, 0);
  const totalOrders6M = records.reduce((acc, r) => acc + r.orders, 0);

  return (
    <div className="space-y-6">
      
      {/* 6-Month Summary Header KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-paper-100 p-4 rounded-2xl border border-paper-300 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-terracotta-500" />
            <span>{isHindi ? '6 माह की आमदनी' : '6-Month Revenue'}</span>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-950">
            ₹{totalRevenue6M.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-paper-100 p-4 rounded-2xl border border-paper-300 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-turmeric-600" />
            <span>{isHindi ? 'कुल ऑर्डर्स' : 'Patron Orders'}</span>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-950">
            {totalOrders6M} {t('common.pieces')}
          </div>
        </div>

        <div className="bg-paper-100 p-4 rounded-2xl border border-paper-300 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'औसत ऑर्डर मूल्य' : 'Avg Order Value'}</span>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-indigo-950">
            ₹{Math.round(totalRevenue6M / totalOrders6M).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* SVG Bar Chart for Monthly Revenue */}
      <div className="bg-paper-100 p-5 sm:p-6 rounded-3xl border border-paper-300 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-indigo-950">
              {t('profile.monthlyRevenue')}
            </h4>
            <p className="text-xs text-stone-500">
              {isHindi ? 'अप्रैल - सितम्बर 2026 बिक्री रुझान' : 'April - September 2026 Growth Trend'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full">
            +96.2% {isHindi ? 'वृद्धि' : 'Growth'}
          </span>
        </div>

        {/* Custom Responsive SVG Chart */}
        <div className="relative pt-6 pb-2">
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56 px-2 border-b border-paper-300">
            {records.map((rec, idx) => {
              const heightPct = Math.round((rec.revenue / maxRevenue) * 100);
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={rec.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-indigo-950 text-white text-xs py-1.5 px-2.5 rounded-xl shadow-craft-md whitespace-nowrap animate-in fade-in duration-150">
                      <div className="font-bold">₹{rec.revenue.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-stone-300">{rec.orders} pieces sold</div>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-terracotta-500 shadow-craft'
                        : 'bg-gradient-to-t from-indigo-900 to-terracotta-500/80 hover:to-terracotta-500'
                    }`}
                  />

                  {/* Month Label */}
                  <span className="text-xs font-bold text-stone-600 mt-2">
                    {rec.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Craft Category Distribution */}
      <div className="bg-paper-100 p-5 sm:p-6 rounded-3xl border border-paper-300 shadow-xs">
        <h4 className="font-serif text-base sm:text-lg font-bold text-indigo-950 mb-1 flex items-center gap-2">
          <Layers className="w-4 h-4 text-terracotta-500" />
          <span>{t('profile.craftDistribution')}</span>
        </h4>
        <p className="text-xs text-stone-500 mb-5">
          {isHindi ? 'कार्यशाला की विभिन्न हस्तकलाओं की बिक्री में हिस्सेदारी' : 'Contribution of each craft category to workshop sales'}
        </p>

        <div className="space-y-3.5">
          {distribution.map((item, idx) => {
            const barColors = [
              'bg-terracotta-500',
              'bg-indigo-900',
              'bg-turmeric-500',
              'bg-emerald-600'
            ];
            const color = barColors[idx % barColors.length];

            return (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-950">
                  <span>{item.category}</span>
                  <span className="font-mono text-stone-600">
                    {item.percentage}% ({item.itemCount} {t('common.pieces')})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-paper-200 rounded-full overflow-hidden border border-paper-300/60">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
