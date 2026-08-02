import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, ShieldCheck, FileText, Building2, ChevronRight } from 'lucide-react';
import ClubReviewModal from './ClubReviewModal';

const OPS = ['ממתין להפעלה', 'בבדיקה', 'פעיל', 'מושעה', 'נדחה'];
const OPS_COLOR = {
  'ממתין להפעלה': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'בבדיקה': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'פעיל': 'text-green-400 bg-green-500/10 border-green-500/30',
  'מושעה': 'text-red-400 bg-red-500/10 border-red-500/30',
  'נדחה': 'text-ink-faint bg-black/5 border-hairline-strong',
};

// רשימת מועדונים + סינון לפי סטטוס תפעולי/אימות + בחינה במודאל.
export default function ClubOnboardingPanel({ user }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reviewId, setReviewId] = useState(null);

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['super-admin-clubs'],
    queryFn: () => base44.entities.Club.list('-created_date', 200),
  });

  const counts = OPS.reduce((acc, s) => ({ ...acc, [s]: clubs.filter(c => (c.operational_status || 'ממתין להפעלה') === s).length }), {});

  const filtered = clubs.filter(c => {
    const ops = c.operational_status || 'ממתין להפעלה';
    if (filter !== 'all' && ops !== filter) return false;
    if (search.trim()) {
      const s = search.trim();
      if (!(c.club_name || '').includes(s) && !(c.contact_email || '').includes(s) && !(c.city || '').includes(s)) return false;
    }
    return true;
  });

  const reviewed = clubs.find(c => c.id === reviewId);

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <Kpis label="סה״כ מועדונים" value={clubs.length} />
        {OPS.map(s => <Kpis key={s} label={s} value={counts[s]} tone={s} />)}
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex gap-1 bg-panel border border-hairline rounded-lg p-1 flex-wrap">
          {[{ id: 'all', label: 'הכל' }, ...OPS.map(o => ({ id: o, label: o }))].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors ${filter === f.id ? 'bg-brand text-brand-ink' : 'text-ink-muted hover:text-ink'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש מועדון / מייל / עיר…"
            className="w-full bg-panel border border-hairline rounded-lg pr-9 pl-3 py-2 text-ink text-xs placeholder-ink-faint focus:outline-none focus:border-brand-line" />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-faint text-sm">אין מועדונים תואמים</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(c => {
            const ops = c.operational_status || 'ממתין להפעלה';
            const docs = [c.incorporation_certificate_url, c.ifa_membership_certificate_url, c.insurance_certificate_url].filter(Boolean).length;
            return (
              <button key={c.id} onClick={() => setReviewId(c.id)}
                className="bg-panel border border-hairline hover:border-brand-line rounded-lg p-4 text-right transition-all group flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand-line flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-ink font-bold text-sm truncate">{c.club_name || '—'}</div>
                  <div className="text-ink-faint text-[11px] mt-0.5 truncate">{c.club_tier || ''} {c.city ? `· ${c.city}` : ''}</div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${OPS_COLOR[ops]}`}>{ops}</span>
                    {c.verification_status === 'מאומת' && <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 rounded-full px-2 py-0.5 flex items-center gap-1"><ShieldCheck size={10} /> מאומת</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${docs >= 3 ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
                      <FileText size={10} /> {docs}/3 מסמכים
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-ink-faint group-hover:text-brand transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {reviewed && <ClubReviewModal club={reviewed} user={user} onClose={() => setReviewId(null)} />}
    </div>
  );
}

function Kpis({ label, value, tone }) {
  const cls = tone && OPS_COLOR[tone] ? OPS_COLOR[tone] : 'bg-panel border-hairline text-ink';
  return (
    <div className={`rounded-lg px-3 py-2.5 border ${cls}`}>
      <div className="font-black text-xl">{value}</div>
      <div className="text-[10px] opacity-80">{label}</div>
    </div>
  );
}