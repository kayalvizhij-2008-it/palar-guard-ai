import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Droplet, ArrowRight, ShieldAlert, Loader2, Copy, Check, KeyRound } from 'lucide-react';

const DEMO_ACCOUNT_EMAIL = 'demo@palarguard.ai';
const DEMO_ACCOUNT_PASSWORD = 'PalarDemo@2026';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithCredentials, registerAccount } = useAuth();
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [publicRole, setPublicRole] = useState<'Community Reporter' | 'Viewer'>('Community Reporter');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const [slowWait, setSlowWait] = useState(false);

  // Always reset to Sign In mode when reopened so users aren't stuck in Register view
  useEffect(() => {
    if (isOpen) {
      setIsRegister(false);
      setErrorMsg(null);
      setSlowWait(false);
    }
  }, [isOpen]);

  // Show a gentle cold-start status hint if authentication takes > 4s
  useEffect(() => {
    if (!submitting && !demoSubmitting) {
      setSlowWait(false);
      return;
    }
    const t = setTimeout(() => setSlowWait(true), 4000);
    return () => clearTimeout(t);
  }, [submitting, demoSubmitting]);

  if (!isOpen) return null;

  const handleCopy = async (value: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Fallback copy if clipboard permission blocked
      if (field === 'email') setEmail(value);
      else setPassword(value);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMsg(null);
    setEmail(DEMO_ACCOUNT_EMAIL);
    setPassword(DEMO_ACCOUNT_PASSWORD);
    setDemoSubmitting(true);
    try {
      await loginWithCredentials(DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_PASSWORD);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          L(
            'Demo account authentication failed. Check backend service availability.',
            'டெமோ கணக்கு உள்நுழைவு தோல்வியடைந்தது. சேவையக இணைப்பைச் சரிபார்க்கவும்.'
          )
      );
    } finally {
      setDemoSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        if (!fullName.trim() || fullName.trim().length < 2) {
          throw new Error(L('Please enter your full name (at least 2 characters).', 'உங்கள் முழுப் பெயரை உள்ளிடவும்.'));
        }
        if (password.length < 8) {
          throw new Error(L('Password must be at least 8 characters.', 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.'));
        }
        await registerAccount(fullName.trim(), email.trim(), password, publicRole);
      } else {
        await loginWithCredentials(email.trim(), password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || L('Authentication failed. Check server connection and credentials.', 'உள்நுழைவு தோல்வியடைந்தது.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="w-full max-w-md max-h-[94vh] overflow-y-auto bg-[#092218] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label={L('Close sign in dialog', 'உள்நுழைவு சாளரத்தை மூடு')}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center border border-emerald-400/30">
            <Droplet className="w-5 h-5 text-white fill-white" />
          </div>
          <h3 id="auth-modal-title" className="text-lg font-semibold text-white">
            PALAR GUARD AI
          </h3>
          <p className="text-xs text-stone-300">
            {isRegister
              ? L('Register a verified Community Reporter or Viewer account', 'மக்கள் புகார் அல்லது பார்வையாளர் கணக்கை உருவாக்கவும்')
              : L('Sign in with your backend-verified credentials', 'சரிபார்க்கப்பட்ட கணக்குடன் உள்நுழையவும்')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {slowWait && !errorMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
            <span>
              {L(
                'Verifying credentials with backend service (waking server if idle)...',
                'சேவையகத்துடன் சான்று சரிபார்க்கப்படுகிறது...'
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <>
              <div>
                <label htmlFor="auth-fullname" className="block text-stone-300 mb-1 font-mono text-[11px]">
                  {L('Full Name', 'முழுப் பெயர்')}
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={L('e.g. K. Murugan', 'எ.கா. க. முருகன்')}
                  className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="auth-role" className="block text-stone-300 mb-1 font-mono text-[11px]">
                  {L('Public Account Role', 'பொது கணக்கு வகை')}
                </label>
                <select
                  id="auth-role"
                  value={publicRole}
                  onChange={(e) => setPublicRole(e.target.value as 'Community Reporter' | 'Viewer')}
                  className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Community Reporter">Community Reporter</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <p className="mt-1 text-[10px] text-stone-400">
                  {L(
                    'Privileged roles (Analyst, Investigator, Administrator) require administrator assignment.',
                    'ஆய்வாளர், அதிகாரி மற்றும் நிர்வாகி உரிமைகள் நிர்வாகியின் அனுமதியால் மட்டுமே வழங்கப்படும்.'
                  )}
                </p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-stone-300 mb-1 font-mono text-[11px]">
              {L('Email Address', 'மின்னஞ்சல் முகவரி')}
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.org"
              className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-stone-300 mb-1 font-mono text-[11px]">
              {L('Password', 'கடவுச்சொல்')}
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={isRegister ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || demoSubmitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isRegister ? L('Create Account', 'கணக்கை உருவாக்கு') : L('Sign In', 'உள்நுழைக')}</span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {!isRegister && (
          <>
            <div className="relative flex items-center py-0.5">
              <div className="flex-grow border-t border-white/10" />
              <span className="mx-3 shrink-0 text-[10px] font-mono uppercase tracking-[0.22em] text-[#d9c27a]">
                {L('OR', 'அல்லது')}
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            <div className="rounded-xl border border-[#d9c27a]/35 bg-[#061811]/90 p-3.5 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d9c27a]">
                  <KeyRound className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>{L('Try Demo Account', 'டெமோ கணக்கை முயற்சிக்கவும்')}</span>
                </div>
                <p className="text-[11px] text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Want to explore PALAR GUARD AI without entering your personal credentials? Use our demo account for instant access.',
                    'உங்கள் தனிப்பட்ட விவரங்களை உள்ளிடாமல் PALAR GUARD AI தளத்தை உடனடியாகப் பார்க்க எங்கள் டெமோ கணக்கைப் பயன்படுத்தவும்.'
                  )}
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-[#04100b] border border-white/10 px-2.5 py-1.5">
                  <div className="min-w-0 truncate text-[#fcfbf7]">
                    <span className="text-[#85928a] mr-1.5">{L('Email:', 'மின்னஞ்சல்:')}</span>
                    <span>{DEMO_ACCOUNT_EMAIL}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEMO_ACCOUNT_EMAIL, 'email')}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-emerald-300 border border-emerald-500/25 transition-colors"
                  >
                    {copiedField === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'email' ? L('Copied', 'நகலெடுக்கப்பட்டது') : L('Copy Email', 'மின்னஞ்சலை நகலெடு')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-lg bg-[#04100b] border border-white/10 px-2.5 py-1.5">
                  <div className="min-w-0 truncate text-[#fcfbf7]">
                    <span className="text-[#85928a] mr-1.5">{L('Password:', 'கடவுச்சொல்:')}</span>
                    <span>{DEMO_ACCOUNT_PASSWORD}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEMO_ACCOUNT_PASSWORD, 'password')}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-[#d9c27a] border border-[#d9c27a]/30 transition-colors"
                  >
                    {copiedField === 'password' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'password' ? L('Copied', 'நகலெடுக்கப்பட்டது') : L('Copy Password', 'கடவுச்சொல்லை நகலெடு')}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting || demoSubmitting}
                onClick={handleDemoSignIn}
                className="w-full py-2 px-3 rounded-lg bg-[#d9c27a] hover:bg-[#e5d292] disabled:opacity-50 text-[#061811] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {demoSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{L('Sign In with Demo Account', 'டெமோ கணக்கில் உள்நுழையவும்')}</span>
                {!demoSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </>
        )}

        <div className="text-center pt-2 border-t border-white/10 text-[11px] text-stone-400">
          <span>{isRegister ? L('Already registered?', 'ஏற்கனவே கணக்கு உள்ளதா?') : L('New to Palar Guard?', 'புதிய பயனரா?')} </span>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
            }}
            className="text-emerald-400 hover:underline font-semibold"
          >
            {isRegister ? L('Sign In', 'உள்நுழைக') : L('Register Account', 'பதிவு செய்க')}
          </button>
        </div>
      </div>
    </div>
  );
};
