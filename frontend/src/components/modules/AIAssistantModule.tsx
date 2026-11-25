import React, { useEffect, useState } from 'react';
import { DataBadge } from '../common/DataBadge';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import {
  Bot,
  Send,
  User,
  BookOpen,
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

interface ChatMessage {
  id?: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  confidence?: string;
  provenance?: 'VERIFIED_PUBLIC' | 'MODEL_PREDICTION' | 'HISTORICAL_REPORT';
  timestamp: string;
}

export const AIAssistantModule: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [inputQuery, setInputQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechIdx, setActiveSpeechIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const buildWelcomeMessage = (curLang: 'en' | 'ta'): ChatMessage => ({
    id: 'welcome',
    sender: 'assistant',
    text:
      curLang === 'ta'
        ? 'வணக்கம்! நான் **PALAR AI சுற்றுச்சூழல் உதவியாளர்**. சரிபார்க்கப்பட்ட CGWB நிலத்தடி நீர் பதிவுகள், TNPCB நீர் தர ஆய்வுகள் மற்றும் புள்ளிவிவர மாறுபாடுகளை மட்டுமே அடிப்படையாகக் கொண்டு பதிலளிப்பேன். தரவு இல்லாத இடங்களில் நிச்சயமற்ற தன்மையையும் தெளிவாகக் குறிப்பிடுவேன்.'
        : 'Hello! I am **PALAR AI**, your retrieval-grounded environmental intelligence companion. Responses cite verified CGWB/CPCB/TNPCB monitoring records in the database and state explicit uncertainty whenever laboratory verification is missing.',
    sources:
      curLang === 'ta'
        ? ['CGWB பாலாறு நீரடுக்குத் திட்டம்', 'TNPCB / CPCB கண்காணிப்பு', 'MCDA இடர் மதிப்பீடு']
        : ['CGWB Palar Aquifer Plan', 'CPCB / TNPCB Water Monitoring', 'MCDA Priority Engine'],
    confidence: curLang === 'ta' ? 'அரசு தரவுத்தள ஆதாரம்' : 'Database-Grounded Citations',
    provenance: 'VERIFIED_PUBLIC',
    timestamp: '10:00',
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage(lang)]);

  // Keep the untouched welcome card synchronized when toggling English <-> Tamil
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 'welcome' ? buildWelcomeMessage(lang) : m))
    );
  }, [lang]);

  const quickPrompts =
    lang === 'ta'
      ? [
          'பாலாறு நிலத்தடி நீர் நிலை எப்படி உள்ளது?',
          'ராணிப்பேட்டை தொழிற்பேட்டை மாசு நிலவரம்?',
          'எங்கு தடுப்பணை அமைப்பது சிறந்தது?',
          'காஞ்சிபுரம் குடிநீர் தரம் பாதுகாப்பானதா?',
        ]
      : [
          'What is the groundwater trend in Ranipet?',
          'Which pollution anomalies are currently open?',
          'Explain the risk score for Ambur Tannery Cluster',
          'Where is recharge suitability highest?',
        ];

  const renderFormattedText = (rawText: string) => {
    const parts = rawText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="text-violet-200 font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const handleSpeakText = (text: string, idx: number) => {
    if (isSpeaking && activeSpeechIdx === idx) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechIdx(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const plainText = text.replace(/\*\*/g, '').replace(/###/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveSpeechIdx(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveSpeechIdx(null);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setActiveSpeechIdx(idx);
    }
  };

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    setErrorMsg(null);

    const userMsg: ChatMessage = {
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await apiService.queryAssistant(queryText);
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        provenance: result.provenance.includes('MODEL')
          ? 'MODEL_PREDICTION'
          : result.provenance.includes('HISTORICAL')
          ? 'HISTORICAL_REPORT'
          : 'VERIFIED_PUBLIC',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          L(
            'Unable to reach PALAR AI backend endpoint. Please retry.',
            'PALAR AI சேவையகத்தைத் தொடர்புகொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
          )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const latestAssistant = [...messages].reverse().find((m) => m.sender === 'assistant');

  return (
    <div className="space-y-6">
      {/* Violet & Emerald Conversational Companion Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#131122] via-[#17142b] to-[#0d1e1c] border border-violet-500/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-violet-300">
              <Sparkles className="w-3.5 h-3.5" />
              {L('CONVERSATIONAL INTELLIGENCE · VIOLET/EMERALD', 'உரையாடல் நுண்ணறிவு')}
            </span>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <h2 className="text-xl font-bold text-[#fcfbf7]">
            {L('PALAR AI Environmental Assistant', 'PALAR AI சுற்றுச்சூழல் உதவியாளர்')}
          </h2>
          <p className="text-xs text-slate-300">
            {L(
              'Evidence-backed queries with inline citation cards and explicit uncertainty statements.',
              'தரவு ஆதாரங்களுடனும் தெளிவான நிச்சயமற்ற குறிப்புகளுடனும் பதிலளிக்கும் உதவியாளர்.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex rounded-xl bg-[#090814] border border-violet-500/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg ${lang === 'en' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-300'}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('ta')}
              className={`px-2.5 py-1 rounded-lg ${lang === 'ta' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-300'}`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Split Workspace: Main Chat Stream + Side Evidence & Uncertainty Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-[#10101c]/95 border border-violet-500/20 rounded-2xl overflow-hidden flex flex-col h-[560px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-violet-950 border border-violet-500/35 flex items-center justify-center text-violet-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-[#090913] text-slate-200 border border-violet-500/20 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{renderFormattedText(msg.text)}</div>

                  {msg.sender === 'assistant' && (
                    <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => handleSpeakText(msg.text, idx)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 transition-colors ${
                          isSpeaking && activeSpeechIdx === idx
                            ? 'bg-violet-500 text-white font-semibold'
                            : 'bg-white/5 hover:bg-white/10 text-violet-300'
                        }`}
                      >
                        {isSpeaking && activeSpeechIdx === idx ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>{L('Stop Audio', 'நிறுத்து')}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>{L('Listen', 'கேட்க')}</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-200 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-violet-950 border border-violet-500/35 flex items-center justify-center text-violet-300 shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-[#090913] border border-violet-500/20 text-xs font-mono text-violet-200">
                  {L('Querying grounded Palar monitoring records…', 'பாலாறு தரவுத்தளத்திலிருந்து தகவல்கள் பெறப்படுகின்றன…')}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 bg-[#0b0b16] border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-mono shrink-0">{L('Prompts:', 'கேள்விகள்:')}</span>
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-violet-600/25 text-slate-300 hover:text-violet-200 border border-white/10 whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="p-3 bg-[#090913] border-t border-white/[0.08] flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputQuery)}
              placeholder={L(
                'Ask about Palar Basin groundwater, water quality, or anomalies…',
                'பாலாறு நிலத்தடி நீர், நீர் தரம் அல்லது மாறுபாடுகள் பற்றி கேட்கவும்…'
              )}
              className="flex-1 px-4 py-2.5 bg-[#11111e] border border-violet-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
            />
            <button
              type="button"
              onClick={() => handleSend(inputQuery)}
              aria-label={L('Send Query', 'அனுப்புக')}
              className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Panel: Citations & Uncertainty Statement */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#10101c]/95 border border-violet-500/20 p-5 space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{L('Active Evidence Citations', 'சான்றாதாரப் பட்டியல்')}</span>
            </div>
            {latestAssistant?.provenance && <DataBadge provenance={latestAssistant.provenance} />}
            <div className="space-y-2 pt-1">
              {(latestAssistant?.sources || []).map((src) => (
                <div key={src} className="p-2.5 rounded-xl bg-[#090913] border border-white/[0.06] text-xs text-slate-200 font-mono">
                  {src}
                </div>
              ))}
            </div>
            {latestAssistant?.confidence && (
              <div className="text-[11px] text-emerald-300 font-mono pt-1">
                {L('Grounding:', 'நம்பகத்தன்மை:')} {latestAssistant.confidence}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#13121b]/95 border border-amber-500/25 p-5 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
              {L('Explicit Uncertainty Policy', 'நிச்சயமற்ற தன்மை கொள்கை')}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {L(
                'PALAR AI only retrieves figures stored in monitoring and historical survey tables. Statistical outliers indicate investigation priorities—not verified pollution rulings without laboratory confirmation.',
                'PALAR AI தரவுத்தளத்தில் உள்ள பதிவுகளை மட்டுமே அடிப்படையாகக் கொள்கிறது. புள்ளிவிவர மாறுபாடுகள் ஆய்வகச் சரிபார்ப்பு இல்லாமல் இறுதி முடிவாகக் கருதப்படாது.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
