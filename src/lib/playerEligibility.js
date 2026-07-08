// Coach-facing eligibility engine — combines medical, regulatory and discipline compliance
// into a single traffic-light status, per the club's match-day readiness spec.
export function calcDaysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function isLegalComplete(player) {
  const accepted = player.legal_terms_accepted || {};
  const count = Object.values(accepted).filter(Boolean).length;
  return count >= (player.is_adult ? 4 : 5);
}

function isEquipmentComplete(player) {
  const eq = player.equipment_size || {};
  return !!(eq.shirt && eq.pants && eq.shoe);
}

// Returns { color: 'green'|'yellow'|'red', eligible: boolean, reasons: [{color, msg, category}] }
export function computeEligibility(player) {
  const reasons = [];
  let color = 'green';
  const flag = (c, msg, category) => {
    reasons.push({ color: c, msg, category });
    if (c === 'red') color = 'red';
    else if (c === 'yellow' && color !== 'red') color = 'yellow';
  };

  // 1. Medical readiness
  if (!player.medical_certificate_url) {
    flag('red', 'חסר אישור רפואי בתוקף', 'medical');
  } else {
    const days = calcDaysLeft(player.medical_expiry_date);
    if (days !== null && days < 0) flag('red', 'אישור רפואי פג תוקף', 'medical');
    else if (days !== null && days < 7) flag('yellow', `אישור רפואי יפוג בעוד ${days} ימים`, 'medical');
  }
  if (player.active_injury) flag('red', player.active_injury_note ? `פציעה פעילה: ${player.active_injury_note}` : 'פציעה פעילה מדווחת', 'medical');
  if (!player.health_declaration_completed) flag('yellow', 'הצהרת בריאות לא עודכנה', 'medical');

  // 2. Regulatory readiness
  if (!player.ifa_ready) flag('red', 'כרטיס שחקן / רישום להתאחדות לא מוכן', 'regulatory');
  if ((player.yellow_cards_count || 0) >= 3) flag('red', `הרחקה — ${player.yellow_cards_count} כרטיסים צהובים`, 'regulatory');
  if (!isLegalComplete(player)) flag('red', 'חתימות הורה/אפוטרופוס (כולל אישור מדיה) חסרות', 'regulatory');

  // 3. Discipline & consistency readiness
  if ((player.consecutive_absences || 0) >= 2) flag('red', `${player.consecutive_absences} היעדרויות רצופות מאימון ללא הודעה`, 'discipline');
  if (!isEquipmentComplete(player)) flag('yellow', 'ציוד אישי (מגנים/ביגוד) לא הושלם', 'discipline');

  return { color, eligible: color !== 'red', reasons };
}