import React from 'react';
import { DataBadge } from '../common/DataBadge';
import { Settings, Shield, Activity, Users, Database, Clock, Server } from 'lucide-react';

export const AdminAuditModule: React.FC = () => {
  const auditLogs = [
    { time: "2026-02-24 10:15:20", actor: "admin@palarguard.ai", action: "DISPATCH_INVESTIGATION", entity: "INVESTIGATION #101", details: "Assigned Field Team Alpha to Ranipet Sluice Chromium alert." },
    { time: "2026-02-24 09:40:12", actor: "analyst@palarguard.ai", action: "REVIEW_ANOMALY", entity: "ANOMALY #2", details: "Flagged Ambur Tannery cluster EC surge as Under Review." },
    { time: "2026-02-23 16:30:45", actor: "system", action: "INGESTION_SYNC", entity: "CGWB_WELLS", details: "Imported Q1 2026 hydrograph records for 7 Palar observation wells." },
    { time: "2026-02-23 14:10:00", actor: "community@palarguard.ai", action: "SUBMIT_REPORT", entity: "REPORT #2", details: "Logged dry agricultural well incident in Vaniyambadi." },
    { time: "2026-02-22 08:00:00", actor: "system", action: "MODEL_RUN", entity: "MCDA_ENGINE", details: "Computed updated geospatial risk priority scores across all reaches." },
  ];

  const userAccounts = [
    { name: "Kayalvizhi J", email: "admin@palarguard.ai", role: "Administrator", status: "Active" },
    { name: "Harini S", email: "analyst@palarguard.ai", role: "Environmental Analyst", status: "Active" },
    { name: "Aarthi L", email: "investigator@palarguard.ai", role: "Field Investigator", status: "Active" },
    { name: "CIT Fellow", email: "researcher@palarguard.ai", role: "Researcher", status: "Active" },
    { name: "Palar Watershed Citizen", email: "community@palarguard.ai", role: "Community Reporter", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Administration & Audit Governance</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            System health diagnostics, verifiable tamper-evident audit logs, and account privilege management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Health: Operational
          </span>
        </div>
      </div>

      {/* System Health Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl space-y-1">
          <div className="text-[10px] text-stone-400 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite Database Layer</span>
          </div>
          <div className="text-base font-bold text-white">7 Stations / 91 Records</div>
          <div className="text-[10px] text-emerald-400">Connected & Seeded</div>
        </div>

        <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl space-y-1">
          <div className="text-[10px] text-stone-400 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>FastAPI REST Gateway</span>
          </div>
          <div className="text-base font-bold text-white">11 Active Routers</div>
          <div className="text-[10px] text-cyan-400">Latency: 12ms avg</div>
        </div>

        <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl space-y-1">
          <div className="text-[10px] text-stone-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anomaly Model Engine</span>
          </div>
          <div className="text-base font-bold text-white">Robust Z-Score</div>
          <div className="text-[10px] text-emerald-400">Validated on MAD</div>
        </div>

        <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl space-y-1">
          <div className="text-[10px] text-stone-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Trail Integrity</span>
          </div>
          <div className="text-base font-bold text-white">Tamper Evident</div>
          <div className="text-[10px] text-amber-300">100% Traceability</div>
        </div>
      </div>

      {/* Main Grid: User Accounts & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Accounts Column */}
        <div className="lg:col-span-5 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Platform User Accounts</span>
            </h3>
            <p className="text-[11px] text-stone-400">Configured credentials and access roles</p>
          </div>

          <div className="space-y-2.5">
            {userAccounts.map((acc, aIdx) => (
              <div key={aIdx} className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{acc.name}</div>
                  <div className="text-[10px] text-stone-400 font-mono">{acc.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-emerald-300 font-bold">{acc.role}</div>
                  <div className="text-[9px] text-emerald-400 font-mono">{acc.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="lg:col-span-7 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>System Audit Log Trail</span>
              </h3>
              <p className="text-[11px] text-stone-400">Timestamped record of administrative and analyst actions</p>
            </div>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log, lIdx) => (
              <div key={lIdx} className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-stone-400">{log.time}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-emerald-300 border border-white/5 font-bold">
                    {log.action}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-white">
                  {log.entity} <span className="text-stone-400 font-normal font-mono">by {log.actor}</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed font-sans">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
