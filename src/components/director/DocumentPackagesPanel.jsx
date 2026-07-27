import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Calendar, Repeat, Briefcase, AlertTriangle, CheckCircle2, XCircle,
  Loader2, FileText, Lock, Unlock, ChevronDown, ChevronUp, User,
  Building2, Info, ShieldCheck
} from 'lucide-react';
import { IFA_CLUB_PACKAGES, IFA_PERSONAL_PACKAGES, computePackageStatus } from '@/lib/documentPackages';

const ICONS = { Calendar, Repeat, Briefcase, AlertTriangle, User, ShieldCheck };

// לוח חבילות מסמכים רשמיות מול ההתאחדות לכדורגל (IFA) בלבד.
// שני מסלולי חובה:
// (א) חבילות מוסדיות — רישום עונתי + בקרת משמעת והעברות.
// (ב) חבילות אישיות — תיק שחקן + תיק צוות/מאמן.

export default function DocumentPackagesPanel() {
  const [collapsed, setCollapsed] = useState({});

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date', 200),
  });

  const toggle = (key) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  return (
    <div className="space-y-6">
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h3 className="text-white font-black text-base flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#D4AF37]" />
          חבילות מסמכים רשמיות — התאחדות לכדורגל בישראל (IFA)
        </h3>
        <p className="text-white/40 text-xs mt-1 leading-relaxed">
          כל החבילות נשענות אך ורק על תקנון ההתאחדות ובנק התבניות הרשמי. כל חבילה חוסמת פעולה מערכתית עד להשלמתה — רישום סגלים, סגירת העברה, הוספה למשחק רשמי או פעילות מקצועית.
        </p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[#D4AF37]" /></div>}

      <SectionBlock
        title="חבילות מוסדיות — רישום עונתי ובקרת העברות"
        subtitle="חובה רגולטורית מול ההתאחדות. חסימת רישום סגלים וסגירת העברה עד להשלמה"
        icon={Building2}
        packages={IFA_CLUB_PACKAGES}
        collapsed={collapsed}
        onToggle={toggle}
        contracts={contracts}
      />

      <SectionBlock
        title="חבילות אישיות — תיק שחקן ותיק צוות מקצועי"
        subtitle="פרופיל מסמכים מלא ומאושר לכל שחקן ואיש צוות בסגל הרשמי"
        icon={User}
        packages={IFA_PERSONAL_PACKAGES}
        collapsed={collapsed}
        onToggle={toggle}
        contracts={contracts}
      />
    </div>
  );
}

function SectionBlock({ title, subtitle, icon: Icon, packages, collapsed, onToggle, contracts }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon size={14} className="text-[#D4AF37] flex-shrink-0" />
        <h3 className="text-white font-black text-sm whitespace-nowrap">{title}</h3>
        <span className="text-white/30 text-[10px] mr-3 truncate">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map(pkg => (
          <PackageCard key={pkg.key} pkg={pkg} collapsed={collapsed[pkg.key]} onToggle={() => onToggle(pkg.key)} contracts={contracts} />
        ))}
      </div>
    </div>
  );
}

function PackageCard({ pkg, collapsed, onToggle, contracts }) {
  const status = computePackageStatus(pkg, contracts);
  const Icon = ICONS[pkg.icon] || FileText;
  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-start gap-3 p-4 hover:bg-white/[0.03] transition-colors text-right">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${pkg.color}15`, border: `1px solid ${pkg.color}40` }}>
          <Icon size={18} style={{ color: pkg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-black text-sm">{pkg.label}</div>
          <p className="text-white/40 text-[11px] leading-snug mt-0.5">{pkg.description}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-white/30 text-[10px]">קהל יעד:</span>
            <span className="text-white/60 text-[10px]">{pkg.audience}</span>
          </div>
          {pkg.gate_label && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {status.isReady
                ? <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"><Unlock size={9} /> פתוחה</span>
                : <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock size={9} /> נעולה</span>}
              <span className={`text-[11px] font-black ${status.isReady ? 'text-green-400' : 'text-amber-400'}`}>{status.completionPct}%</span>
              <span className="text-white/30 text-[10px]">({status.completedCount}/{status.requiredCount})</span>
            </div>
          )}
          {pkg.outcome && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#D4AF37]">
              <Info size={11} className="flex-shrink-0" /> <span className="truncate">תוצר סופי: {pkg.outcome}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">{collapsed ? <ChevronDown size={16} className="text-white/30" /> : <ChevronUp size={16} className="text-white/30" />}</div>
      </button>
      {!collapsed && (
        <div className="border-t border-white/5 p-4 space-y-3">
          {pkg.gate_label && (
            <div className={`rounded-lg p-2.5 flex items-start gap-2 text-[11px] border ${status.isReady ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-400'}`}>
              <Lock size={12} className="mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold">{pkg.gate_label}:</span> <span className="text-white/70 leading-snug">{pkg.gate_description}</span>
              </div>
            </div>
          )}
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
                      : d.is_finance ? 'ממתין לאישור תשלום — דמי העברה 5,000 ₪'
                      : d.is_sell_on ? 'ממתין לעיגון חוזה דמי השבחה (Sell-On)'
                      : 'טרם נפתח'}
                    {d.optional && ' · במידת הצורך'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}