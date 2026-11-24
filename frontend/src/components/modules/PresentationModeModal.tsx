import React, { useState, useEffect, useCallback } from 'react';
import { PRESENTATION_WORKFLOW, PALAR_LOCATIONS } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { 
  Play, Pause, ChevronLeft, ChevronRight, X, ExternalLink, 
  Award, Shield, Droplets, Compass, Sparkles, CheckCircle2 
} from 'lucide-react';

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule: (moduleId: string) => void;
}

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
  onNavigateToModule,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(8);

  const step = PRESENTATION_WORKFLOW[currentStepIdx] || PRESENTATION_WORKFLOW[0];
  const totalSteps = PRESENTATION_WORKFLOW.length;
  const targetStation = step.highlightedLocationId 
    ? PALAR_LOCATIONS.find(l => l.id === step.highlightedLocationId) 
    : null;

  const handleNext = useCallback(() => {
    setCurrentStepIdx(prev => (prev < totalSteps - 1 ? prev + 1 : 0));
    setTimerSeconds(8);
  }, [totalSteps]);

  const handlePrev = useCallback(() => {
    setCurrentStepIdx(prev => (prev > 0 ? prev - 1 : totalSteps - 1));
    setTimerSeconds(8);
  }, [totalSteps]);

  // Keyboard navigation: Left/Right arrows, Space for pause/play, Esc for exit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Auto-play timer (advances step every 8 seconds when playing)
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setTimerSeconds(sec => {
        if (sec <= 1) {
          handleNext();
          return 8;
        }
        return sec - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, handleNext]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#061811] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#0a2319] border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-400/40 flex items-center justify-center">
              <Award className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  Jury Presentation Walkthrough
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
                  5–7 Min Pitch
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                Chennai Institute of Technology • Team: Kayalvizhi J, Harini S, Aarthi L
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-Play Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-[#0f3325] text-emerald-300 hover:bg-[#154432] border border-white/[0.08]'
              }`}
              title={isPlaying ? "Pause auto-advancing slides" : "Start 8s auto-advancing walkthrough"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Autoplay ({timerSeconds}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Autoplay</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close presentation modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 12-Step Progress Bar & Dots */}
        <div className="px-6 pt-4 pb-2 bg-[#081f15] border-b border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400 mb-2">
            <span>STAGE {currentStepIdx + 1} OF {totalSteps}</span>
            <span className="text-emerald-400">{Math.round(((currentStepIdx + 1) / totalSteps) * 100)}% Complete</span>
          </div>

          {/* Stepper Dots Track */}
          <div className="grid grid-cols-12 gap-1.5">
            {PRESENTATION_WORKFLOW.map((s, idx) => (
              <button
                key={s.stepIndex}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  setTimerSeconds(8);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'bg-emerald-400 ring-2 ring-emerald-400/50'
                    : idx < currentStepIdx
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={`Step ${s.stepIndex}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              {step.subtitle}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {step.title}
            </h2>
          </div>

          {/* Editorial Narration Text */}
          <div className="p-5 rounded-xl bg-[#092419] border border-white/[0.08] text-stone-200 text-sm sm:text-base leading-relaxed">
            {step.narration}
          </div>

          {/* Step Data Card & Station Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Key Verified Metric */}
            <div className="p-4 rounded-xl bg-[#05160f] border border-emerald-500/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-stone-400">{step.keyMetricLabel}</span>
                <DataBadge provenance={step.provenance} />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-sans text-emerald-400 tabular-nums">
                {step.keyMetricValue}
              </div>
            </div>

            {/* Context Station & Direct Module Launch */}
            <div className="p-4 rounded-xl bg-[#05160f] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-stone-400 mb-1">Target Monitoring Context</div>
                <div className="text-sm font-bold text-white">
                  {targetStation ? targetStation.name : "Catchment-Wide Basin Synthesis"}
                </div>
                {targetStation && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {targetStation.district} District • {targetStation.basin_zone} • {targetStation.cpcb_stretch_priority}
                  </p>
                )}
              </div>

              {/* Jump to Live Module Button */}
              <button
                onClick={() => {
                  onClose();
                  onNavigateToModule(step.targetModule);
                }}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-forest-sm"
              >
                <span>Jump to Live Module ({step.targetModule.replace('_', ' ')})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 bg-[#0a2319] border-t border-white/[0.08] flex items-center justify-between gap-4">
          <div className="text-[11px] font-mono text-stone-400 hidden sm:block">
            Shortcut: <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-emerald-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-emerald-300">→</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-emerald-300">Space</kbd> to pause, <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-emerald-300">Esc</kbd> to exit
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-4 py-2 rounded-xl bg-[#071a12] hover:bg-[#0c2e21] text-stone-300 hover:text-white text-xs font-semibold border border-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-forest-sm"
            >
              <span>{currentStepIdx === totalSteps - 1 ? "Finish Walkthrough" : "Next Step"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
