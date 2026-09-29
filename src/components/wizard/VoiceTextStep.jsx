import React, { useState, useEffect, useRef } from 'react';
import { transcribeAudio, extractClientPrice } from '../../lib/api';
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
  VolumeX,
  Check,
  Radio,
  Loader2,
  Activity,
  Wand2
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
 * @param {string} [props.category] - Craft category
 */
export const VoiceTextStep = ({
  onChange,
  value,
  initialLanguage = 'hi-IN',
  initialDescription = '',
  initialAudioUrl = null,
  category = 'pottery'
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
  const [micWarning, setMicWarning] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micTestStatus, setMicTestStatus] = useState(null);

  // AI Voice Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const speechHeardRef = useRef(false);
  const spokenWordsRef = useRef('');
  const [exactSpokenWords, setExactSpokenWords] = useState('');
  const [detectedPrice, setDetectedPrice] = useState(null);

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
  const isRecordingRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const speechRestartTimerRef = useRef(null);

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
      if (value.exactWords !== undefined && value.exactWords !== exactSpokenWords) {
        setExactSpokenWords(value.exactWords);
      }
      if (value.detectedPrice !== undefined && value.detectedPrice !== detectedPrice) {
        setDetectedPrice(value.detectedPrice);
      }
    }
  }, [value]);

  // Unified callback dispatcher
  const notifyChange = (updates = {}) => {
    const merged = {
      language: updates.language !== undefined ? updates.language : selectedLanguage,
      description: updates.description !== undefined ? updates.description : description,
      audioUrl: updates.audioUrl !== undefined ? updates.audioUrl : audioUrl,
      audioBlob: updates.audioBlob !== undefined ? updates.audioBlob : audioBlob,
      exactWords: updates.exactWords !== undefined ? updates.exactWords : exactSpokenWords,
      detectedPrice: updates.detectedPrice !== undefined ? updates.detectedPrice : detectedPrice
    };
    if (typeof onChange === 'function') {
      onChange({
        language: merged.language,
        description: merged.description,
        audioUrl: merged.audioUrl,
        audioBlob: merged.audioBlob,
        exactWords: merged.exactWords,
        detectedPrice: merged.detectedPrice
      });
    }
  };

  // AI Voice-to-Text transcription and enhancement trigger
  const handleTranscribeAudioBlob = async (blobToTranscribe, previewUrl, spoken) => {
    const targetBlob = blobToTranscribe || audioBlob;
    if (!targetBlob) return;

    const wordsToEnhance = (spoken || spokenWordsRef.current || exactSpokenWords || description || '').trim();

    setIsTranscribing(true);
    setTranscriptionStatus('Analyzing voice & formulating enhanced craft description with AI...');
    try {
      const res = await transcribeAudio(targetBlob, selectedLanguage, category, wordsToEnhance);
      if (res && (res.enhancedDescription || res.transcript)) {
        const enhanced = (res.enhancedDescription || res.transcript).trim();
        const spokenQuote = (res.exactWords || wordsToEnhance || '').trim();
        if (spokenQuote) {
          setExactSpokenWords(spokenQuote);
          spokenWordsRef.current = spokenQuote;
        }
        if (res.detectedPrice) {
          setDetectedPrice(res.detectedPrice);
        }

        setDescription(enhanced);
        notifyChange({
          description: enhanced,
          audioUrl: previewUrl || audioUrl,
          audioBlob: targetBlob,
          exactWords: spokenQuote,
          detectedPrice: res.detectedPrice || detectedPrice
        });
      }
    } catch (err) {
      console.warn('Voice enhancement error:', err);
    } finally {
      setIsTranscribing(false);
      setTranscriptionStatus('');
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

  // Setup Web Audio API Analyser for real-time waveform visualizer and volume meter
  const setupAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute normalized volume (0 - 100)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        // Draw live animated waveform on canvas if mounted
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx2d = canvas.getContext('2d');
          if (ctx2d) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = Math.max(3, (canvas.width / bufferLength) * 1.6);
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const barHeight = Math.max(4, (dataArray[i] / 255) * canvas.height * 0.92);
              const gradient = ctx2d.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
              gradient.addColorStop(0, '#C25E3E'); // terracotta
              gradient.addColorStop(0.5, '#F59E0B'); // amber/turmeric
              gradient.addColorStop(1, '#10B981'); // emerald
              ctx2d.fillStyle = gradient;
              ctx2d.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);
              x += barWidth + 1.5;
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(renderMeter);
      };

      renderMeter();
    } catch (e) {
      console.warn('Audio analyser setup note:', e);
    }
  };

  // Stop Web Audio API Analyser cleanly
  const stopAudioAnalyser = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  // Clean up recording stream, analyser, and timers on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRestartTimerRef.current) clearTimeout(speechRestartTimerRef.current);
      stopAudioAnalyser();
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
   * Start Voice Recording with MediaRecorder, Web Speech API, and Live Waveform
   */
  const startRecording = async () => {
    setMicError(null);
    setMicWarning(null);
    setInterimText('');
    spokenWordsRef.current = '';
    audioChunksRef.current = [];
    speechHeardRef.current = false;
    isRecordingRef.current = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      isRecordingRef.current = false;
      setMicError(
        'Microphone access is not supported or requires a secure context (HTTPS or localhost). Please switch to Type mode or use a sample voice note below.'
      );
      return;
    }

    try {
      // Robust getUserMedia: try optimal noise/echo cancellation first, fall back to basic audio
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (constraintErr) {
        console.warn('getUserMedia with constraints failed, trying basic audio: true', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;

      // Start live audio visualizer
      setupAudioAnalyser(stream);

      // Select supported audio mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac'
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
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
        stopAudioAnalyser();

        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });

        // Turn off mic tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (blob.size < 200) {
          setMicWarning('No voice audio detected. Please hold the Record button and speak clearly into your mic, or try the sample voice note.');
          return;
        }

        // Local playback preview object URL
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        const capturedSpoken = (spokenWordsRef.current || exactSpokenWords || '').trim();

        // Extract client price immediately if found
        const livePrice = extractClientPrice(capturedSpoken);
        if (livePrice) {
          setDetectedPrice(livePrice);
        }

        notifyChange({
          audioUrl: url,
          audioBlob: blob,
          exactWords: capturedSpoken,
          detectedPrice: livePrice || detectedPrice
        });

        // Trigger AI Voice Transcription to automatically populate Craft Description
        handleTranscribeAudioBlob(blob, url, capturedSpoken);
      };

      // Start recording slices (500ms intervals)
      recorder.start(500);
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

          let accumulatedTranscript = '';

          recognition.onresult = (event) => {
            speechHeardRef.current = true;
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
              spokenWordsRef.current = liveCombined;
              setExactSpokenWords(liveCombined);
              setDescription(liveCombined);

              // Live price extraction while speaking
              const livePrice = extractClientPrice(liveCombined);
              if (livePrice) {
                setDetectedPrice(livePrice);
              }

              notifyChange({
                description: liveCombined,
                exactWords: liveCombined,
                detectedPrice: livePrice || detectedPrice
              });
            }
          };

          recognition.onerror = (event) => {
            console.warn('SpeechRecognition notice/error:', event.error);
            // If browser denies speech recognition permissions or fails, don't crash
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              recognitionRef.current = null;
            }
          };

          recognition.onend = () => {
            // Only restart if user is actively recording
            if (isRecordingRef.current && recognitionRef.current) {
              if (speechRestartTimerRef.current) clearTimeout(speechRestartTimerRef.current);
              speechRestartTimerRef.current = setTimeout(() => {
                if (isRecordingRef.current && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (e) {
                    // Ignore restart collision
                  }
                }
              }, 200);
            }
          };

          recognition.start();
        } catch (speechErr) {
          console.warn('Live SpeechRecognition not started:', speechErr);
        }
      }

    } catch (err) {
      isRecordingRef.current = false;
      stopAudioAnalyser();
      console.error('getUserMedia error:', err);

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
          'Microphone permission was denied. Please click the lock or camera icon in your browser address bar to allow mic access, or use a sample voice note below.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError(
          'No microphone was detected on this device. Please connect a microphone or use a sample voice note below.'
        );
      } else {
        setMicError(
          err.message || 'Could not access microphone. Please switch to Type mode or use a sample voice note.'
        );
      }
      setIsRecording(false);
    }
  };

  /**
   * Stop Voice Recording cleanly
   */
  const stopRecording = () => {
    isRecordingRef.current = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (speechRestartTimerRef.current) {
      clearTimeout(speechRestartTimerRef.current);
      speechRestartTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        if (typeof mediaRecorderRef.current.requestData === 'function') {
          mediaRecorderRef.current.requestData();
        }
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

  /**
   * Independent Microphone Hardware Diagnostics / Test Tool
   */
  const handleTestMicrophone = async () => {
    if (isTestingMic || isRecording) return;
    setIsTestingMic(true);
    setMicTestStatus('Testing microphone... speak into your device now.');
    setMicError(null);
    setMicWarning(null);

    let testStream = null;
    try {
      try {
        testStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
      } catch (e) {
        testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      setupAudioAnalyser(testStream);
      let detectedAudio = false;

      const monitorInterval = setInterval(() => {
        if (analyserRef.current) {
          const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) sum += buffer[i];
          if (sum / buffer.length > 15) {
            detectedAudio = true;
          }
        }
      }, 150);

      setTimeout(() => {
        clearInterval(monitorInterval);
        stopAudioAnalyser();
        if (testStream) {
          testStream.getTracks().forEach((t) => t.stop());
        }
        setIsTestingMic(false);
        if (detectedAudio) {
          setMicTestStatus('✅ Microphone is working perfectly! Strong voice audio detected.');
        } else {
          setMicTestStatus('⚠️ Microphone connected, but input volume was low. Please speak louder or adjust mic settings.');
        }
      }, 3500);

    } catch (err) {
      setIsTestingMic(false);
      setMicTestStatus(null);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
      } else {
        setMicError('Could not access microphone: ' + (err.message || 'Device error'));
      }
    }
  };

  /**
   * One-Tap Sample Artisan Voice Note (Zero typing fallback)
   */
  const handleApplySampleVoice = async (presetLang) => {
    if (isRecording) stopRecording();
    setMicError(null);
    setMicWarning(null);

    const presets = {
      'ta-IN': {
        words: 'இந்த கைவினைப் பானை இயற்கை களிமண்ணால் கையால் செய்யப்பட்டது. இதன் விலை 1500 ரூபாய்.',
        price: 1500,
        lang: 'ta-IN'
      },
      'hi-IN': {
        words: 'यह हस्तनिर्मित मिट्टी का बर्तन है, पूरी तरह हाथ से बनाया गया। इसकी कीमत 1500 रुपये है।',
        price: 1500,
        lang: 'hi-IN'
      },
      'en-IN': {
        words: 'This pottery craft is fully handmade with authentic clay. The price is about 1500 rupees.',
        price: 1500,
        lang: 'en-IN'
      }
    };

    const targetPreset = presets[presetLang] || presets['ta-IN'];
    setSelectedLanguage(targetPreset.lang);
    setExactSpokenWords(targetPreset.words);
    spokenWordsRef.current = targetPreset.words;
    setDetectedPrice(targetPreset.price);

    // Safe public ambience audio for preview
    const sampleUrl = 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg';
    setAudioUrl(sampleUrl);

    // Call transcription/enhancement with preset words
    setIsTranscribing(true);
    setTranscriptionStatus('Enhancing artisan voice with Kaarigar AI...');
    try {
      const res = await transcribeAudio(null, targetPreset.lang, category, targetPreset.words);
      if (res && (res.enhancedDescription || res.transcript)) {
        const enhanced = (res.enhancedDescription || res.transcript).trim();
        setDescription(enhanced);
        notifyChange({
          language: targetPreset.lang,
          description: enhanced,
          audioUrl: sampleUrl,
          audioBlob: null,
          exactWords: targetPreset.words,
          detectedPrice: targetPreset.price
        });
      }
    } catch (e) {
      console.warn('Sample voice enhancement error:', e);
    } finally {
      setIsTranscribing(false);
      setTranscriptionStatus('');
    }
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
    setIsTranscribing(false);
    setTranscriptionStatus('');
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
              Tip: Click the camera/microphone icon in your browser address bar to enable mic permissions, or use the <strong>1-Tap Voice Sample</strong> or <strong>Type</strong> mode.
            </p>
          </div>
        </div>
      )}

      {/* Warning Notice if audio volume was silent */}
      {micWarning && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{micWarning}</span>
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

            {/* Live Waveform Canvas and Volume Meter (Visible while recording or testing mic) */}
            {(isRecording || isTestingMic) && (
              <div className="my-2 p-3 bg-paper2/90 rounded-2xl border border-thread/80 flex flex-col items-center justify-center space-y-2 animate-fadeIn">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={44}
                  className="w-full max-w-xs h-11 bg-paper rounded-xl shadow-inner border border-thread/60"
                />
                
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${audioLevel > 18 ? 'bg-emerald-500 animate-ping' : audioLevel > 5 ? 'bg-amber-500 animate-pulse' : 'bg-stone-400'}`} />
                  <span className="text-xs font-semibold text-ink">
                    {audioLevel > 18
                      ? `Voice Signal: Strong (${audioLevel}%) 🟢`
                      : audioLevel > 5
                      ? `Voice Signal: Active sound (${audioLevel}%) 🟡`
                      : `Listening... Speak clearly into your mic ⚪`}
                  </span>
                </div>

                {/* Animated Volume level progress bar */}
                <div className="w-full max-w-xs h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      audioLevel > 18 ? 'bg-emerald-500' : audioLevel > 5 ? 'bg-turmeric-500' : 'bg-stone-300'
                    }`}
                    style={{ width: `${Math.min(100, audioLevel * 1.6)}%` }}
                  />
                </div>
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

              {/* Hardware Mic Test & Diagnostic Button */}
              {!isRecording && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestMicrophone}
                    disabled={isTestingMic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper2 hover:bg-paper-300 border border-thread text-xs font-medium text-inkSoft hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
                    title="Test if your microphone is active and detecting audio"
                  >
                    <Activity className={`w-3.5 h-3.5 text-terracotta ${isTestingMic ? 'animate-spin' : ''}`} />
                    <span>{isTestingMic ? 'Testing Mic Hardware (3s)...' : 'Test Mic Hardware / माइक जांचें'}</span>
                  </button>

                  {micTestStatus && (
                    <div className="text-xs text-ink bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl shadow-2xs">
                      {micTestStatus}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick 1-Tap Sample Artisan Voice Notes (Instant Zero-Typing Fallback) */}
            {!isRecording && !audioUrl && (
              <div className="mt-2 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-terracottaDeep flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-terracotta" />
                    Try Sample Artisan Voice Note / आवाज़ का नमूना आज़माएँ
                  </span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full font-bold">
                    Price: ₹1,500
                  </span>
                </div>
                <p className="text-[11px] text-inkSoft leading-tight">
                  No mic or want to test instantly? Tap a sample voice note below:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplySampleVoice('ta-IN')}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-300 text-xs font-medium text-ink flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>தமிழ் (Tamil)</span>
                    <span className="text-[10px] text-emerald-700 font-bold">"விலை 1500 ரூபாய்"</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySampleVoice('hi-IN')}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-300 text-xs font-medium text-ink flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>हिन्दी (Hindi)</span>
                    <span className="text-[10px] text-emerald-700 font-bold">"कीमत 1500 रुपये"</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySampleVoice('en-IN')}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-300 text-xs font-medium text-ink flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>English</span>
                    <span className="text-[10px] text-emerald-700 font-bold">"Price ₹1500"</span>
                  </button>
                </div>
              </div>
            )}

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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTranscribeAudioBlob(audioBlob, audioUrl)}
                    disabled={isTranscribing}
                    className="text-xs text-terracotta hover:text-terracottaDeep flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta/10 hover:bg-terracotta/20 border border-terracotta/30 transition-colors cursor-pointer disabled:opacity-50"
                    title="Re-run AI speech-to-text transcription"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isTranscribing ? 'animate-spin' : ''}`} />
                    <span>{isTranscribing ? 'Transcribing...' : 'AI Transcribe'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAudio}
                    className="text-xs text-inkSoft hover:text-terracotta flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-paper border border-thread/60 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-record</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Editable Live Transcript Field */}
          <div className="space-y-2">
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

            {/* Active AI Transcription Banner */}
            {isTranscribing && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-center gap-3 animate-pulse shadow-xs">
                <Sparkles className="w-5 h-5 text-terracotta shrink-0 animate-spin" />
                <div className="flex-1">
                  <span className="font-bold block">
                    Analyzing voice & formulating enhanced craft description... / आपकी आवाज़ से शिल्प विवरण तैयार किया जा रहा है...
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Kaarigar AI is analyzing your spoken voice in {activeLangConfig.nativeName} ({activeLangConfig.name}) to extract price and handmade heritage details.
                  </span>
                </div>
              </div>
            )}

            {/* Voice Analysis & Exact Words Badge */}
            {!isTranscribing && audioUrl && (exactSpokenWords || detectedPrice) && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-terracottaDeep">
                    <Mic className="w-3.5 h-3.5 text-terracotta" />
                    <span>Exact Artisan Voice Captured / கைவினைஞர் நேரடி வார்த்தைகள்:</span>
                  </div>
                  {detectedPrice && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs">
                      Stated Price: ₹{detectedPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {exactSpokenWords && (
                  <p className="text-xs text-ink italic font-serif bg-white/90 px-3 py-2 rounded-xl border border-amber-200/60 shadow-inner">
                    "{exactSpokenWords}"
                  </p>
                )}
              </div>
            )}

            {/* Transcription Success Badge */}
            {!isTranscribing && audioUrl && description && description.trim() && (
              <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-3.5 py-2 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    Voice analyzed & enhanced into craft description! / आवाज़ से शिल्प विवरण तैयार!
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold">
                  Ready to continue
                </span>
              </div>
            )}

            <div className="relative">
              <textarea
                value={description}
                onChange={handleTextChange}
                placeholder={isTranscribing ? 'Converting voice note into craft description...' : activeLangConfig.placeholder}
                rows={4}
                className={`w-full px-4 py-3 rounded-2xl bg-paper border border-thread text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm leading-relaxed transition-all resize-y shadow-inner ${
                  isTranscribing ? 'opacity-60 bg-amber-50/30' : ''
                }`}
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
