import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  CalendarDays, Plus, Upload, Download, Loader2, Shield, Eye, MapPin,
  Clock, Users, Search, Gavel, CheckCircle2, XCircle,
} from 'lucide-react';
import RoleToolbar from '../components/RoleToolbar';
import FixtureFormModal from '../components/schedule/FixtureFormModal';
import ImportFixturesModal from '../components/schedule/ImportFixturesModal';

export default function ScheduleStudio() {
  const queryClient = useQueryClient();
  const [me, setMe] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [ageFilter, setAgeFilter] = useState('');

  // זהות + מועדון של המשתמש
  useQuery({
    queryKey: ['schedule-me'],
    queryFn: async () => {
      const u = await base44.auth.me();
      const clubs = await base44.entities.Club.filter({ admin_ids: u.id }, '-created_date', 10);
      const myClub = clubs[0] || null;
      const out = { ...u, myClub };
      setMe(out);
      return out;
    },
  });

  const { data: fixtures = [], isLoading } = useQuery({
    queryKey: ['fixtures'],
    queryFn: () => base44.entities.MatchFixture.list('-match_date', 500),
  });

  // שנתונים של המאמן (מתוך שיבוצי קבוצות)
  const { data: myAssignments = [] } = useQuery({
    queryKey: ['coach-assignments-me'],
    queryFn: async () => {
      if (!me?.email) return [];
      return base44.entities.CoachAssignment.filter({ coach_email: me.email, is_active: true }, '-created_date', 50);
    },
    enabled: !!me?.email && me.role === 'coach',
  });
  const myAgeGroups = useMemo(() => {
    const set = new Set();
    myAssignments.forEach(a => a.team_label && set.add(a.team_label));
    return [...set];
  }, [myAssignments]);

  const role = me?.role || 'coach';
  const club = me?.myClub;
  const canManage = role === 'admin' || role === 'director';

  // סינון תצוגה: מאמן רואה רק את שנתוניו; כולם רואים רק את המועדון שלהם (RLS מגבה)
  const visible = useMemo(() => {
    let list = fixtures.filter(f => !ageFilter || f.age_group === ageFilter);
    if (role === 'coach' && myAgeGroups.length) {
      list = list.filter(f => myAgeGroups.includes(f.age_group));
    }
    if (search.trim()) {
      const s = search.trim();
      list = list.filter(f => (f.home_team + f.away_team + f.stadium_name + f.competition).includes(s));
    }
    return list;
  }, [fixtures, ageFilter, myAgeGroups, role, search]);

  const ageGroups = useMemo(() => [...new Set(fixtures.map(f => f.age_group).filter(Boolean))], [fixtures]);

  // ייצוא CSV קליינטי
  const exportCsv = () => {
    const rows = [['תאריך', 'שעה', 'שנתון', 'בית', 'חוץ', 'מגרש', 'מסגרת', 'שופט', 'סטטוס']];
    visible.forEach(f => rows.push([f.match_date, f.kickoff_time, f.age_group, f.home_team, f.away_team, f.stadium_name, f.competition, f.referee_name, f.referee_status]));
    const csv = rows.map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fixtures.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!me) return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>;
  if (!club) return <NoClub />;

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <RoleToolbar activeLabel="מנוע לוחות זמנים" activeIcon={CalendarDays} />

      <div className="bg-panel border-b border-hairline py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-ink font-black text-xl flex items-center gap-2">
              {canManage ? <Shield size={18} className="text-brand" /> : <Eye size={18} className="text-ink-muted" />}
              לוח משחקים ושיבוץ מגרשים
            </h1>
            <p className="text-ink-muted text-xs mt-0.5">
              {canManage ? 'מנהל מקצועי — יצירה, עריכה, זימון שופטים וייבוא' : 'מאמן — תצוגת קריאה בלבד לשנתונים שלך'} · {club.club_name}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש…" className="bg-surface border border-hairline rounded-md pr-9 pl-3 py-1.5 text-ink text-xs focus:outline-none focus:border-brand-line" />
            </div>
            <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="bg-surface border border-hairline rounded-md px-2 py-1.5 text-ink text-xs focus:outline-none">
              <option value="">כל השנתונים</option>
              {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button onClick={exportCsv} className="flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-ink border border-hairline rounded-md px-3 py-1.5"><Download size={13} /> ייצוא CSV</button>
            {canManage && <>
              <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-1 text-xs font-bold bg-brand text-brand-ink rounded-md px-3 py-1.5"><Plus size={13} /> משחק חדש</button>
              <button onClick={() => setImportOpen(true)} className="flex items-center gap-1 text-xs font-bold border border-brand-line text-brand rounded-md px-3 py-1.5"><Upload size={13} /> ייבוא קובץ</button>
            </>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <FixtureList fixtures={visible} loading={isLoading} canManage={canManage} onEdit={f => { setEditing(f); setFormOpen(true); }} />
      </div>

      {formOpen && <FixtureFormModal club={club} initial={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); queryClient.invalidateQueries({ queryKey: ['fixtures'] }); }} />}
      {importOpen && <ImportFixturesModal club={club} onClose={() => setImportOpen(false)} onDone={() => queryClient.invalidateQueries({ queryKey: ['fixtures'] })} />}
    </div>
  );
}

