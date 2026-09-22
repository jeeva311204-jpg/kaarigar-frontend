import React from 'react';
import { useTranslation } from '../../i18n';
import { AudioRecorder } from '../common/AudioRecorder';
import { Mic, Sparkles, HelpCircle } from 'lucide-react';

interface WizardStep2VoiceProps {
  onAudioData: (data: { blob: Blob | null; transcript: string; language: string }) => void;
  currentTranscript: string;
}

export const WizardStep2Voice: React.FC<WizardStep2VoiceProps> = ({
  onAudioData,
  currentTranscript
}) => {
  const { t, isHindi } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-indigo-950 mb-1">
          {t('wizard.step2Title')}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mb-4">
          {t('wizard.step2Subtitle')}
        </p>

        {/* Guided Prompts for Low Digital Literacy Artisans */}
        <div className="bg-turmeric-50/70 border border-turmeric-200 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-turmeric-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-turmeric-950 space-y-1 leading-relaxed">
              <span className="font-bold block">
                {isHindi ? 'बोलते समय ये बातें बताएं:' : 'Helpful things to mention in your voice note:'}
              </span>
              <ul className="list-disc pl-4 space-y-0.5 opacity-90">
                <li>{isHindi ? 'यह शिल्प किस सामग्री से बना है? (मिट्टी, पत्थर, रेशम, पीतल आदि)' : 'What materials did you use? (e.g., quartz stone, brass, pure silk)'}</li>
                <li>{isHindi ? 'इसे बनाने में कितना समय या कितने दिन लगे?' : 'How many hours or days did it take to complete?'}</li>
                <li>{isHindi ? 'इस पर बनी कलाकृति या रंगों की क्या विशेषता है?' : 'What does the design or color palette represent?'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Voice Recorder Component */}
        <AudioRecorder
          onAudioReady={onAudioData}
          initialTranscript={currentTranscript}
        />

      </div>
    </div>
  );
};
