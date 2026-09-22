import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Keyboard, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Info, 
  Volume2, 
  Check,
  Radio
} from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
  { 
    code: 'en-IN', 
    name: 'English', 
    nativeName: 'English',
    placeholder: 'Describe your craft in English... (materials used, crafting technique, heritage story, time taken)'
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    nativeName: 'हिन्दी',
    placeholder: 'अपनी कलाकृति का विवरण हिन्दी में बताएं या लिखें... (सामग्री, बनाने में लगा समय, हस्तकला की विशेषता)'
  },
  { 
    code: 'bn-IN', 
    name: 'Bengali', 
    nativeName: 'বাংলা',
    placeholder: 'আপনার কারুশিল্পের বিবরণ বাংলায় লিখুন বা বলুন... (উপকরণ, তৈরির প্রক্রিয়া, ঐতিহ্য)'
  },
  { 
    code: 'ta-IN', 
    name: 'Tamil', 
    nativeName: 'தமிழ்',
    placeholder: 'உங்கள் கைவினைப் பொருளைப் பற்றி தமிழில் விவரிக்கவும்... (பயன்படுத்திய பொருட்கள், தயாரிப்பு நேரம், பாரம்பரியம்)'
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    nativeName: 'తెలుగు',
    placeholder: 'మీ చేతిపని గురించి తెలుగులో వివరించండి... (ఉపయోగించిన వస్తువులు, తయారీ సమయం, వారసత్వ విశేషాలు)'
  },
  { 
    code: 'mr-IN', 
    name: 'Marathi', 
    nativeName: 'मराठी',
    placeholder: 'तुमच्या हस्तकलेचे वर्णन मराठीत सांगा किंवा लिहा... (वापरलेले साहित्य, कला प्रकार, वैशिष्ट्ये)'
  },
];

/**
 * VoiceTextStep component
 * Supports both voice recording (with Web Speech API live preview) and direct text input
 * across 6 Indian language locales.
 *
 * @param {Object} props
 * @param {Function} props.onChange - Called with { language, description, audioUrl, audioBlob }
 * @param {Object} [props.value] - Existing step data { language, description, audioUrl, audioBlob }
 * @param {string} [props.initialLanguage] - Initial language code (defaults to hi-IN or en-IN)
 * @param {string} [props.initialDescription] - Initial description string
 * @param {string} [props.initialAudioUrl] - Initial audio preview URL
 */
