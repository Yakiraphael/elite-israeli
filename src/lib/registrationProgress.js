// Computes the "submission status" progress percentage for a player's onboarding file,
// per the club-onboarding funnel spec (Personal → Health → Legal → Scouting Context).
export function computeSubmissionProgress(player) {
  const isAdult = !!player.is_adult;
  const checks = [
    !!(player.full_name && player.id_number && player.birth_date && player.phone && player.position),
    isAdult || !!(player.guardian_name && player.guardian_id && player.parent_phone && player.parent_email),
    !!player.medical_certificate_url,
    !!player.health_declaration_completed,
    !!player.insurance_ack,
    !!player.id_document_url,
    isAdult || !!player.id_suffix_url,
    !!(player.legal_terms_accepted && Object.values(player.legal_terms_accepted).filter(Boolean).length >= (isAdult ? 4 : 5)),
    !!player.digital_signature,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function getProgressStage(pct) {
  if (pct >= 100) return { label: 'שחקן פעיל — מוכן למשחק', color: '#10B981', key: 'ready' };
  if (pct >= 25) return { label: 'הועלו מסמכים — ממתין לאימות', color: '#F59E0B', key: 'pending_verification' };
  return { label: 'נרשם — ממתין למסמכים', color: '#EF4444', key: 'awaiting_docs' };
}