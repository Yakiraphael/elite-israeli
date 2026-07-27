// מטריצת תקינות ואכיפה מול ההתאחדות לכדורגל בישראל (IFA Compliance Matrix).
// ארבעה מדדי חובה: רפואי/ביטוח, כרטיס שחקן פעיל, כרטיסים והשעיות, אישורי קטינים/אפוטרופוס.
// רכיב משותף — משמש גם את המאמן (CoachWorkspace) וגם את המנהל המקצועי (DirectorDashboard).

function calcDaysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

const LIGHT_CLASS = {
  green: 'text-green-400',
  yellow: 'text-amber-400',
  red: 'text-red-400',
};

// רף השעיית צהובים (סכנת השעיה לאחר מכסה תקנונית — בד"כ 5 צהובים = השעיה 1 משחק)
const YELLOW_CARD_THRESHOLD = 5;

function computeMedical(p) {
  if (!p.medical_certificate_url) return { light: 'red', label: '🔴 חסר אישור' };
  const d = calcDaysLeft(p.medical_expiry_date);
  if (d === null) return { light: 'green', label: '🟢 בתוקף' };
  if (d < 0) return { light: 'red', label: '🔴 פג תוקף' };
  if (d < 14) return { light: 'yellow', label: `🟡 ${d} ימים לפקיעה` };
  return { light: 'green', label: '🟢 בתוקף' };
}

function computeRegistration(p) {
  if (p.ifa_registration_status === 'Under Contract' || p.ifa_registration_status === 'Free Agent') {
    return { light: 'green', label: '🟢 רשום ופעיל' };
  }
  return { light: 'red', label: '🔴 טרם הושלם רישום' };
}

function computeDiscipline(p) {
  if (p.is_suspended) return { light: 'red', label: '🔴 מושעה רשמית' };
  const yc = p.yellow_cards_count || 0;
  if (yc >= YELLOW_CARD_THRESHOLD) return { light: 'yellow', label: `🟡 ${yc} צהובים — סכנת השעיה` };
  return { light: 'green', label: '🟢 כשיר משמעתית' };
}

function computeLegal(p) {
  const lt = p.legal_terms_accepted || {};
  const base = !!(lt.platform_terms && lt.digital_power_of_attorney && lt.medical_waiver && lt.media_consent && lt.club_bylaws);
  if (p.is_adult) {
    return base
      ? { light: 'green', label: '🟢 חתום ומאוחסן' }
      : { light: 'red', label: '🔴 חסר אישור משפטי' };
  }
  const guardian = !!(p.guardian_name && p.guardian_id && p.id_suffix_url && lt.digital_power_of_attorney);
  return (base && guardian)
    ? { light: 'green', label: '🟢 חתום ע"י אפוטרופוס' }
    : { light: 'red', label: '🔴 חסרה חתימת הורה / מסמך קטין' };
}

export default function IfaComplianceMatrix({ players, showPosition = false }) {
  const rows = (players || []).map(p => {
    const medical = computeMedical(p);
    const registration = computeRegistration(p);
    const discipline = computeDiscipline(p);
    const legal = computeLegal(p);
    // חיווי שורה אדום אם מדד רפואי אדום (חסימת סגל מיידית)
    const rowAlert = medical.light === 'red';
    return { player: p, medical, registration, discipline, legal, rowAlert };
  });

  const colSpan = showPosition ? 6 : 5;

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-xs">
        <thead className="bg-[#1B263B]">
          <tr>
            <th className="text-white/40 font-bold py-3 px-3 text-right whitespace-nowrap">שם שחקן</th>
            {showPosition && <th className="text-white/40 font-bold py-3 px-3 text-right whitespace-nowrap">עמדה</th>}
            <th className="text-white/40 font-bold py-3 px-3 text-right whitespace-nowrap">🩺 רפואי / ביטוח</th>
            <th className="text-white/40 font-bold py-3 px-3 text-right whitespace-nowrap">🪪 כרטיס שחקן פעיל</th>
            <th className="text-white/40 font-bold py-3 px-3 text-right whitespace-nowrap">🟨 משמעת / השעיות</th>
            <th className="text-white/40 font-bold py-3 px-3 text-right whitespace-nowrap">⚖️ משפטי / אפוטרופוס</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.player.id}
              className={`border-t border-white/5 hover:bg-white/2 transition-colors ${r.rowAlert ? 'bg-red-500/5' : ''}`}>
              <td className="py-3 px-3 whitespace-nowrap">
                <div className="text-white font-bold">{r.player.full_name}</div>
                {r.player.team_name && <div className="text-white/30 text-[10px]">{r.player.team_name}</div>}
              </td>
              {showPosition && <td className="py-3 px-3 text-white/50 whitespace-nowrap">{r.player.position}</td>}
              <td className={`py-3 px-3 whitespace-nowrap ${LIGHT_CLASS[r.medical.light]}`}>{r.medical.label}</td>
              <td className={`py-3 px-3 whitespace-nowrap ${LIGHT_CLASS[r.registration.light]}`}>{r.registration.label}</td>
              <td className={`py-3 px-3 whitespace-nowrap ${LIGHT_CLASS[r.discipline.light]}`}>{r.discipline.label}</td>
              <td className={`py-3 px-3 whitespace-nowrap ${LIGHT_CLASS[r.legal.light]}`}>{r.legal.label}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={colSpan} className="text-center py-8 text-white/30">אין נתונים להצגה</td></tr>
          )}
        </tbody>
      </table>

      <div className="px-3 py-2 bg-[#1B263B] border-t border-white/5 flex items-center gap-3 text-[10px] text-white/40 flex-wrap">
        <span className="text-white/30">מקרא רמזורים:</span>
        <span className="text-green-400">🟢 תקין</span>
        <span className="text-amber-400">🟡 התראה (ימים לפקיעה / סכנת השעיה)</span>
        <span className="text-red-400">🔴 חסר / פג תוקף / מושעה — חסימה מיידית מהסגל</span>
      </div>
    </div>
  );
}