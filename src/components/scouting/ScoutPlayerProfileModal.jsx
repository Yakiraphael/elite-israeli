import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { resolveOrgContext } from '@/lib/orgProfileContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, Loader2, Save, Eye, Activity, MapPin, User, ExternalLink,
} from 'lucide-react';

// כרטיס שחקן מנקודת מבט הסקאוט/מנהל מקצועי — חיפוש פוטנציאל, ערך, יכולות על המגרש וכימיה מנטלית.
// אין כאן סטטוס רפואי או דמי חבר — רק DNA משחק, ביצועים ויומן מעקב אישי.

const PIPELINE = [
  { id: 'Watchlist', label: 'במעקב כללי' },
  { id: 'Trial', label: 'לזימון למבחנים / נבחרת אזורית' },
  { id: 'Promotion Ready', label: 'מועמד לקידום לבוגרים' },
  { id: 'Archived', label: 'ארכיון / לא רלוונטי' },
];

function calcAge(d) {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default function ScoutPlayerProfileModal({ player, onClose, onOffer }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('dna');
  const [draft, setDraft] = useState({
    scout_rating: player.scout_rating ?? null,
    scout_pipeline_status: player.scout_pipeline_status || 'Watchlist',
    scout_log: player.scout_log || '',
  });

  const update = useMutation({
    mutationFn: (data) => base44.entities.PlayerRegistration.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scouting-players'] }),
  });

  // זיהוי הסיווג הארגוני של השחקן דרך הקבוצה ← המועדון, כדי להתאים את כרטיס השחקן ומדדי הסקאוטינג.
  const { data: orgCtx = null } = useQuery({
    queryKey: ['scout-org-context', player.id, player.team_id || 'no-team'],
    queryFn: async () => {
      if (!player.team_id) return resolveOrgContext('YOUTH_DEPARTMENT');
      try {
        const team = await base44.entities.Team.get(player.team_id);
        const club = team?.club_id ? await base44.entities.Club.get(team.club_id) : null;
        return resolveOrgContext(club?.org_classification || 'YOUTH_DEPARTMENT');
      } catch {
        return resolveOrgContext('YOUTH_DEPARTMENT');
      }
    },
    staleTime: 5 * 60 * 1000,
  });
  const ctx = orgCtx || resolveOrgContext('YOUTH_DEPARTMENT');
  const tm = player.transfermarkt_data || {};

  const age = calcAge(player.birth_date);
  const minutes = player.last_match_minutes || [];
  const maxMinutes = Math.max(90, ...minutes);
  const saveLog = () => update.mutate({ scout_log: draft.scout_log });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg sm:max-w-3xl w-full max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()} dir="rtl">

        {/* HEADER — תעודת זהות מקצועית */}
        <div className="flex-shrink-0 bg-gradient-to-l from-[#0D1B2A] to-[#1B263B] border-b border-white/10 p-5">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-16 h-16 rounded-xl bg-[#D4AF37]/15 border-2 border-[#D4AF37]/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {player.avatar_url
                  ? <img src={player.avatar_url} alt={player.full_name} className="w-full h-full object-cover" />
                  : <User size={26} className="text-[#D4AF37]" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-black text-lg truncate">{player.full_name}</h3>
                {player.elite_id && <div className="text-[#D4AF37] text-xs font-bold">{player.elite_id}</div>}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {age !== null && (
                    <span className="text-[10px] text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      🎂 {player.birth_date} · גיל {age}
                    </span>
                  )}
                  {player.region && (
                    <span className="text-[10px] text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin size={9} /> {player.region}
                    </span>
                  )}
                  {player.is_free_agent && (
                    <span className="text-[10px] text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded-full">Free Agent</span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ctx.isProfessional ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'text-white/50 bg-white/5 border-white/15'}`} title="סיווג ארגוני מותאם-הקשר">
                    {ctx.label}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* עמדות + Scout Rating */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-[#0D1B2A] border border-white/10 rounded-md p-2 text-center">
              <div className="text-white/40 text-[10px]">עמדה ראשית</div>
              <div className="text-white font-bold text-sm">{player.position || '—'}</div>
            </div>
            <div className="bg-[#0D1B2A] border border-white/10 rounded-md p-2 text-center">
              <div className="text-white/40 text-[10px]">עמדה משנית</div>
              <div className="text-white font-bold text-sm">{player.secondary_position || '—'}</div>
            </div>
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-md p-2 text-center">
              <div className="text-[#D4AF37] text-[10px]">Scout Rating (1-10)</div>
              <input
                type="number" min={1} max={10}
                value={draft.scout_rating ?? ''}
                onChange={(e) => setDraft(d => ({ ...d, scout_rating: e.target.value === '' ? null : Number(e.target.value) }))}
                onBlur={() => update.mutate({ scout_rating: draft.scout_rating ?? null })}
                className="bg-transparent text-white font-bold text-sm text-center w-full outline-none placeholder-white/30"
                placeholder="—"
              />
            </div>
            <div className="bg-[#0D1B2A] border border-white/10 rounded-md p-2 text-center">
              <div className="text-white/40 text-[10px]">קבוצה נוכחית</div>
              <div className="text-white font-bold text-sm truncate" title={player.team_name}>{player.team_name || '—'}</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex-shrink-0 flex gap-1 overflow-x-auto px-5 border-b border-white/10">
          {[
            { id: 'dna', label: '🧠 מנהיגות וDNA משחק' },
            { id: 'perf', label: '⚽ ביצועים על המגרש' },
            { id: 'watch', label: '🎯 יומן מעקב סקאוט' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/45 border-transparent hover:text-white/70'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* TAB A — Leadership & Game DNA */}
          {tab === 'dna' && (
            <>
              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">מדד מנהיגות ומשמעת</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-white/40 text-[10px]">🧠 ציון מנהיגות (1-5)</div>
                    <div className="text-white font-black text-2xl">
                      {typeof player.leadership_score === 'number' ? player.leadership_score : '—'}<span className="text-white/30 text-sm">/5</span>
                    </div>
                    <div className="text-white/30 text-[10px] mt-0.5">מצטבר מדיווחי מאמנים בסדנאות עיבוד</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px]">🎽 משמעת ועבודת צוות (1-10)</div>
                    <div className="text-white font-black text-2xl">
                      {typeof player.discipline_avg === 'number' ? player.discipline_avg : '—'}<span className="text-white/30 text-sm">/10</span>
                    </div>
                    <div className="text-white/30 text-[10px] mt-0.5">ממוצע דירוגים מדיווחי השטח</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">תכונות בולטות (Tags)</h4>
                {player.coach_impact_tags?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {player.coach_impact_tags.map((t, i) => (
                      <span key={i} className="text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 px-2 py-1 rounded-full">
                        #{t.replace(/\s+/g, '_')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-xs">אין תיוגים — המאמנים עדיין לא סימנו תכונות בולטות.</p>
                )}
              </div>

              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">תמצית פסיכולוגית-חינוכית</h4>
                <p className="text-white/70 text-xs leading-relaxed">
                  {player.coach_talking_point || 'אין תצפיות מהצוות החינוכי-טיפולי עד כה.'}
                </p>
                {player.season_development_goals && (
                  <p className="text-white/50 text-[11px] mt-2 pt-2 border-t border-white/10">
                    מטרות פיתוח לעונה: {player.season_development_goals}
                  </p>
                )}
              </div>
            </>
          )}

          {/* TAB B — Performance */}
          {tab === 'perf' && (
            <>
              {ctx.show.officialAppearances && (
                <div className="bg-[#0D1B2A] border border-[#D4AF37]/20 rounded-lg p-4">
                  <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">הופעות רשמיות בהתאחדות · לפי עונה</h4>
                  {tm.career_stats?.length ? (
                    <div className="space-y-1.5">
                      {tm.career_stats.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] bg-white/5 border border-white/10 rounded px-2 py-1.5">
                          <span className="text-white/70 font-bold">{s.season} · {s.club || '—'}</span>
                          <span className="text-white/50">{s.competition || ''}</span>
                          <span className="text-[#D4AF37] font-bold">{s.appearances ?? 0} הופע' · {s.goals ?? 0} שערים</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-white/30 text-xs">אין היסטוריית הופעות רשמית מסונכרנת מ-Transfermarkt.</p>}
                  {ctx.show.sellOnContribution && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-white/50">
                      דמי השבחה ומעקב חוזים · ערך שוק נוכחי: <span className="text-[#D4AF37] font-bold">{tm.market_value_current || '—'}</span>
                    </div>
                  )}
                </div>
              )}
              {ctx.show.tournamentMetrics && (
                <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                  <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">נתוני טורניר והשתתפות</h4>
                  <div className="flex items-end gap-3">
                    <div className="text-white font-black text-2xl">{player.attendance_rate ?? 0}%</div>
                    <div className="text-white/40 text-xs mb-1">נוכחות באימונים</div>
                  </div>
                  <p className="text-white/40 text-[11px] mt-2">סקאוטינג פנימי גמיש — מדדי טורניר קהילתיים והשתתפות רגילה.</p>
                </div>
              )}
              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">מדד נוכחות והתמדה</h4>
                <div className="flex items-end gap-2">
                  <div className="text-white font-black text-3xl">{player.attendance_rate ?? 0}%</div>
                  <div className="text-white/40 text-xs mb-1">נוכחות באימונים</div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full" style={{ width: `${player.attendance_rate ?? 0}%`, backgroundColor: '#D4AF37' }} />
                </div>
                {player.consecutive_absences > 0 && (
                  <div className="text-amber-400 text-[11px] mt-2">⚠️ {player.consecutive_absences} היעדרויות רצופות</div>
                )}
              </div>

              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">דקות משחק — {minutes.length} משחקים אחרונים</h4>
                {minutes.length ? (
                  <div className="flex items-end gap-3 h-24">
                    {[...minutes].reverse().map((m, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-white/60 text-[10px] font-bold">{m}'</span>
                        <div className="w-full bg-[#D4AF37]/60 rounded-t-sm" style={{ height: `${Math.max(8, (m / maxMinutes) * 72)}px` }} />
                        <span className="text-white/30 text-[9px]">#{minutes.length - i}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-xs">אין נתוני דקות משחק מתועדים — מתעדכן מהטורנירים.</p>
                )}
              </div>

              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">מדדי מפתח · מעורבות במשחק</h4>
                {player.stats ? (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                    {[
                      { l: 'PAC', v: player.stats.pac, n: 'מהירות' },
                      { l: 'SHO', v: player.stats.sho, n: 'בעיטה' },
                      { l: 'PAS', v: player.stats.pas, n: 'מסירה' },
                      { l: 'DRI', v: player.stats.dri, n: 'כדרור' },
                      { l: 'DEF', v: player.stats.def, n: 'הגנה' },
                      { l: 'PHY', v: player.stats.phy, n: 'פיזי' },
                    ].map(s => (
                      <div key={s.l} className="bg-white/5 border border-white/10 rounded p-2">
                        <div className="text-white font-black text-sm">{s.v ?? '—'}</div>
                        <div className="text-[#D4AF37] text-[9px] font-bold">{s.l}</div>
                        <div className="text-white/30 text-[9px]">{s.n}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-xs">נתוני ביצועים יתעדכנו מתוצאות טורנירים ומשחקים.</p>
                )}
              </div>
            </>
          )}

          {/* TAB C — Scout Notes & Watchlist */}
          {tab === 'watch' && (
            <>
              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">סטטוס מעקב (Pipeline)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PIPELINE.map(p => {
                    const active = draft.scout_pipeline_status === p.id;
                    return (
                      <button key={p.id}
                        onClick={() => {
                          setDraft(d => ({ ...d, scout_pipeline_status: p.id }));
                          update.mutate({ scout_pipeline_status: p.id });
                        }}
                        className={`text-xs font-bold py-2.5 rounded-md border transition-colors ${active ? 'bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]' : 'text-white/60 border-white/15 hover:border-white/40'}`}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3 flex items-center justify-between">
                  יומן מעקב אישי (Scout Log)
                  <span className="text-white/30 text-[10px] font-normal">גלוי לסקאוטים / מנהלים בלבד</span>
                </h4>
                <textarea
                  rows={5}
                  value={draft.scout_log}
                  onChange={(e) => setDraft(d => ({ ...d, scout_log: e.target.value }))}
                  placeholder="עקבתי אחריו בטורניר בקריית גת, יש לו ראיית משחק מצוינת לגיל 16, שווה לבדוק צירוף לסגל הבכיר בעונה הבאה..."
                  className="w-full bg-[#1B263B] border border-white/15 rounded px-3 py-2 text-white text-xs leading-relaxed placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none"
                />
                <button onClick={saveLog} disabled={update.isPending}
                  className="mt-2 flex items-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold px-3 py-1.5 rounded hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-50">
                  {update.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} שמור יומן
                </button>
              </div>

              <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
                <h4 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-3">קישורי מדיה / וידאו מטורנירים</h4>
                {player.media_links?.length ? (
                  <ul className="space-y-1.5">
                    {player.media_links.map((link, i) => (
                      <li key={i}>
                        <a href={link} target="_blank" rel="noopener noreferrer"
                          className="text-[#D4AF37] text-xs hover:text-amber-300 flex items-center gap-1 truncate">
                          <ExternalLink size={11} className="flex-shrink-0" /> {link.length > 70 ? `${link.slice(0, 70)}...` : link}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/30 text-xs">אין קישורי מדיה מתועדים כרגע.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 p-5 border-t border-white/10 flex items-center justify-between gap-3">
          <Link to={`/player-profile?id=${player.id}`}
            className="text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 hover:text-amber-300 transition-colors">
            <ExternalLink size={12} /> פרופיל שחקן מלא
          </Link>
          {onOffer && (
            <button onClick={onOffer}
              className="flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm px-5 py-2.5 rounded-sm hover:bg-amber-400 transition-colors">
              <Eye size={14} /> הגש הצעת חוזה
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}