import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Crown, GitMerge, CalendarDays, Shield, Settings, Search, Users,
  ArrowRight, Loader2, KeyRound, Flag, LayoutDashboard, MapPin,
  TrendingUp, AlertTriangle, CheckCircle2, Building2, Trophy,
} from 'lucide-react';
import RoleToolbar from '../components/RoleToolbar';
import { useTranslation } from '@/lib/i18n/LanguagesContext';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

// מרכז הבעלים — גישה מרוכזת לכלל המערכות, לו״ז מאוחד של הארגון/ליגה/מועדון,
// ותיק ניהול הגשר למחלקות נוער מקצועניות. נגיש ל-admin (בעלים) בלבד.
export default function OwnerHub() {
  const [me, setMe] = useState(null);

  useQuery({
    queryKey: ['owner-me'],
    queryFn: async () => {
      const u = await base44.auth.me();
      setMe(u); return u;
    },
  });

  if (!me) return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>;
  if (me.role !== 'admin') return <Gate />;

  return <OwnerContent me={me} />;
}

function Gate() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
      <Shield size={28} className="text-ink-faint" />
      <div className="text-ink font-bold">{t('owner.hub')}</div>
      <div className="text-ink-muted text-xs">{t('owner.gateMsg')}</div>
    </div>
  );
}

const CLASSIFICATION_LABELS = { IFA_VERIFIED: 'מאומת התאחדות', YOUTH_DEPARTMENT: 'מחלקת נוער', AMATEUR_LEAGUE: 'ליגה חובבנית', ASSOCIATION: 'עמותה/איגוד' };

const SYSTEMS = [
  { label: 'owner.directorDash', path: '/director', icon: Crown, color: '#EF4444', cat: 'professional' },
  { label: 'owner.coachDash', path: '/coach', icon: LayoutDashboard, color: '#10B981', cat: 'professional' },
  { label: 'owner.scouting', path: '/scouting', icon: Search, color: '#8B5CF6', cat: 'professional' },
  { label: 'owner.bridge', path: '/bridge', icon: GitMerge, color: '#22C55E', cat: 'professional' },
  { label: 'owner.schedule', path: '/schedule', icon: CalendarDays, color: '#0EA5E9', cat: 'technical' },
  { label: 'owner.league', path: '/league', icon: Trophy, color: '#F59E0B', cat: 'technical' },
  { label: 'owner.superAdmin', path: '/super-admin', icon: Building2, color: '#A855F7', cat: 'bureaucratic' },
  { label: 'owner.guardian', path: '/guardian-portal', icon: Users, color: '#F59E0B', cat: 'bureaucratic' },
  { label: 'owner.qa', path: '/qa-engine', icon: Flag, color: '#F97316', cat: 'software' },
  { label: 'owner.admin', path: '/admin', icon: Settings, color: '#3B82F6', cat: 'software' },
];

const CATEGORIES = [
  { id: 'professional', title: 'owner.catProfessional', icon: Crown, color: '#EF4444', sub: 'owner.catProfessionalSub' },
  { id: 'technical', title: 'owner.catTechnical', icon: CalendarDays, color: '#0EA5E9', sub: 'owner.catTechnicalSub' },
  { id: 'bureaucratic', title: 'owner.catBureaucratic', icon: Shield, color: '#A855F7', sub: 'owner.catBureaucraticSub' },
  { id: 'software', title: 'owner.catSoftware', icon: Flag, color: '#F97316', sub: 'owner.catSoftwareSub' },
];

