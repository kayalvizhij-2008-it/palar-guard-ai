import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DataBadge } from '../common/DataBadge';
import { UserCheck, Shield, Check, X, Users, ArrowRight } from 'lucide-react';

export const RoleAccessModule: React.FC = () => {
  const { role, switchRole, user } = useAuth();

  const allRoles: { name: UserRole; title: string; desc: string; userExample: string }[] = [
    { name: "Administrator", title: "Full Platform Admin", desc: "Unrestricted access to all data, dispatch, and user governance.", userExample: "Kayalvizhi J" },
    { name: "Environmental Analyst", title: "Scientific Analyst", desc: "Anomaly triage, MCDA tuning, and report generation.", userExample: "Harini S" },
    { name: "Field Investigator", title: "Ground Response Unit", desc: "Checklist execution, sample collection notes, and ground triage.", userExample: "Aarthi L" },
    { name: "Researcher", title: "Academic & Data Scientist", desc: "Model backtesting, raw data export, and hydrograph research.", userExample: "CIT Research Fellow" },
    { name: "Community Reporter", title: "Citizen Observer", desc: "Incident submission, local observations, and report tracking.", userExample: "Local Farmer / Resident" },
    { name: "Viewer", title: "Public Observer", desc: "Read-only access to public digital twin and executive summaries.", userExample: "General Public" },
  ];

  const permissionsMatrix = [
    { permission: "View Public Digital Twin & Basin Maps", admin: true, analyst: true, investigator: true, researcher: true, community: true, viewer: true },
    { permission: "Inspect Groundwater Hydrographs & Quality Matrix", admin: true, analyst: true, investigator: true, researcher: true, community: false, viewer: true },
    { permission: "Submit Community Incident Reports", admin: true, analyst: true, investigator: true, researcher: false, community: true, viewer: false },
    { permission: "Triage & Change Anomaly Alert Status", admin: true, analyst: true, investigator: false, researcher: false, community: false, viewer: false },
    { permission: "Dispatch & Resolve Field Investigations", admin: true, analyst: true, investigator: true, researcher: false, community: false, viewer: false },
    { permission: "Export Raw CSV Datasets & Print Dossiers", admin: true, analyst: true, investigator: false, researcher: true, community: false, viewer: false },
    { permission: "System Administration & Audit Logs", admin: true, analyst: false, investigator: false, researcher: false, community: false, viewer: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Role-Based Access Control (RBAC)</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Enforced backend permission levels across administrative, scientific, field investigation, and citizen roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-xs font-mono">
            Active Role: {role}
          </span>
        </div>
      </div>

      {/* Role Switcher Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allRoles.map((r, idx) => {
          const isActive = role === r.name;
          return (
            <div
              key={idx}
              onClick={() => switchRole(r.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2.5 ${
                isActive 
                  ? 'bg-[#0c2e21] border-emerald-500 shadow-forest-sm' 
                  : 'bg-[#092218] border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{r.name}</span>
                {isActive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-600 text-white font-bold">
                    CURRENT
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-emerald-300">{r.title}</div>
              <p className="text-xs text-stone-300 leading-relaxed">{r.desc}</p>
              <div className="pt-2 border-t border-white/[0.04] text-[10px] text-stone-400 font-mono">
                Representative: {r.userExample}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
        <div className="border-b border-white/[0.08] pb-3">
          <h3 className="text-sm font-bold text-white">Platform Permission Matrix</h3>
          <p className="text-[11px] text-stone-400">Strictly enforced at API gateway routers in FastAPI</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-stone-400 border-b border-white/10 font-mono text-[11px]">
                <th className="py-2.5">Feature / Capability</th>
                <th className="py-2.5 text-center">Admin</th>
                <th className="py-2.5 text-center">Analyst</th>
                <th className="py-2.5 text-center">Investigator</th>
                <th className="py-2.5 text-center">Researcher</th>
                <th className="py-2.5 text-center">Community</th>
                <th className="py-2.5 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
              {permissionsMatrix.map((p, pIdx) => (
                <tr key={pIdx} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 font-sans font-medium text-white">{p.permission}</td>
                  <td className="py-2.5 text-center">{p.admin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-stone-600 mx-auto" />}</td>
                  <td className="py-2.5 text-center">{p.analyst ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-stone-600 mx-auto" />}</td>
                  <td className="py-2.5 text-center">{p.investigator ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-stone-600 mx-auto" />}</td>
                  <td className="py-2.5 text-center">{p.researcher ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-stone-600 mx-auto" />}</td>
                  <td className="py-2.5 text-center">{p.community ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-stone-600 mx-auto" />}</td>
                  <td className="py-2.5 text-center">{p.viewer ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-stone-600 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
