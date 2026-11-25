import React, { useEffect, useState } from 'react';
import { Shield, Users, Database, Clock, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';

interface AdminAuditModuleProps {
  onOpenAuth?: () => void;
}

const ALL_ROLES = [
  'Administrator',
  'Environmental Analyst',
  'Field Investigator',
  'Researcher',
  'Community Reporter',
  'Viewer',
];

export const AdminAuditModule: React.FC<AdminAuditModuleProps> = ({ onOpenAuth }) => {
  const { isAuthenticated, role } = useAuth();
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = isAuthenticated && role === 'Administrator';

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const [u, l, s] = await Promise.all([
        apiService.getAdminUsers(),
        apiService.getAdminAuditLogs(),
        apiService.getAdminSystemStatus(),
      ]);
      setUsers(u);
      setLogs(l);
      setSysStatus(s);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load administration data.', 'நிர்வாகத் தரவுகளை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setErrorMsg(null);
    try {
      await apiService.updateUserRole(userId, newRole);
      await loadAdminData();
    } catch (err: any) {
      setErrorMsg(err?.message || L('Role update failed.', 'உரிமை மாற்றம் தோல்வியடைந்தது.'));
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-[#120b0d] p-8 text-center space-y-4 max-w-xl mx-auto my-8">
        <Lock className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-xl font-semibold text-[#fcfbf7]">
          {L('Administrator Access Required', 'நிர்வாகி அணுகல் தேவை')}
        </h2>
        <p className="text-xs text-[#a4b2a9] leading-relaxed">
          {isAuthenticated
            ? L(
                `Signed in as ${role}. System administration, user role management, and security audit logs are restricted to Administrators.`,
                `நீங்கள் ${role} ஆக உள்நுழைந்துள்ளீர்கள். நிர்வாகி கணக்கிற்கு மட்டுமே இந்தப் பகுதி அனுமதிக்கப்பட்டுள்ளது.`
              )
            : L(
                'Sign in with an Administrator account to manage user roles and inspect tamper-evident audit logs.',
                'பயனர் உரிமைகள் மற்றும் தணிக்கை பதிவேடுகளைப் பார்க்க நிர்வாகி கணக்குடன் உள்நுழையவும்.'
              )}
        </p>
        {!isAuthenticated && onOpenAuth && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-6 py-2.5 rounded-xl bg-[#10b981] text-[#041a11] text-xs font-semibold"
          >
            {L('Sign In', 'உள்நுழைக')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl">
        <div>
          <h2 className="text-xl font-semibold text-[#fcfbf7]">
            {L('Administration & Audit Console', 'நிர்வாகம் & தணிக்கை மையம்')}
          </h2>
          <p className="text-xs text-[#a4b2a9]">
            {L('Live database counts, role-based user governance, and persisted audit trail.', 'நேரடி தரவுத்தள எண்ணிக்கை, பயனர் உரிமை நிர்வாகம் மற்றும் தணிக்கை பதிவேடு.')}
          </p>
        </div>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </span>
          <button type="button" onClick={loadAdminData} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {sysStatus && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs tabular-nums">
          <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl">
            <div className="text-[10px] text-stone-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>DATABASE ({sysStatus.database_backend})</span>
            </div>
            <div className="text-base font-semibold text-white mt-1">
              {sysStatus.counts.locations} Stations / {sysStatus.counts.groundwater_records} GW
            </div>
          </div>
          <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl">
            <div className="text-[10px] text-stone-400">REGISTERED USERS</div>
            <div className="text-base font-semibold text-white mt-1">{sysStatus.counts.users}</div>
          </div>
          <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl">
            <div className="text-[10px] text-stone-400">DOCUMENTS</div>
            <div className="text-base font-semibold text-white mt-1">{sysStatus.counts.documents}</div>
          </div>
          <div className="p-4 bg-[#092218] border border-white/[0.08] rounded-xl">
            <div className="text-[10px] text-stone-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>AUDIT EVENTS</span>
            </div>
            <div className="text-base font-semibold text-white mt-1">{sysStatus.counts.audit_logs}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{L('User Role Governance', 'பயனர் உரிமை நிர்வாகம்')}</span>
          </div>
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-white">{u.full_name}</div>
                  <div className="text-[10px] text-stone-400 font-mono">{u.email}</div>
                </div>
                <select
                  aria-label={`Role for ${u.email}`}
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="px-2.5 py-1 rounded bg-[#092218] border border-white/10 text-xs text-emerald-300"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{L('Persisted Audit Trail', 'தணிக்கை பதிவேடு')}</span>
          </div>
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-stone-400">{new Date(log.created_at).toLocaleString()}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-emerald-300">{log.action}</span>
                </div>
                <div className="text-[11px] font-semibold text-white">
                  {log.entity} <span className="text-stone-400 font-normal font-mono">by {log.user_email}</span>
                </div>
                <p className="text-[11px] text-stone-300">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
