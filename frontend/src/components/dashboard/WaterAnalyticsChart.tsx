import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, Activity } from 'lucide-react';

interface DataPoint {
  label: string;
  rain: number;
  gw: number;
  wq: number;
}

export const WaterAnalyticsChart: React.FC = () => {
  const { t, lang } = useLanguage();
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | '1y'>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Time series matching the reference chart
  const datasets: Record<'7d' | '30d' | '1y', DataPoint[]> = {
    '7d': [
      { label: lang === 'ta' ? 'திங்கள்' : 'Mon', rain: 420, gw: 310, wq: 180 },
      { label: lang === 'ta' ? 'செவ்வாய்' : 'Tue', rain: 460, gw: 330, wq: 190 },
      { label: lang === 'ta' ? 'புதன்' : 'Wed', rain: 610, gw: 390, wq: 240 },
      { label: lang === 'ta' ? 'வியாழன்' : 'Thu', rain: 580, gw: 410, wq: 280 },
      { label: lang === 'ta' ? 'வெள்ளி' : 'Fri', rain: 520, gw: 430, wq: 320 },
      { label: lang === 'ta' ? 'சனி' : 'Sat', rain: 490, gw: 420, wq: 340 },
      { label: lang === 'ta' ? 'ஞாயிறு' : 'Sun', rain: 510, gw: 440, wq: 350 },
    ],
    '30d': [
      { label: lang === 'ta' ? 'மே 01' : 'May 01', rain: 430, gw: 290, wq: 190 },
      { label: lang === 'ta' ? 'மே 08' : 'May 08', rain: 460, gw: 320, wq: 210 },
      { label: lang === 'ta' ? 'மே 15' : 'May 15', rain: 682, gw: 480, wq: 290 },
      { label: lang === 'ta' ? 'மே 22' : 'May 22', rain: 530, gw: 420, wq: 380 },
      { label: lang === 'ta' ? 'மே 30' : 'May 30', rain: 640, gw: 450, wq: 360 },
    ],
    '1y': [
      { label: lang === 'ta' ? 'ஜன' : 'Jan', rain: 120, gw: 210, wq: 150 },
      { label: lang === 'ta' ? 'மார்' : 'Mar', rain: 180, gw: 240, wq: 170 },
      { label: lang === 'ta' ? 'மே' : 'May', rain: 310, gw: 320, wq: 210 },
      { label: lang === 'ta' ? 'ஜூலை' : 'Jul', rain: 490, gw: 380, wq: 260 },
      { label: lang === 'ta' ? 'செப்' : 'Sep', rain: 580, gw: 460, wq: 320 },
      { label: lang === 'ta' ? 'நவ' : 'Nov', rain: 740, gw: 520, wq: 410 },
    ]
  };

  const data = datasets[activeRange];
  const maxVal = 750;
  const svgWidth = 460;
  const svgHeight = 170;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;

  const getX = (index: number) => {
    const availableWidth = svgWidth - paddingLeft - paddingRight;
    return paddingLeft + (index / (data.length - 1)) * availableWidth;
  };

  const getY = (val: number) => {
    const availableHeight = svgHeight - paddingTop - paddingBottom;
    return svgHeight - paddingBottom - (val / maxVal) * availableHeight;
  };

  // Build SVG smooth path strings using Catmull-Rom or cubic spline
  const createSmoothPath = (key: 'rain' | 'gw' | 'wq') => {
    if (data.length < 2) return '';
    let d = `M ${getX(0)} ${getY(data[0][key])}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(data[i][key]);
      const x1 = getX(i + 1);
      const y1 = getY(data[i + 1][key]);
      const mx = (x0 + x1) / 2;
      d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  };

  const rainPath = createSmoothPath('rain');
  const gwPath = createSmoothPath('gw');
  const wqPath = createSmoothPath('wq');

  return (
    <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4.5 shadow-xl flex flex-col justify-between">
      {/* Top Header: Title & Time Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            {t('chart_summary_title')}
          </h3>
        </div>

        {/* 7D, 30D, 1Y Filter Tabs matching reference image */}
        <div className="flex items-center bg-[#03140d] p-0.5 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setActiveRange('7d')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              activeRange === '7d'
                ? 'bg-[#10b981] text-[#041a11] shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            {t('chart_7d')}
          </button>
          <button
            onClick={() => setActiveRange('30d')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              activeRange === '30d'
                ? 'bg-[#10b981] text-[#041a11] shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            {t('chart_30d')}
          </button>
          <button
            onClick={() => setActiveRange('1y')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              activeRange === '1y'
                ? 'bg-[#10b981] text-[#041a11] shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            {t('chart_1y')}
          </button>
        </div>
      </div>

      {/* Legend Row matching reference image */}
      <div className="flex items-center justify-center gap-5 text-xs text-stone-300 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>{t('legend_rain')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>{t('legend_gw')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>{t('legend_wq')}</span>
        </div>
      </div>

      {/* Multi-line SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Horizontal Grid lines and Y-axis labels */}
          {[750, 500, 250, 0].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={svgWidth - paddingRight} 
                  y2={y} 
                  stroke="rgba(255, 255, 255, 0.08)" 
                  strokeWidth="1" 
                  strokeDasharray="3 3"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 3.5} 
                  textAnchor="end" 
                  className="text-[9px] fill-stone-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area gradients for subtle glow underneath curves */}
          <defs>
            <linearGradient id="rainGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gwGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Paths */}
          <path d={rainPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
          <path d={gwPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <path d={wqPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

          {/* Data Points and X-Axis Labels */}
          {data.map((pt, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIndex === idx;

            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical indicator line on hover */}
                {isHovered && (
                  <line 
                    x1={x} 
                    y1={paddingTop} 
                    x2={x} 
                    y2={svgHeight - paddingBottom} 
                    stroke="rgba(255, 255, 255, 0.3)" 
                    strokeWidth="1" 
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point: Rainfall (Cyan) */}
                <circle 
                  cx={x} 
                  cy={getY(pt.rain)} 
                  r={isHovered ? 5 : 3.5} 
                  fill="#06b6d4" 
                  stroke="#041a11" 
                  strokeWidth="2" 
                  className="transition-all"
                />

                {/* Point: Groundwater (Green) */}
                <circle 
                  cx={x} 
                  cy={getY(pt.gw)} 
                  r={isHovered ? 5 : 3.5} 
                  fill="#10b981" 
                  stroke="#041a11" 
                  strokeWidth="2" 
                  className="transition-all"
                />

                {/* Point: Water Quality (Amber) */}
                <circle 
                  cx={x} 
                  cy={getY(pt.wq)} 
                  r={isHovered ? 5 : 3.5} 
                  fill="#f59e0b" 
                  stroke="#041a11" 
                  strokeWidth="2" 
                  className="transition-all"
                />

                {/* X Axis Date Label */}
                <text 
                  x={x} 
                  y={svgHeight - 6} 
                  textAnchor="middle" 
                  className={`text-[9.5px] font-medium font-sans ${isHovered ? 'fill-emerald-300 font-bold' : 'fill-stone-300'}`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#021008]/95 border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur-md pointer-events-none flex items-center gap-3 text-[11px] font-mono animate-in fade-in"
          >
            <span className="text-white font-bold">{data[hoveredIndex].label}</span>
            <span className="text-cyan-400">Rain: {data[hoveredIndex].rain}mm</span>
            <span className="text-emerald-400">GW: {data[hoveredIndex].gw}%</span>
            <span className="text-amber-400">WQ: {data[hoveredIndex].wq}</span>
          </div>
        )}
      </div>
    </div>
  );
};
