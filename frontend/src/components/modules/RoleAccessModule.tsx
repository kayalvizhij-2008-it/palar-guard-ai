import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface RoleAccessModuleProps {
  onOpenAuth?: () => void;
}

export const RoleAccessModule: React.FC<RoleAccessModuleProps> = ({ onOpenAuth }) => {
  const { role, user, isAuthenticated, logout } = useAuth();
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const permissionsMatrix = [
    { permission: L('View Public Basin Explorer & Groundwater Data', 'பொது வடிநில வரைபடம் & நீர்மட்டத் தரவு'), admin: true, analyst: true, investigator: true, researcher: true, community: true, viewer: true },
    { permission: L('Submit Community Water Reports', 'மக்கள் நீர் புகார் சமர்ப்பித்தல்'), admin: true, analyst: true, investigator: true, researcher: true, community: true, viewer: true },
    { permission: L('Upload & Analyse Documents (Owned Scope)', 'ஆவண நுண்ணறிவு (சொந்த ஆவணங்கள்)'), admin: true, analyst: true, investigator: true, researcher: true, community: true, viewer: true },
    { permission: L('Moderate Community Reports & Triage Anomalies', 'புகார் சரிபார்ப்பு & அபாய ஆய்வு'), admin: true, analyst: true, investigator: false, researcher: false, community: false, viewer: false },
    { permission: L('View & Update Assigned Field Investigations', 'கள ஆய்வுப் பணிகள்'), admin: true, analyst: true, investigator: true, researcher: false, community: false, viewer: false },
    { permission: L('Manage User Roles & View Security Audit Logs', 'பயனர் உரிமை & தணிக்கை பதிவேடு'), admin: true, analyst: false, investigator: false, researcher: false, community: false, viewer: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl">
        <div>
          <h2 className="text-xl font-semibold text-[#fcfbf7]">
            {L('Role-Based Access Control (Server-Enforced)', 'சேவையகப் பாதுகாப்பு & அணுகல் உரிமைகள்')}
          </h2>
          <p className="text-xs text-[#a4b2a9]">
            {L(
              'Roles are verified via signed JWT tokens on the FastAPI backend. Frontend views cannot elevate server privileges.',
              'உரிமைகள் FastAPI சேவையகத்தில் JWT சான்று மூலம் சரிபார்க்கப்படுகின்றன.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-xs font-mono">
            {isAuthenticated ? `${user?.full_name} (${role})` : L('Anonymous (Viewer)', 'உள்நுழையாத நிலை (Viewer)')}
          </span>
          {isAuthenticated ? (
            <button type="button" onClick={logout} className="px-3 py-1.5 rounded-lg border border-white/15 text-xs text-stone-200">
              {L('Sign Out', 'வெளியேறு')}
            </button>
          ) : (
            onOpenAuth && (
              <button type="button" onClick={onOpenAuth} className="px-3 py-1.5 rounded-lg bg-[#10b981] text-[#041a11] text-xs font-semibold">
                {L('Sign In', 'உள்நுழைக')}
              </button>
            )
          )}
        </div>
      </div>

      <div className="p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-white/[0.08] pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{L('Backend Endpoint Authorization Matrix', 'சேவையக அனுமதி அட்டவணை')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-stone-400 border-b border-white/10 font-mono text-[11px]">
                <th className="py-2.5 pr-4">{L('Capability', 'திறன்')}</th>
                <th className="py-2.5 text-center px-2">Admin</th>
                <th className="py-2.5 text-center px-2">Analyst</th>
                <th className="py-2.5 text-center px-2">Investigator</th>
                <th className="py-2.5 text-center px-2">Researcher</th>
                <th className="py-2.5 text-center px-2">Community</th>
                <th className="py-2.5 text-center px-2">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {permissionsMatrix.map((p) => (
                <tr key={p.permission}>
                  <td className="py-2.5 pr-4 font-medium text-white">{p.permission}</td>
                  {[p.admin, p.analyst, p.investigator, p.researcher, p.community, p.viewer].map((ok, i) => (
                    <td key={i} className="py-2.5 text-center">
                      {ok ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-stone-600 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
