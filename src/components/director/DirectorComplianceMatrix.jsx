import { useState, Fragment } from 'react';
import {
  ChevronDown, ChevronUp, Phone, Mail, ShieldCheck,
  Building2, FileText, MapPin, AlertTriangle, Send, ShieldAlert, CheckCircle2, XCircle
} from 'lucide-react';
import { computePlayerIfaCompliance } from '@/lib/documentPackages';

// מטריצת תאימות רגולטורית מורחבת למנהל המקצועי — כל מדדי החובה לכל שחקן בטבלה אחת:
// רפואי/ביטוח · רישום IFA · חוזה בתוקף · משמעת · משפטי/אפוטרופוס · פציעה פעילה ·
// זמינות · כרטיסים צהובים · פרטי קשר — עם שורה מתפרקת לפירוט נוסף.

function calcDaysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

const TC = { green: 'text-green-400', yellow: 'text-amber-400', red: 'text-red-400', gray: 'text-white/40' };
const THRESHOLD_YC = 5;

function medStatus(p) {
  if (!p.medical_certificate_url) return { light: 'red', short: 'חסר', title: 'חסר אישור רפואי' };
  const d = calcDaysLeft(p.medical_expiry_date);
  if (d === null) return { light: 'green', short: 'בתוקף', title: 'בתוקף (ללא תאריך פקיעה)' };
  if (d < 0) return { light: 'red', short: 'פג', title: `פג תוקף לפני ${-d} ימים` };
  if (d < 14) return { light: 'yellow', short: `${d}י`, title: `${d} ימים לפקיעה` };
  return { light: 'green', short: 'בתוקף', title: `${d} ימים לפקיעה` };
}
function regStatus(p) {
  if (p.ifa_registration_status === 'Under Contract') return { light: 'green', short: 'רשום', title: 'רשום תחת חוזה פעיל' };
  if (p.ifa_registration_status === 'Free Agent') return { light: 'yellow', short: 'חופשי', title: 'שחקן חופשי — ללא חוזה פעיל' };
  return { light: 'red', short: 'טרם', title: 'טרם הושלם רישום בהתאחדות הרשמית' };
}
function contractStatus(p) {
  if (!p.contract_end_date) return { light: 'gray', short: '—', title: 'לא הוגדר תאריך חוזה' };
  const d = calcDaysLeft(p.contract_end_date);
  if (d === null) return { light: 'gray', short: '—', title: 'תאריך שגוי' };
  if (d < 0) return { light: 'red', short: 'פג', title: `חוזה פג לפני ${-d} ימים` };
  if (d < 30) return { light: 'yellow', short: `${d}י`, title: `${d} ימים לסיום חוזה` };
  return { light: 'green', short: `${d}י`, title: `${d} ימים לסיום חוזה` };
}
function discStatus(p) {
  if (p.is_suspended) return { light: 'red', short: 'מושעה', title: 'מושעה רשמית מפעילות' };
  const yc = p.yellow_cards_count || 0;
  if (yc >= THRESHOLD_YC) return { light: 'yellow', short: `${yc}🟨`, title: `${yc} צהובים — סכנת השעיה אוטומטית` };
  return { light: 'green', short: 'כשיר', title: 'כשיר משמעתית' };
}
function legalStatus(p) {
  const lt = p.legal_terms_accepted || {};
  const base = !!(lt.platform_terms && lt.digital_power_of_attorney && lt.medical_waiver && lt.media_consent && lt.club_bylaws);
  if (p.is_adult) return base ? { light: 'green', short: 'חתום', title: 'אישורים משפטיים נשמרו' } : { light: 'red', short: 'חסר', title: 'חסר אישור משפטי' };
  const guardian = !!(p.guardian_name && p.guardian_id && p.id_suffix_url && lt.digital_power_of_attorney);
  return (base && guardian) ? { light: 'green', short: 'אפוטרופוס', title: 'חתום ומאומת ע"י אפוטרופוס' } : { light: 'red', short: 'חסר', title: 'חסרה חתימת הורה / מסמך קטין' };
}
function injuryStatus(p) {
  if (!p.active_injury) return { light: 'green', short: '✓', title: 'ללא פציעה פעילה מדווחת' };
  return { light: 'red', short: '🤕', title: p.active_injury_note || 'פציעה פעילה מדווחת' };
}
function availStatus(p) {
  if (p.is_suspended) return { light: 'red', short: 'חסום', title: 'מושעה מפעילות' };
  if (!p.is_available_next_match) return { light: 'yellow', short: 'לא זמין', title: p.unavailability_reason || 'לא זמין למשחק הבא' };
  return { light: 'green', short: 'זמין', title: 'זמין למשחק הבא' };
}
function ycStatus(p) {
  const yc = p.yellow_cards_count || 0;
  if (yc >= THRESHOLD_YC) return { light: 'yellow', short: `${yc}`, title: `${yc} צהובים — סכנת השעיה אוטומטית` };
  if (yc >= 3) return { light: 'yellow', short: `${yc}`, title: `${yc} צהובים` };
  return { light: 'green', short: `${yc}`, title: `${yc} צהובים` };
}

