import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { X, Droplet, ArrowRight, ShieldCheck, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || "analyst@palarguard.ai", "Environmental Analyst");
    onSuccess();
    onClose();
  };

  const handleQuickDemoLogin = (demoEmail: string, demoRole: UserRole) => {
    login(demoEmail, demoRole);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#092218] border border-emerald-500/30 rounded-2xl p-6 shadow-forest-lg space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600 flex items-center justify-center border border-emerald-400/30 shadow-emerald-glow">
            <Droplet className="w-5 h-5 text-white fill-white" />
          </div>
          <h3 className="text-lg font-extrabold text-white">PALAR GUARD AI</h3>
          <p className="text-xs text-stone-300">
            {isRegister ? "Create a platform account" : "Sign in to access platform console"}
          </p>
        </div>

        {/* Quick Demo Fill Buttons for Reviewers & Judges */}
        <div className="p-3 bg-[#05160e] rounded-xl border border-white/[0.06] space-y-2">
          <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Key className="w-3 h-3" />
            <span>Quick-Select Demo Role (One-Click)</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
            <button
              onClick={() => handleQuickDemoLogin("admin@palarguard.ai", "Administrator")}
              className="px-2.5 py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-left"
            >
              👑 Administrator (Kayalvizhi J)
            </button>
            <button
              onClick={() => handleQuickDemoLogin("analyst@palarguard.ai", "Environmental Analyst")}
              className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-left"
            >
              🔬 Analyst (Harini S)
            </button>
            <button
              onClick={() => handleQuickDemoLogin("investigator@palarguard.ai", "Field Investigator")}
              className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-left"
            >
              📋 Investigator (Aarthi L)
            </button>
            <button
              onClick={() => handleQuickDemoLogin("citizen@palarguard.ai", "Community Reporter")}
              className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-left"
            >
              🌾 Community Reporter
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-stone-400 mb-1 font-mono text-[11px]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. analyst@palarguard.ai"
              className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1 font-mono text-[11px]">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-forest-sm transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{isRegister ? "Create Account" : "Sign In to Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10 text-[11px] text-stone-400">
          <span>{isRegister ? "Already registered?" : "New to Palar Guard?"} </span>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-emerald-400 hover:underline font-semibold"
          >
            {isRegister ? "Sign In" : "Register Account"}
          </button>
        </div>
      </div>
    </div>
  );
};
