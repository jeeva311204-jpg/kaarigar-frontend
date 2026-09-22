import React from 'react';
import { Sparkles, CheckCircle2, Loader2, Cpu } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface ProcessingModalProps {
  isOpen: boolean;
  currentStage: number; // 1 to 4
  stageMessage?: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  currentStage,
  stageMessage
}) => {
  const { t, isHindi } = useTranslation();

  if (!isOpen) return null;

  const stages = [
    { num: 1, label: t('processing.stage1') },
    { num: 2, label: t('processing.stage2') },
    { num: 3, label: t('processing.stage3') },
    { num: 4, label: t('processing.stage4') },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper-50 rounded-3xl border border-paper-300 shadow-craft-lg max-w-md w-full p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        
        {/* Animated Central AI Icon */}
        <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-terracotta-200 animate-ping opacity-40" />
          <div className="relative w-20 h-20 rounded-full bg-indigo-900 border-2 border-terracotta-400 flex items-center justify-center text-turmeric-400 shadow-craft">
            <Sparkles className="w-10 h-10 animate-craft-pulse" />
          </div>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-indigo-950 mb-1">
          {t('processing.modalTitle')}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mb-6">
          {t('processing.modalSubtitle')}
        </p>

        {/* Progress Stages List */}
        <div className="space-y-3 text-left">
          {stages.map((stg) => {
            const isDone = currentStage > stg.num;
            const isCurrent = currentStage === stg.num;

            return (
              <div
                key={stg.num}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-turmeric-50/80 border-turmeric-300 shadow-xs text-indigo-950 font-semibold'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-stone-700'
                    : 'bg-paper-100/50 border-paper-300/60 text-stone-400 opacity-60'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-turmeric-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-[10px] text-stone-400">
                      {stg.num}
                    </div>
                  )}
                </div>

                <span className="text-xs sm:text-sm leading-snug">
                  {stg.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Stage Indicator */}
        <div className="mt-6 pt-4 border-t border-paper-300 flex items-center justify-center gap-2 text-xs font-semibold text-terracotta-700">
          <Cpu className="w-4 h-4 animate-pulse" />
          <span>{stageMessage || t('processing.almostDone')}</span>
        </div>

      </div>
    </div>
  );
};