export const VoiceTextStep = ({
  onChange,
  value,
  initialLanguage = 'hi-IN',
  initialDescription = '',
  initialAudioUrl = null
}) => {
  // Controlled or uncontrolled initial state resolution
  const [selectedLanguage, setSelectedLanguage] = useState(
    value?.language || initialLanguage || 'hi-IN'
  );
  const [mode, setMode] = useState('speak'); // 'speak' | 'type'
  const [description, setDescription] = useState(
    value?.description !== undefined ? value.description : initialDescription
  );
  const [audioUrl, setAudioUrl] = useState(
    value?.audioUrl !== undefined ? value.audioUrl : initialAudioUrl
  );
  const [audioBlob, setAudioBlob] = useState(value?.audioBlob || null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimText, setInterimText] = useState('');

  // Audio player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Check Web Speech API support on mount
  useEffect(() => {
    const hasSpeech = typeof window !== 'undefined' && 
      (Boolean(window.SpeechRecognition) || Boolean(window.webkitSpeechRecognition));
    setSpeechSupported(hasSpeech);
  }, []);

  // Synchronize when value prop updates from parent
  useEffect(() => {
    if (value) {
      if (value.language && value.language !== selectedLanguage) {
        setSelectedLanguage(value.language);
      }
      if (value.description !== undefined && value.description !== description) {
        setDescription(value.description);
      }
      if (value.audioUrl !== undefined && value.audioUrl !== audioUrl) {
        setAudioUrl(value.audioUrl);
      }
      if (value.audioBlob !== undefined && value.audioBlob !== audioBlob) {
        setAudioBlob(value.audioBlob);
      }
    }
  }, [value]);

  // Unified callback dispatcher
  const notifyChange = (updates = {}) => {
    const merged = {
      language: updates.language !== undefined ? updates.language : selectedLanguage,
      description: updates.description !== undefined ? updates.description : description,
      audioUrl: updates.audioUrl !== undefined ? updates.audioUrl : audioUrl,
      audioBlob: updates.audioBlob !== undefined ? updates.audioBlob : audioBlob
    };
    if (typeof onChange === 'function') {
      onChange({
        language: merged.language,
        description: merged.description,
        audioUrl: merged.audioUrl,
        audioBlob: merged.audioBlob
      });
    }
  };

  // Switch language
  const handleSelectLanguage = (code) => {
    setSelectedLanguage(code);
    notifyChange({ language: code });

    // If currently recording and speech recognition is running, update language
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.lang = code;
      } catch (e) {
        console.warn('Could not update recognition language on the fly:', e);
      }
    }
  };

  // Switch mode ('speak' or 'type')
  const handleToggleMode = (newMode) => {
    if (isRecording) {
      stopRecording();
    }
    setMode(newMode);
  };

  // Handle direct text typing
  const handleTextChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    notifyChange({ description: val });
  };

  // Clean up recording stream and timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  /**
   * Start Voice Recording with MediaRecorder and Web Speech API
   * Note in a code comment: getUserMedia requires HTTPS or localhost, so mic
   * access will silently fail on non-secure deployments — flag this rather than
   * letting it fail silently in the UI (show an inline error if
   * getUserMedia rejects).
   */
  const startRecording = async () => {
    setMicError(null);
    setInterimText('');
    audioChunksRef.current = [];

    // Note: getUserMedia requires HTTPS or localhost, so mic access will silently fail on non-secure deployments — flag this rather than letting it fail silently in the UI (show an inline error if getUserMedia rejects).
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError(
        'Microphone access is not supported or requires a secure context (HTTPS or localhost). Please switch to Type mode.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Select supported audio mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        // Local playback preview object URL
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Turn off mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        notifyChange({ audioUrl: url, audioBlob: blob });
      };

      // Start recording slices
      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);

      // Attempt live on-device speech transcription via Web Speech API
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.lang = selectedLanguage;
          recognition.continuous = true;
          recognition.interimResults = true;

          let accumulatedTranscript = description ? description.trim() + ' ' : '';

          recognition.onresult = (event) => {
            let interim = '';
            let finalPortion = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalPortion += res[0].transcript + ' ';
              } else {
                interim += res[0].transcript;
              }
            }

            if (finalPortion) {
              accumulatedTranscript += finalPortion;
            }

            const liveCombined = (accumulatedTranscript + interim).trim();
            setInterimText(interim);
            if (liveCombined) {
              setDescription(liveCombined);
              notifyChange({ description: liveCombined });
            }
          };

          recognition.onerror = (event) => {
            console.warn('SpeechRecognition notice/error:', event.error);
            // Non-blocking: audio is still recorded by MediaRecorder
          };

          recognition.onend = () => {
            // If still recording via MediaRecorder, attempt restart
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              try {
                recognition.start();
              } catch (e) {
                // Ignore if unable to restart
              }
            }
          };

          recognition.start();
        } catch (speechErr) {
          console.warn('Live SpeechRecognition not started:', speechErr);
        }
      }

    } catch (err) {
      // getUserMedia failed or was denied
      console.error('getUserMedia error:', err);
      // Note: getUserMedia requires HTTPS or localhost, so mic access will silently fail on non-secure deployments
      const isSecurityError =
        window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      if (isSecurityError) {
        setMicError(
          'Microphone access requires HTTPS or localhost. Please deploy securely or switch to Type mode to continue.'
        );
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError(
          'Microphone permission was denied. Please allow microphone access in your browser or switch to Type mode.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError(
          'No microphone was detected on this device. Please connect a mic or use Type mode.'
        );
      } else {
        setMicError(
          err.message || 'Could not access microphone. Please switch to Type mode to write your description.'
        );
      }
      setIsRecording(false);
    }
  };

  /**
   * Stop Voice Recording
   */
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('MediaRecorder stop error:', e);
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    setIsRecording(false);
    setInterimText('');
  };

  // Reset or re-record audio
  const handleResetAudio = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (e) {
        // ignore
      }
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingSeconds(0);
    setIsPlaying(false);
    notifyChange({ audioUrl: null, audioBlob: null });
  };

  // Audio preview playback toggle
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const activeLangConfig = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          <h3 className="font-serif text-base sm:text-lg font-bold text-ink">
            Tell the Story of Your Craft
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-inkSoft">
          Record your voice in your native language or type manually. Kaarigar AI creates bilingual cultural stories, GI tags, and fair pricing from your input.
        </p>
      </div>

      {/* 1. Language Picker (Chip buttons) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-inkSoft uppercase tracking-wider">
          Select Artisan Language / भाषा चुनें
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer tap-target-accessible ${
                  isSelected
                    ? 'bg-indigoDeep text-white shadow-craft ring-2 ring-indigoDeep/20 font-semibold'
                    : 'bg-paper2 text-ink hover:bg-paper-300 border border-thread/80'
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-inkSoft'}`}>
                  ({lang.name})
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-terracotta-300 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mode Toggle (Speak vs Type) */}
      <div className="flex items-center justify-between border-b border-thread/60 pb-3">
        <span className="text-xs font-bold text-inkSoft uppercase tracking-wider">
          Input Mode / माध्यम
        </span>
        <div className="inline-flex p-1 rounded-2xl bg-paper2 border border-thread">
          <button
            type="button"
            onClick={() => handleToggleMode('speak')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'speak'
                ? 'bg-terracotta text-white shadow-craft'
                : 'text-inkSoft hover:text-ink'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speak (बोलें)</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('type')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'type'
                ? 'bg-terracotta text-white shadow-craft'
                : 'text-inkSoft hover:text-ink'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Type (लिखें)</span>
          </button>
        </div>
      </div>

      {/* Inline Microphone Access Error Alert */}
      {micError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{micError}</p>
            <p className="text-[11px] sm:text-xs text-amber-800">
              Tip: You can switch to the <strong>Type</strong> mode above at any time to type your craft description directly.
            </p>
          </div>
        </div>
      )}

      {/* 3. VOICE MODE INTERFACE */}
      {mode === 'speak' && (
        <div className="space-y-4">
          
          {/* Web Speech API browser compatibility notice if unsupported */}
          {!speechSupported && (
            <div className="p-3 rounded-xl bg-paper2 border border-thread text-inkSoft text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-turmeric-600 shrink-0" />
              <span>
                Live browser speech recognition is not supported in this browser. Your full audio is still recorded and will be transcribed server-side via AI.
              </span>
            </div>
          )}

          {/* Recorder Panel */}
          <div className="bg-paper border border-thread rounded-3xl p-6 text-center space-y-4 shadow-craft relative overflow-hidden">
            
            {/* Pulsing indicator when recording */}
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold animate-pulse">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>REC • {formatSeconds(recordingSeconds)}</span>
              </div>
            )}

            {/* Record Trigger Button */}
            <div className="flex flex-col items-center justify-center py-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-terracotta hover:bg-terracottaDeep text-white flex flex-col items-center justify-center shadow-craft-md hover:scale-105 active:scale-95 transition-all cursor-pointer tap-target-accessible ring-8 ring-terracotta/20"
                  aria-label="Start recording audio description"
                >
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Record</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center shadow-craft-md hover:scale-105 active:scale-95 transition-all cursor-pointer tap-target-accessible ring-8 ring-red-200 animate-pulse"
                  aria-label="Stop recording audio description"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
                </button>
              )}

              <p className="text-xs sm:text-sm font-semibold text-ink mt-3">
                {isRecording 
                  ? `Listening in ${activeLangConfig.nativeName}... Tap 'Done' when finished.` 
                  : audioUrl 
                  ? 'Voice recorded! Tap Record again to overwrite, or edit text below.' 
                  : `Tap to speak in ${activeLangConfig.nativeName} (${activeLangConfig.name})`}
              </p>
            </div>

            {/* Audio Playback / Preview Bar (if audio is recorded) */}
            {audioUrl && !isRecording && (
              <div className="pt-3 border-t border-thread/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-paper2/60 rounded-2xl p-3">
                <audio
                  ref={audioPlayerRef}
                  src={audioUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={() => {
                    if (audioPlayerRef.current) {
                      setPlaybackTime(audioPlayerRef.current.currentTime);
                      setPlaybackDuration(audioPlayerRef.current.duration || 0);
                    }
                  }}
                  className="hidden"
                />

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center shadow-xs hover:bg-terracottaDeep cursor-pointer shrink-0"
                    aria-label={isPlaying ? 'Pause audio preview' : 'Play audio preview'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                      <Volume2 className="w-3.5 h-3.5 text-terracotta" />
                      <span>Audio Preview</span>
                    </div>
                    <span className="text-[11px] text-inkSoft font-mono">
                      {formatSeconds(playbackTime)} / {formatSeconds(playbackDuration || recordingSeconds)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetAudio}
                  className="text-xs text-inkSoft hover:text-terracotta flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-paper border border-thread/60 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>
              </div>
            )}
          </div>

          {/* Editable Live Transcript Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-inkSoft uppercase tracking-wider">
                Craft Description & Transcript / विवरण
              </label>
              {isRecording && interimText && (
                <span className="text-[11px] text-terracotta font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Transcribing live...
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                value={description}
                onChange={handleTextChange}
                placeholder={activeLangConfig.placeholder}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-paper border border-thread text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm leading-relaxed transition-all resize-y shadow-inner"
              />
            </div>
            <p className="text-[11px] text-inkSoft">
              You can freely refine or edit this description at any time before proceeding.
            </p>
          </div>

        </div>
      )}

      {/* 4. TEXT MODE INTERFACE */}
      {mode === 'type' && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-inkSoft uppercase tracking-wider">
            Type Craft Description in {activeLangConfig.nativeName} ({activeLangConfig.name})
          </label>
          <textarea
            value={description}
            onChange={handleTextChange}
            placeholder={activeLangConfig.placeholder}
            rows={6}
            className="w-full px-4 py-3.5 rounded-2xl bg-paper border border-thread text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm leading-relaxed transition-all resize-y shadow-inner"
          />
          <div className="flex items-center justify-between text-[11px] text-inkSoft pt-1">
            <span>Minimum detail recommended: materials used, craft origin, dimensions.</span>
            <span className={description.trim().length > 0 ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
              {description.trim().length} characters
            </span>
          </div>
        </div>
      )}

      {/* Guided Helper Card */}
      <div className="bg-turmeric-50/80 border border-turmeric-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-turmeric-700 shrink-0 mt-0.5" />
          <div className="text-xs text-ink space-y-1">
            <span className="font-bold block text-turmeric-900">
              Artisan Pro-tip:
            </span>
            <p className="text-inkSoft leading-relaxed">
              Mention the raw materials (e.g. quartz stone, ivory wood, natural dyes), who made it, and cultural story. Kaarigar AI uses this to craft an authentic provenance certificate and estimate fair artisan compensation.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VoiceTextStep;