function NoClub() {
  return <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
    <Shield size={28} className="text-ink-faint" />
    <div className="text-ink font-bold">לא זוהה מועדון בבעלותך</div>
    <div className="text-ink-muted text-xs">פנה למנהל העל לשייך אותך למועדון בפורטל ה-Super Admin.</div>
  </div>;
}

function FixtureList({ fixtures, loading, canManage, onEdit }) {
  if (loading) return <div className="text-center py-16"><Loader2 className="animate-spin text-brand mx-auto" /></div>;
  if (!fixtures.length) return <div className="text-center py-16 text-ink-faint text-sm">אין משחקים מתוכננים — {canManage ? 'הוסף משחק חדש או יבא קובץ.' : 'הלו"ז יתעדכן ע"י המנהל המקצועי.'}</div>;
  const byDate = {};
  fixtures.forEach(f => { (byDate[f.match_date] ||= []).push(f); });
  return (
    <div className="space-y-6">
      {Object.keys(byDate).sort().map(date => (
        <div key={date}>
          <div className="text-ink-muted text-xs font-bold mb-2 flex items-center gap-1.5"><CalendarDays size={12} className="text-brand" /> {date} · {byDate[date].length} משחקים</div>
          <div className="space-y-2">
            {byDate[date].sort((a, b) => (a.kickoff_time || '').localeCompare(b.kickoff_time || '')).map(f => <FixtureRow key={f.id} f={f} canManage={canManage} onEdit={() => onEdit(f)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function FixtureRow({ f, canManage, onEdit }) {
  const statusColor = { SCHEDULED: 'text-ink-muted', POSTPONED: 'text-amber-400', CANCELLED: 'text-red-400', COMPLETED: 'text-green-400' }[f.status] || 'text-ink-muted';
  const refColor = { PENDING: 'text-amber-400', CONFIRMED: 'text-green-400', DECLINED: 'text-red-400', NOT_REQUIRED: 'text-ink-faint' }[f.referee_status] || 'text-ink-faint';
  return (
    <button onClick={onEdit} className={`w-full text-right bg-panel border border-hairline ${canManage ? 'hover:border-brand-line cursor-pointer' : 'cursor-default'} rounded-lg p-3.5 flex items-center gap-3 transition-colors`}>
      <div className="flex flex-col items-center justify-center bg-surface border border-hairline rounded-md w-14 h-14 flex-shrink-0">
        <span className="text-ink font-black text-sm">{(f.kickoff_time || '').slice(0, 5)}</span>
        <span className="text-ink-faint text-[9px]">{(f.match_date || '').slice(5)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-ink font-bold text-sm truncate">{f.home_team} <span className="text-ink-faint mx-1">נגד</span> {f.away_team}</div>
        <div className="text-ink-muted text-[11px] flex items-center gap-2 flex-wrap mt-0.5">
          <span className="flex items-center gap-1"><Users size={10} /> {f.age_group}</span>
          <span className="flex items-center gap-1"><MapPin size={10} /> {f.stadium_name}</span>
          {f.competition && <span className="flex items-center gap-1"><Shield size={10} /> {f.competition}</span>}
        </div>
      </div>
      {canManage && (
        <div className="flex flex-col items-end gap-1 text-[10px]">
          <span className={`${refColor} flex items-center gap-0.5`}><Gavel size={10} /> {refLabel(f.referee_status)}</span>
          <span className={`${statusColor}`}>{statusLabel(f.status)}</span>
        </div>
      )}
    </button>
  );
}

function refLabel(s) { return { PENDING: 'שופט ממתין', CONFIRMED: 'שופט אישר', DECLINED: 'שופט דחה', NOT_REQUIRED: 'ללא שופט' }[s] || '—'; }
function statusLabel(s) { return { SCHEDULED: 'מתוכנן', POSTPONED: 'נדחה', CANCELLED: 'בוטל', COMPLETED: 'הסתיים' }[s] || '—'; }