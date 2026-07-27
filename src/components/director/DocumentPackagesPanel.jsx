import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Calendar, Repeat, Briefcase, AlertTriangle, CheckCircle2, XCircle,
  Loader2, FileText, Lock, Unlock, ChevronDown, ChevronUp
} from 'lucide-react';
import { DOCUMENT_PACKAGES, computePackageStatus } from '@/lib/documentPackages';

const ICONS = { Calendar, Repeat, Briefcase, AlertTriangle };

// לוח חבילות מסמכים משפטיים — ארבע חבילות רגולטוריות שכל אחת מהן חוסמת פעולה מערכתית
// עד להשלמת מכלול המסמכים ואישורם. מקושר ל-Contract entity כדי לספק סטטוס חי.

export default function DocumentPackagesPanel() {
  const [collapsed, setCollapsed] = useState({});

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date', 200),
  });

  const toggle = (key) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  return (
    <div className="space-y-4">
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h3 className="text-white font-black text-base flex items-center gap-2">
          <Briefcase size={16} className="text-[#D4AF37]" />
          חבילות מסמכים משפטיים ומועדוניים
        </h3>
        <p className="text-white/40 text-xs mt-1 leading-relaxed">
          ארבע חבילות רגולטוריות המסדירות פעולות רגישות במועדון. כל חבילה חוסמת פעולה מערכתית עד להשלמת מכלול
          המסמכים ואישורם, בהתאם לתקנוני ההתאחדות לכדורגל ולמדריכי caduregel.com.
        </p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[#D4AF37]" /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_PACKAGES.map(pkg => {
          const status = computePackageStatus(pkg, contracts);
          const Icon = ICONS[pkg.icon] || FileText;
          const isCollapsed = collapsed[pkg.key];
          return (
            <div key={pkg.key} className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => toggle(pkg.key)} className="w-full flex items-start gap-3 p-4 hover:bg-white/[0.03] transition-colors text-right">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${pkg.color}15`, border: `1px solid ${pkg.color}40` }}>
                  <Icon size={18} style={{ color: pkg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-white font-black text-sm">{pkg.label}</span>
                    {status.isReady
                      ? <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"><Unlock size={9} /> פתוחה</span>
                      : <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={9} /> נעולה</span>}
                  </div>
                  <p className="text-white/40 text-[11px] leading-snug">{pkg.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] text-white/40">השלמה:</span>
                    <span className={`text-[11px] font-black ${status.isReady ? 'text-green-400' : 'text-amber-400'}`}>{status.completionPct}%</span>
                    <span className="text-white/30 text-[10px]">({status.completedCount}/{status.requiredCount} חתומים{status.pendingCount > 0 ? ` · ${status.pendingCount} ממתינים` : ''})</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${status.completionPct}%`, backgroundColor: pkg.color }} />
                  </div>
                </div>
                <div className="flex-shrink-0">{isCollapsed ? <ChevronDown size={16} className="text-white/30" /> : <ChevronUp size={16} className="text-white/30" />}</div>
              </button>

              {!isCollapsed && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  <div className={`rounded-lg p-2.5 flex items-start gap-2 text-[11px] border ${status.isReady ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-400'}`}>
                    <Lock size={12} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">{pkg.gate_label}:</span> <span className="text-white/70 leading-snug">{pkg.gate_description}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {status.docsStatus.map(d => (
                      <div key={d.role} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
                        <div className="flex-shrink-0 mt-0.5">
                          {d.status === 'signed'
                            ? <CheckCircle2 size={12} className="text-green-400" />
                            : d.status === 'pending'
                              ? <Loader2 size={12} className="text-amber-400" />
                              : <XCircle size={12} className="text-white/30" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 text-[11px] font-bold leading-snug">{d.label}</div>
                          <div className="text-white/40 text-[10px] mt-0.5">
                            {d.status === 'signed' ? 'נחתם ואושר'
                              : d.status === 'pending' ? 'ממתין לחתימה / אישור'
                              : 'טרם נפתח'}
                            {d.optional && ' · לא חובה'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-white/30 text-[10px] pt-1 border-t border-white/5">
                    קהל יעד: {pkg.audience}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}