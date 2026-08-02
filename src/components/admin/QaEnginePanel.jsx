import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, RotateCw, AlertTriangle, ShieldCheck, Info, Bug, CheckCircle2, Wrench } from 'lucide-react';

const SEV_META = {
  critical: { label: 'קריטי', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', icon: AlertTriangle },
  warning: { label: 'אזהרה', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', icon: AlertTriangle },
  info: { label: 'מידע', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', icon: Info },
};
const STATUS_META = {
  open: { label: 'פתוח', color: 'text-red-400' },
  auto_fixed: { label: 'תוקן אוטומטית', color: 'text-green-400' },
  resolved: { label: 'נפתר', color: 'text-white/40' },
  ignored: { label: 'בהתעלמות', color: 'text-white/30' },
};

export default function QaEnginePanel() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('open');

  const { data: findings = [], isLoading } = useQuery({
    queryKey: ['qa-findings'],
    queryFn: () => base44.entities.QaFinding.list('-created_date', 200),
  });

  const runScan = useMutation({
    mutationFn: () => base44.functions.invoke('runSystemQaScan', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['qa-findings'] }),
  });

  const ignore = useMutation({
    mutationFn: (id) => base44.entities.QaFinding.update(id, { status: 'ignored' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['qa-findings'] }),
  });

  const list = filter === 'all' ? findings : findings.filter(f => f.status === filter);
  const counts = findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {});
  const openCount = findings.filter(f => f.status === 'open').length;
  const autoFixedCount = findings.filter(f => f.status === 'auto_fixed').length;
  const lastRun = runScan.data?.data;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <Bug size={18} className="text-[#D4AF37]" /> מנוע QA פנימי רציף
          </h2>
          <p className="text-white/40 text-xs mt-0.5">סריקה יומית אוטומטית · אימות רגולציית IFA · תיקון אוטומטי · מניעת גלילה כפולה</p>
        </div>
        <button
          onClick={() => runScan.mutate()}
          disabled={runScan.isPending}
          className="flex items-center gap-1.5 text-xs font-bold bg-[#D4AF37] text-[#0D1B2A] px-4 py-2 rounded-sm hover:bg-amber-400 disabled:opacity-40"
        >
          {runScan.isPending ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
          הרץ סריקה עכשיו
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="פתוחות" value={openCount} color="text-red-400" />
        <Stat label="תוקנו אוטומטית" value={autoFixedCount} color="text-green-400" />
        <Stat label="קריטיות" value={counts.critical || 0} color="text-red-400" />
        <Stat label="אזהרות/מידע" value={(counts.warning || 0) + (counts.info || 0)} color="text-amber-400" />
      </div>

      {lastRun && (
        <div className="bg-[#0D1B2A] border border-green-500/20 rounded-lg p-3 mb-4 text-xs text-green-400">
          סריקה אחרונה: {lastRun.total_findings} ממצאים · {lastRun.auto_fixed} תוקנו · {lastRun.new_inserted} חדשים · {lastRun.resolved} נפתרו
        </div>
      )}

      <div className="flex gap-1 mb-4 flex-wrap">
        {[['open', 'פתוחות'], ['auto_fixed', 'תוקנו'], ['resolved', 'נפתרו'], ['all', 'הכל']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-md ${filter === id ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'bg-[#1B263B] text-white/60 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <ShieldCheck size={28} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/30 text-sm">אין ממצאים — המערכת תקינה</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(f => {
            const s = SEV_META[f.severity] || SEV_META.info;
            const Icon = s.icon;
            return (
              <div key={f.id} className={`bg-[#1B263B] border ${s.border} rounded-lg p-4 overflow-hidden`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon size={14} className={`${s.color} flex-shrink-0`} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                    <span className="text-white/30 text-[10px]">{f.category}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${STATUS_META[f.status]?.color || ''} flex-shrink-0`}>{STATUS_META[f.status]?.label}</span>
                </div>
                <div className="text-white text-sm font-bold mb-1 break-words">{f.title}</div>
                <p className="text-white/50 text-xs leading-relaxed mb-2 break-words">{f.detail}</p>
                {f.fix_hint && (
                  <div className="flex items-start gap-1.5 text-amber-400 text-[11px] bg-amber-500/5 border border-amber-500/15 rounded px-2 py-1.5 break-words">
                    <Wrench size={11} className="mt-0.5 flex-shrink-0" /> {f.fix_hint}
                  </div>
                )}
                {f.auto_fix_applied && (
                  <div className="flex items-center gap-1.5 text-green-400 text-[11px] mt-1 break-words">
                    <CheckCircle2 size={11} className="flex-shrink-0" /> {f.auto_fix_applied}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 text-white/30 text-[10px] gap-2">
                  <span className="truncate">יעד: {f.target_name || f.target_id || '—'}</span>
                  {f.status === 'open' && (
                    <button onClick={() => ignore.mutate(f.id)} className="hover:text-white/60 flex-shrink-0">התעלם</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-3">
      <div className="text-white/40 text-[10px] font-bold">{label}</div>
      <div className={`font-black text-2xl ${color}`}>{value}</div>
    </div>
  );
}