function OwnerContent({ me }) {
  const { t } = useTranslation();
  const { data: clubs = [] } = useQuery({
    queryKey: ['owner-clubs'],
    queryFn: () => base44.entities.Club.list('-created_date', 50),
  });
  const myClub = clubs.find(c => (c.admin_ids || []).includes(me.id)) || clubs[0] || null;

  const { data: fixtures = [], isLoading: loadingFx } = useQuery({
    queryKey: ['owner-unified-schedule'],
    queryFn: () => base44.entities.MatchFixture.list('-match_date', 150),
  });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = useMemo(
    () => fixtures
      .filter(f => f.status === 'SCHEDULED' && f.match_date && new Date(f.match_date) >= today)
      .sort((a, b) => new Date(a.match_date) - new Date(b.match_date)),
    [fixtures]
  );

  const { data: transfers = [] } = useQuery({
    queryKey: ['owner-bridge'],
    queryFn: async () => (await base44.functions.invoke('bridge-engine', { action: 'list' })).data.transfers,
  });
  const pending = transfers.filter(t => t.status === 'PENDING_REVIEW');
  const approved = transfers.filter(t => t.status === 'APPROVED');

  return (
    <div className="min-h-screen bg-surface">
      <RoleToolbar activeLabel={t('owner.hub')} activeIcon={KeyRound} />

      {/* Header */}
      <div className="bg-panel border-b border-hairline py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-8 w-auto" />
            <div>
              <h1 className="text-ink font-black text-xl flex items-center gap-2"><KeyRound size={16} className="text-brand" /> {t('owner.hub')}</h1>
              <p className="text-ink-muted text-xs">{myClub?.club_name ? `${myClub.club_name} · ` : ''}{t('owner.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Stat icon={CalendarDays} label={t('owner.upcomingGames')} value={upcoming.length} color="text-sky-400" />
            <Stat icon={GitMerge} label={t('owner.pendingTransfers')} value={pending.length} color="text-amber-400" />
            <Stat icon={CheckCircle2} label={t('owner.approvedTransfers')} value={approved.length} color="text-green-400" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* מערכות — מחולקות לפי קטגוריות: מקצועית / טכנית / בירוקרטית / תוכנה */}
        {CATEGORIES.map(cat => {
          const items = SYSTEMS.filter(s => s.cat === cat.id);
          if (!items.length) return null;
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-4">
                <cat.icon size={16} style={{ color: cat.color }} />
                <div>
                  <h2 className="text-ink font-black text-base">{t(cat.title)}</h2>
                  <p className="text-ink-muted text-[11px]">{t(cat.sub)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(s => (
                  <Link key={s.path} to={s.path}
                    className="bg-panel border border-hairline hover:border-brand-line rounded-lg p-4 flex items-center gap-3 transition-colors group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}40` }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-ink font-bold text-sm">{t(s.label)}</div>
                    </div>
                    <ArrowRight size={14} className="text-ink-faint group-hover:text-brand transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* לו״ז מאוחד */}
        <section>
          <SectionTitle icon={CalendarDays} title={t('owner.unifiedSchedule')} sub={t('owner.unifiedScheduleSub')} />
          {loadingFx ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" /></div> : <UnifiedSchedule fixtures={upcoming} />}
        </section>

        {/* גשר נוער מקצועני */}
        <section>
          <SectionTitle icon={GitMerge} title={t('owner.bridgeManagement')} sub={t('owner.bridgeManagementSub')} />
          <BridgeSummary pending={pending.slice(0, 5)} approved={approved.slice(0, 5)} />
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-panel-alt border border-hairline rounded-lg px-3 py-2 flex items-center gap-2">
      <Icon size={14} className={color} />
      <div>
        <div className={`font-black text-sm ${color}`}>{value}</div>
        <div className="text-ink-faint text-[9px]">{label}</div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-brand" />
      <div>
        <h2 className="text-ink font-black text-base">{title}</h2>
        <p className="text-ink-muted text-[11px]">{sub}</p>
      </div>
    </div>
  );
}

function UnifiedSchedule({ fixtures }) {
  if (!fixtures.length) return <div className="bg-panel border border-hairline rounded-lg p-8 text-center text-ink-faint text-sm">אין משחקים מתוכננים בקרוב.</div>;
  return (
    <div className="bg-panel border border-hairline rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-ink-muted text-[10px] bg-panel-alt">
            <tr className="border-b border-hairline">
              <th className="text-right py-2.5 px-3">תאריך</th>
              <th className="text-center">שעה</th>
              <th className="text-right">מועדון/ליגה</th>
              <th className="text-right">מפגש</th>
              <th className="text-right">מגרש</th>
              <th className="text-right">שנתון</th>
              <th className="text-center">שופט</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.slice(0, 40).map(f => (
              <tr key={f.id} className="border-b border-hairline text-ink hover:bg-panel-alt transition-colors">
                <td className="py-2.5 px-3 text-ink-muted whitespace-nowrap">{new Date(f.match_date).toLocaleDateString('he-IL', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="text-center font-bold text-brand">{f.kickoff_time || '—'}</td>
                <td className="text-right text-ink-muted">{f.club_name || '—'}</td>
                <td className="text-right font-bold whitespace-nowrap">{f.home_team} <span className="text-ink-faint mx-1">נגד</span> {f.away_team}</td>
                <td className="text-right text-ink-muted"><MapPin size={10} className="inline ml-1" />{f.stadium_name || '—'}</td>
                <td className="text-right text-ink-muted">{f.age_group || '—'}</td>
                <td className="text-center">
                  {f.referee_status === 'CONFIRMED'
                    ? <span className="text-[9px] font-bold text-green-400 bg-green-400/10 border border-green-400/30 px-1.5 py-0.5 rounded-full">אושר</span>
                    : <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full">ממתין</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fixtures.length > 40 && <div className="px-3 py-2 text-ink-faint text-[10px] border-t border-hairline">מציג 40 מתוך {fixtures.length} משחקים מתוכננים.</div>}
    </div>
  );
}

function BridgeSummary({ pending, approved }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-panel border border-hairline rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-400" /><span className="text-ink font-bold text-sm">ממתינים לאישור ({pending.length})</span></div>
          <Link to="/bridge" className="text-brand text-[11px] font-bold hover:underline">ניהול מלא ←</Link>
        </div>
        {pending.length === 0 ? <div className="text-ink-faint text-xs py-4 text-center">אין צינורות ממתינים.</div> : pending.map(t => (
          <div key={t.id} className="flex items-center justify-between py-2 border-b border-hairline last:border-0 text-xs">
            <div><span className="text-ink font-bold">{t.player_name}</span> <span className="text-ink-faint mx-1">→</span> <span className="text-ink-muted">{t.target_club_name || '—'}</span></div>
            <span className="text-ink-faint text-[10px]">{CLASSIFICATION_LABELS[t.source_org_classification] || t.source_org_classification}</span>
          </div>
        ))}
      </div>
      <div className="bg-panel border border-hairline rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-400" /><span className="text-ink font-bold text-sm">אושרו לאחרונה ({approved.length})</span></div>
          <Link to="/bridge" className="text-brand text-[11px] font-bold hover:underline">כל הצינורות ←</Link>
        </div>
        {approved.length === 0 ? <div className="text-ink-faint text-xs py-4 text-center">אין מעברים שאושרו עדיין.</div> : approved.map(t => (
          <div key={t.id} className="flex items-center justify-between py-2 border-b border-hairline last:border-0 text-xs">
            <div><span className="text-ink font-bold">{t.player_name}</span> <span className="text-ink-faint mx-1">←</span> <span className="text-ink-muted">{t.source_org_name || '—'}</span></div>
            <span className="text-green-400 text-[10px]">מוכן להתאחדות</span>
          </div>
        ))}
      </div>
    </div>
  );
}