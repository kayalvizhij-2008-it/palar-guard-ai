import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Droplet, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

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

  if (!isOpen) return null;

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
      <div className="w-full max-w-md bg-[#092218] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-5 relative">
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
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isRegister ? L('Create Account', 'கணக்கை உருவாக்கு') : L('Sign In', 'உள்நுழைக')}</span>
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

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
