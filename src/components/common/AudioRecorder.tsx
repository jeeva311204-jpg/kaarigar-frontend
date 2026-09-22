import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Sparkles, Check } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { Button } from './Button';

interface AudioRecorderProps {
  onAudioReady: (data: { blob: Blob | null; transcript: string; language: string; isSample?: boolean }) => void;
  initialTranscript?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioReady,
  initialTranscript = ''
}) => {
  const { t, isHindi } = useTranslation();

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [isUsingSample, setIsUsingSample] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up timers & streams
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Visualizer loop
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        // Gradient from terracotta to turmeric
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#C25E3E');
        gradient.addColorStop(1, '#D97706');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth + 1;
      }
    };

    render();
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Setup Web Audio API for waveform
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawWaveform();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsUsingSample(false);

        // Simulated auto-detect Hindi language
        setDetectedLang('hi');
        const defaultTranscript = 'यह कलाकृति मैंने अपने हाथों से प्राकृतिक मिट्टी और पारंपरिक रंगों से तैयार की है।';
        setTranscript(defaultTranscript);

        onAudioReady({
          blob,
          transcript: defaultTranscript,
          language: 'hi',
          isSample: false
        });

        // Stop media tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or not supported:', err);
      // Fallback seamlessly to sample audio
      handleUseSampleAudio();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleUseSampleAudio = () => {
    setIsUsingSample(true);
    setAudioUrl('https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg'); // safe public audio
    setDetectedLang('hi');
    const sampleText = 'यह हस्तशिल्प हमने पारंपरिक चाक और प्राकृतिक रंगों से बनाया है। इसमें क्वार्ट्ज पत्थर और तांबे के नीले रंग का लेप किया गया है।';
    setTranscript(sampleText);
    setRecordDuration(12);

    onAudioReady({
      blob: null,
      transcript: sampleText,
      language: 'hi',
      isSample: true
    });
  };

  const resetRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setTranscript('');
    setDetectedLang(null);
    setRecordDuration(0);
    setIsUsingSample(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-paper-200/80 border border-paper-300 rounded-2xl p-4 sm:p-6 shadow-sm">
      
      {/* Visual Canvas Waveform Header */}
      <div className="flex flex-col items-center justify-center min-h-[140px] bg-paper-100 rounded-xl border border-paper-300/80 p-4 relative overflow-hidden">
        
        {isRecording ? (
          <>
            <canvas 
              ref={canvasRef} 
              width={280} 
              height={70} 
              className="w-full max-w-xs h-16 mb-2"
            />
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-terracotta-500 animate-ping" />
              <span className="font-mono text-base font-bold text-terracotta-700">
                {formatDuration(recordDuration)}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 animate-pulse">
              {t('wizard.recordingState')}
            </p>
          </>
        ) : audioUrl ? (
          <div className="w-full flex flex-col items-center gap-3">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayback}
                className="w-12 h-12 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white flex items-center justify-center shadow-craft transition-transform active:scale-95 cursor-pointer tap-target-accessible"
                aria-label={isPlaying ? 'Pause playback' : 'Play recording'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="text-left">
                <div className="text-sm font-semibold text-indigo-950 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-terracotta-500" />
                  <span>{isUsingSample ? 'Sample Voice Note' : 'Artisan Voice Note'}</span>
                </div>
                <div className="font-mono text-xs text-stone-500">
                  {formatDuration(recordDuration || 12)}
                </div>
              </div>

              <button
                onClick={resetRecording}
                className="ml-auto text-stone-500 hover:text-stone-800 p-2 rounded-lg hover:bg-paper-200 transition-colors"
                title="Rerecord"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Language Auto Detection Badge */}
            {detectedLang && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'पहचानी गई भाषा: हिंदी (हिंदी भाषी स्वर)' : 'Linguistic Match: Hindi (हिंदी) Detected'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center mx-auto mb-2 text-stone-500">
              <Mic className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-stone-600 max-w-xs">
              {t('wizard.step2Subtitle')}
            </p>
          </div>
        )}

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-4">
        {isRecording ? (
          <Button
            variant="primary"
            size="lg"
            onClick={stopRecording}
            leftIcon={<Square className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            {t('wizard.stopRecording')}
          </Button>
        ) : !audioUrl ? (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={startRecording}
              leftIcon={<Mic className="w-5 h-5" />}
              className="w-full sm:w-auto font-bold"
            >
              {t('wizard.pressToRecord')}
            </Button>

            <button
              type="button"
              onClick={handleUseSampleAudio}
              className="text-xs sm:text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 underline underline-offset-4 py-2 px-3 hover:bg-paper-100 rounded-xl transition-colors cursor-pointer tap-target-accessible flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-turmeric-500" />
              <span>{t('wizard.useSampleAudio')}</span>
            </button>
          </>
        ) : null}
      </div>

      {/* Transcription Preview Box */}
      {transcript && (
        <div className="mt-4 p-3.5 bg-paper-50 rounded-xl border border-paper-300 text-left">
          <div className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('wizard.audioTranscript')}</span>
          </div>
          <p className="text-sm text-indigo-950 font-serif italic leading-relaxed">
            "{transcript}"
          </p>
        </div>
      )}

    </div>
  );
};
