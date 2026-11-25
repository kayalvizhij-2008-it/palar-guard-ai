import React from 'react';
import { Droplet, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#04100b] border-t border-white/[0.08] text-stone-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand & Purpose */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-base text-ivory tracking-tight">PALAR GUARD AI</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            "See the Risk. Predict the Change. Protect Every Drop."
          </p>
          <p className="text-[11px] text-stone-400">
            AI-powered environmental decision-support platform for hydrological and water-risk resilience across the Palar River Basin, Tamil Nadu.
          </p>
        </div>

        {/* Project Team (CIT) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Project Team</h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-300">KJ</div>
              <span className="font-medium text-white">Kayalvizhi J</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">Lead</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#12281e] border border-white/20 flex items-center justify-center text-[10px] font-bold text-stone-300">HS</div>
              <span className="text-stone-300">Harini S</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#12281e] border border-white/20 flex items-center justify-center text-[10px] font-bold text-stone-300">AL</div>
              <span className="text-stone-300">Aarthi L</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-300 font-medium pt-2 border-t border-white/[0.06]">
            Chennai Institute of Technology
          </p>
        </div>

        {/* Reference Data Sources */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Reference Sources</h4>
          <ul className="space-y-1 text-xs">
            <li>
              <a href="https://cgwb.gov.in/en/ground-water-level-monitoring" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 flex items-center gap-1 transition-colors">
                <span>CGWB Palar Aquifer Master</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            </li>
            <li>
              <a href="https://indiawris.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 flex items-center gap-1 transition-colors">
                <span>India-WRIS Water Portal</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            </li>
            <li>
              <a href="https://nwdp.nwic.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 flex items-center gap-1 transition-colors">
                <span>IMD NWIC Rainfall Records</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            </li>
            <li>
              <a href="https://tnpcb.gov.in/water-quality.php" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 flex items-center gap-1 transition-colors">
                <span>TNPCB & CPCB River Stretches</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            </li>
          </ul>
        </div>

        {/* Data Methodology */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Data Methodology</h4>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Basin benchmarks follow CGWB, IMD, CPCB, and BIS 10500 frameworks. Where live agency telemetry is unavailable, interactive views use an illustrative, internally consistent demonstration dataset rather than real-time sensor measurements.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#092015] border border-emerald-500/20 text-[10px] text-emerald-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Explainable MCDA Scoring</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-3">
        <div>
          &copy; {new Date().getFullYear()} PALAR GUARD AI. All rights reserved. Built for environmental resilience.
        </div>
        <div className="flex items-center gap-4">
          <span>Palar River Basin: 12.8° N, 79.1° E</span>
          <span>•</span>
          <a href="https://github.com/kayalvizhij-2008-it/palar-guard-ai" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
};
