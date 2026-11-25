import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Mic, MicOff, Volume2, Sparkles, Send, Check } from 'lucide-react';

interface VoiceAssistantMiniProps {
  onOpenFullAssistant?: () => void;
}

export const VoiceAssistantMini: React.FC<VoiceAssistantMiniProps> = ({
  onOpenFullAssistant
}) => {
  const { t, lang } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState(
    lang === 'ta'
      ? 'வணக்கம்! பாலாறு பற்றிய தகவல்களை கேட்க என்ன உதவ வேண்டும்?'
      : 'Hello! How can I assist you with Palar Basin data?'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Quick chips matching common queries
  const quickChips = lang === 'ta' 
    ? [
        { label: 'ராணிப்பேட்டை நீர் நிலை?', reply: 'ராணிப்பேட்டை பகுதியில் நிலத்தடி நீர் மட்டம் 14.8 mbgl ஆக உள்ளது. Cr⁶⁺ அயனி அளவு 0.082 ppm ஆக உயர்ந்துள்ளது. எச்சரிக்கை விடுக்கப்பட்டுள்ளது.' },
        { label: 'இன்றைய மழை அளவு?', reply: 'பாலாறு வடிநிலத்தில் கடந்த 24 மணி நேரத்தில் சராசரியாக 682 மி.மீ மழை பதிவாகியுள்ளது, இது பருவமழை இயல்பை விட 12% அதிகம்.' },
        { label: 'புகார் செய்வது எப்படி?', reply: 'கீழே உள்ள "உங்கள் கருத்து" அல்லது இடது மெனுவில் "மக்கள் புகார்" பிரிவை கிளிக் செய்து எளிதாகப் பதிவு செய்யலாம்.' }
      ]
    : [
        { label: 'Ranipet water status?', reply: 'Ranipet groundwater table is at 14.8 mbgl. Total chromium is elevated at 0.082 ppm. Immediate triage in progress.' },
        { label: 'Today rainfall?', reply: 'Palar basin recorded 682 mm cumulative rainfall, +12% above seasonal normal.' },
        { label: 'How to report issue?', reply: 'Click the "Your Voice" card or the "Community Reports" sidebar menu to submit a geotagged observation.' }
      ];

  // Sync default greeting when language changes
  useEffect(() => {
    setResponseText(
      lang === 'ta'
        ? 'வணக்கம்! பாலாறு பற்றிய தகவல்களை கேட்க என்ன உதவ வேண்டும்?'
        : 'Hello! How can I assist you with Palar Basin data?'
    );
  }, [lang]);

  // Initialize Web Speech API for voice recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        handleQuery(spoken);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleQuery = (query: string) => {
    const q = query.toLowerCase();
    let reply = '';
    if (q.includes('ராணிப்பேட்டை') || q.includes('ranipet')) {
      reply = quickChips[0].reply;
    } else if (q.includes('மழை') || q.includes('rain')) {
      reply = quickChips[1].reply;
    } else if (q.includes('புகார்') || q.includes('report') || q.includes('problem')) {
      reply = quickChips[2].reply;
    } else {
      reply = lang === 'ta'
        ? `"${query}" பற்றிய தகவல் சேகரிக்கப்பட்டது. பாலாறு வடிநிலத்தில் 7 கண்காணிப்பு நிலையங்கள் நேரலையில் உள்ளன.`
        : `Information retrieved for "${query}". 7 monitoring stations are actively transmitting telemetry.`;
    }

    setResponseText(reply);
    speakText(reply);
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        // Fallback simulation if microphone not granted
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const sample = lang === 'ta' ? 'ராணிப்பேட்டை நீர் நிலை?' : 'Ranipet water status?';
          setTranscript(sample);
          handleQuery(sample);
        }, 1800);
      }
    }
  };

  return (
    <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-3.5 shadow-xl flex flex-col justify-between h-[210px] relative overflow-hidden group">
      
      {/* Header matching blueprint */}
      <div className="flex items-center justify-between z-10 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
            <Mic className="w-3 h-3 text-emerald-400" />
          </div>
          <h4 className="text-xs font-bold text-white tracking-wide">
            {t('card_assistant_title')}
          </h4>
        </div>

        <button
          onClick={onOpenFullAssistant}
          className="text-[10.5px] text-stone-300 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1"
        >
          <span>{lang === 'ta' ? 'விரிவாக்கு →' : 'Expand →'}</span>
        </button>
      </div>

      {/* Main Avatar & Speech Bubble Row */}
      <div className="flex items-start gap-3 my-1.5 z-10">
        
        {/* 3D Friendly Robot Avatar matching blueprint screenshot */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#092b1e] to-[#041a11] border border-emerald-400/30 flex items-center justify-center shadow-lg shrink-0">
          {/* Robot Head Graphic */}
          <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
            {/* Robot Head Container */}
            <rect x="8" y="10" width="32" height="26" rx="8" fill="#f8fafc" stroke="#10b981" strokeWidth="1.5" />
            {/* Blue Screen Visor */}
            <rect x="12" y="14" width="24" height="14" rx="4" fill="#031d14" />
            {/* Glowing Eyes */}
            <circle cx="18" cy="21" r="2.5" fill="#38bdf8" />
            <circle cx="30" cy="21" r="2.5" fill="#38bdf8" />
            {/* Antenna */}
            <line x1="24" y1="10" x2="24" y2="4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="4" r="2" fill="#34d399" />
            {/* Emerald Leaf Chest Emblem */}
            <path d="M24 38 Q28 35 27 41 Q24 43 24 38 Z" fill="#10b981" />
          </svg>
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
          )}
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 min-w-0 bg-[#03150d] border border-white/[0.08] rounded-2xl p-2.5 shadow-inner">
          <p className="text-[11px] text-stone-200 leading-snug line-clamp-3">
            {isListening ? (
              <span className="text-emerald-300 animate-pulse font-mono flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-emerald-400 animate-bounce" />
                {t('card_assistant_listening')}
              </span>
            ) : (
              responseText
            )}
          </p>
        </div>

      </div>

      {/* Bottom Audio Waveform & Mic Button Row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] z-10">
        
        {/* Animated Audio Waveform Bars */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 border border-white/[0.04] h-7">
          {[4, 12, 18, 9, 15, 6, 14, 8, 16, 5].map((h, i) => (
            <span 
              key={i} 
              className={`w-1 rounded-full transition-all duration-150 ${
                isSpeaking || isListening ? 'bg-cyan-400' : 'bg-emerald-500/40'
              }`}
              style={{
                height: isSpeaking || isListening ? `${Math.max(4, (h * (i % 2 === 0 ? 1.4 : 0.8)))}px` : '4px'
              }}
            />
          ))}
        </div>

        {/* Quick query chips */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-[170px] scrollbar-none">
          {quickChips.slice(0, 1).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(chip.label);
                setResponseText(chip.reply);
                speakText(chip.reply);
              }}
              className="px-2 py-1 bg-white/[0.04] hover:bg-emerald-600/30 text-stone-300 hover:text-white rounded-md text-[10px] truncate max-w-[160px] border border-white/[0.06]"
              title={chip.label}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Luminous Green Microphone Button matching reference image */}
        <button
          onClick={toggleMic}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-red-500/50 scale-105'
              : 'bg-[#10b981] hover:bg-[#059669] text-[#041a11] hover:scale-105 shadow-emerald-500/30'
          }`}
          title={isListening ? "Stop listening" : "Click to speak in Tamil / English"}
        >
          {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-[#041a11]" />}
        </button>

      </div>

    </div>
  );
};