function Indicator({ s }) {
  return (
    <span className={`${TC[s.light]} text-[11px] font-bold whitespace-nowrap`} title={s.title}>
      {s.short}
    </span>
  );
}

export default function DirectorComplianceMatrix({ players = [], viewerRole = 'director', contracts = [], onTriggerPackage }) {
  const [expanded, setExpanded] = useState({});
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const allRows = players.map(p => {
    const m = medStatus(p), r = regStatus(p), c = contractStatus(p), d = discStatus(p);
    const l = legalStatus(p), i = injuryStatus(p), a = availStatus(p), yc = ycStatus(p);
    const rowAlert = m.light === 'red' || p.is_suspended || i.light === 'red' || c.light === 'red';
    // פרופיל מסמכים מלא — חישוב השלמת 4 מדדי חובה לפי הוראה 2.
    let profileDone = 0;
    if (p.elite_id || p.ifa_id || p.ifa_player_id) profileDone++;
    if (m.light === 'green') profileDone++;
    if (l.light === 'green') profileDone++;
    if ((c.light === 'green' || c.light === 'yellow') || r.light === 'green') profileDone++;
    const profile = Math.round((profileDone / 4) * 100);
    return { player: p, m, r, c, d, l, i, a, yc, profile, rowAlert };
  });

  const alertCount = allRows.filter(r => r.rowAlert).length;
  const rows = onlyAlerts ? allRows.filter(r => r.rowAlert) : allRows;

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const headers = [
    { key: 'player', label: 'שם שחקן', wide: true },
    { key: 'age', label: 'גיל' },
    { key: 'team', label: 'קבוצה / ליגה', wide: true },
    { key: 'med', label: '🩺 רפואי' },
    { key: 'reg', label: '🪪 IFA' },
    { key: 'contract', label: '📄 חוזה' },
    { key: 'disc', label: '🟨 משמעת' },
    { key: 'legal', label: '⚖️ משפטי' },
    { key: 'injury', label: '🤕 פציעה' },
    { key: 'avail', label: '🎯 זמין' },
    { key: 'yc', label: '🟨' },
    { key: 'profile', label: '📊 תיק' },
    { key: 'ifa_id', label: 'IFA ID' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-[#1B263B] border border-white/10 rounded-lg px-4 py-2.5">
        <label className="flex items-center gap-2 text-white/70 text-xs cursor-pointer select-none">
          <input type="checkbox" checked={onlyAlerts} onChange={e => setOnlyAlerts(e.target.checked)} className="accent-[#D4AF37] w-3.5 h-3.5" />
          הצג שחקנים לא תקינים בלבד
          {alertCount > 0 && <span className="text-red-400 font-bold">({alertCount})</span>}
        </label>
        <span className="text-white/40 text-[10px]">{rows.length} מתוך {allRows.length} שחקנים מוצגים</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-xs">
        <thead className="bg-[#1B263B]">
          <tr>
            {headers.map(h => (
              <th key={h.key} className={`text-white/40 font-bold py-3 px-2 text-right whitespace-nowrap border-r border-white/5 last:border-0 ${h.wide ? 'min-w-[140px]' : ''}`}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} className="text-center py-8 text-white/30">אין נתונים להצגה</td></tr>
          )}
          {rows.map(r => (
            <Fragment key={r.player.id}>
              <tr
                onClick={() => toggle(r.player.id)}
                className={`border-t border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer ${r.rowAlert ? 'bg-red-500/5' : ''}`}>
                <td className="py-3 px-2 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {expanded[r.player.id] ? <ChevronUp size={11} className="text-white/40 flex-shrink-0" /> : <ChevronDown size={11} className="text-white/40 flex-shrink-0" />}
                    <div>
                      <div className="text-white font-bold">{r.player.full_name}</div>
                      {r.player.position && <div className="text-white/30 text-[10px]">{r.player.position}</div>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 whitespace-nowrap">
                  <span className={`text-[11px] font-bold ${r.player.is_adult ? 'text-blue-400' : 'text-amber-400'}`}>
                    {r.player.is_adult ? 'בוגר' : 'קטין'}
                  </span>
                </td>
                <td className="py-3 px-2 whitespace-nowrap">
                  {r.player.team_name ? (
                    <div>
                      <div className="text-white/80 text-[11px] font-bold">{r.player.team_name}</div>
                      {r.player.league_name && <div className="text-white/40 text-[10px]">{r.player.league_name}</div>}
                    </div>
                  ) : <span className="text-white/30">—</span>}
                </td>
                <td className="py-3 px-2"><Indicator s={r.m} /></td>
                <td className="py-3 px-2"><Indicator s={r.r} /></td>
                <td className="py-3 px-2"><Indicator s={r.c} /></td>
                <td className="py-3 px-2"><Indicator s={r.d} /></td>
                <td className="py-3 px-2"><Indicator s={r.l} /></td>
                <td className="py-3 px-2"><Indicator s={r.i} /></td>
                <td className="py-3 px-2"><Indicator s={r.a} /></td>
                <td className="py-3 px-2"><Indicator s={r.yc} /></td>
                <td className="py-3 px-2 whitespace-nowrap">
                  <ProfileCompletionBar pct={r.profile} />
                </td>
                <td className="py-3 px-2 whitespace-nowrap" dir="ltr">
                  <span className="text-white/60 text-[10px]">{r.player.ifa_id || r.player.ifa_player_id || '—'}</span>
                </td>
              </tr>
              {expanded[r.player.id] && (
                <tr>
                  <td colSpan={headers.length} className="bg-[#0D1B2A]/60 p-4 border-t-0">
                    <DetailRow player={r.player} contracts={contracts} viewerRole={viewerRole} onTriggerPackage={onTriggerPackage} rowAlert={r.rowAlert} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      <div className="px-3 py-2 bg-[#1B263B] border-t border-white/5 flex items-center gap-3 text-[10px] text-white/40 flex-wrap">
          <span className="text-white/30">מקרא רמזורים:</span>
          <span className="text-green-400">🟢 תקין</span>
          <span className="text-amber-400">🟡 התראה (ימים לפקיעה / סכנת השעיה)</span>
          <span className="text-red-400">🔴 חסר / פג תוקף / מושעה — חסימה מיידית מהסגל</span>
          <span className="text-white/40">· 📊 תיק = פרופיל מסמכים מלא (4 מדדי חובה)</span>
          <span className="text-white/40">· לחץ על שורה לפירוט מלא</span>
        </div>
      </div>
    </div>
  );
}

function ProfileCompletionBar({ pct }) {
  const color = pct === 100 ? '#22c55e' : pct >= 75 ? '#facc15' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const label = pct === 100 ? '🟢' : pct >= 75 ? '🟡' : '🔴';
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0" title={`פרופיל מסמכים: ${pct}% השלמה`}>
      <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold whitespace-nowrap" style={{ color }}>{label} {pct}%</span>
    </div>
  );
}

function DetailRow({ player, contracts = [], viewerRole = 'director', onTriggerPackage, rowAlert }) {
  const compliance = computePlayerIfaCompliance(player, contracts);
  const missingChecks = compliance.checks.filter(c => !c.passed);
  const facts = [
    { icon: Phone, label: 'טלפון שחקן', value: player.phone, dir: 'ltr' },
    { icon: Mail, label: 'מייל מנהל אישי', value: player.manager_email, dir: 'ltr' },
    { icon: Phone, label: 'טלפון הורה', value: player.parent_phone, dir: 'ltr' },
    { icon: Mail, label: 'מייל הורה', value: player.parent_email, dir: 'ltr' },
    { icon: ShieldCheck, label: 'אפוטרופוס', value: player.guardian_name },
    { icon: Building2, label: 'מועדון נוכחי', value: player.team_name },
    { icon: MapPin, label: 'אזור פעילות', value: player.region },
    { icon: FileText, label: 'מסמכים מצורפים', value: (player.documents || []).length > 0 ? `${player.documents.length} מסמכים` : null },
  ].filter(f => f.value);
  return (
    <div className="space-y-4">
      {/* דרישות חסרות לפי IFA — תיק אישי */}
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-1.5 text-white/70 text-xs font-bold">
            <ShieldAlert size={13} className="text-amber-400 flex-shrink-0" />
            תיק IFA אישי — {compliance.completed}/{compliance.total} הושלמו ({compliance.pct}%)
          </div>
          {onTriggerPackage && missingChecks.length > 0 && (
            <button
              onClick={() => onTriggerPackage(player)}
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-bold px-2.5 py-1.5 rounded border border-amber-500/30 transition-colors flex-shrink-0"
            >
              <Send size={11} /> שלח חבילת השלמה
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {compliance.checks.map(c => (
            <div key={c.key} className={`flex items-center gap-2 text-[11px] ${c.passed ? 'text-green-400' : 'text-red-400'}`}>
              {c.passed ? <CheckCircle2 size={12} className="flex-shrink-0" /> : <XCircle size={12} className="flex-shrink-0" />}
              <span className="font-bold">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* תצוגת מנהל מקצועי — שערים מוסדיים (רלוונטי לדירקטור בלבד) */}
      {viewerRole === 'director' && (
        <div className="flex items-start gap-2 text-[10px] text-white/50 bg-white/[0.02] border border-white/5 rounded-md p-2">
          <AlertTriangle size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <span>
            שערים מוסדיים נוספים (רישום עונתי, בקרת העברות) נבדקים בלשונית "חבילות מסמכים משפטיים".
            שחקן זה {missingChecks.length > 0
              ? <span className="text-red-400 font-bold">חסום מהסגל הרשמי</span>
              : <span className="text-green-400 font-bold">עומד בדרישות האישיות</span>} לפי תיק IFA.
          </span>
        </div>
      )}

      {/* פרטי קשר */}
      {facts.length === 0 ? (
        <div className="text-white/30 text-xs">אין פרטי קשר נוספים לשחקן זה</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {facts.map(f => (
            <div key={f.label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                <f.icon size={12} className="text-[#D4AF37]" />
              </div>
              <div className="min-w-0">
                <div className="text-white/40 text-[10px]">{f.label}</div>
                <div className="text-white text-xs font-bold truncate" dir={f.dir || 'rtl'}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}