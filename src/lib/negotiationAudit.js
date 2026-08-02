// מנוע משא ומתן שקוף — הרשאות תפקידים, בניית ציר זמן (Audit Trail) ומצב סעיפים.
// כל פעולה מתועדת עם "Logged By" כדי להבטיח שקיפות מלאה בין המועדון לשחקן/אפוטרופוס.

// הרשאות עריכה קשיחות לפי תפקיד — רק המועדון רשאי לערוך/לאשר סופית; השחקן/אפוטרופוס רשאים רק להציע ולצפות.
export const NEGOTIATION_ROLES = {
  club:     { canEdit: true, canApprove: true, canPropose: true, label: 'מועדון (מנהל מקצועי)' },
  player:   { canEdit: false, canApprove: false, canPropose: true, label: 'שחקן' },
  guardian: { canEdit: false, canApprove: false, canPropose: true, label: 'אפוטרופוס' },
  manager:  { canEdit: false, canApprove: false, canPropose: true, label: 'מנהל אישי' },
};

export function canRole(role, action) {
  const r = NEGOTIATION_ROLES[role] || NEGOTIATION_ROLES.player;
  return !!(r[action]);
}

// בונה ציר זמן כרונולוגי של כל פעולה במשא ומתן מתוך רשימת NegotiationRequest + מצב ההצעה.
// כל אירוע כולל "Logged By" — מי בדיוק הציע/אישר/דחה/ערך את הסעיף.
export function buildNegotiationTimeline(requests = [], proposal = {}) {
  const events = [];

  // אירוע יצירת טיוטת ההסכם עצמה (ההצעה הראשונית של המועדון)
  if (proposal.created_date) {
    events.push({
      id: `${proposal.id}-draft`,
      type: 'draft',
      ts: proposal.created_date,
      loggedBy: 'מועדון (הנהלה)',
      loggedByRole: 'club',
      clause: 'טיוטת ההסכם הראשונית',
      detail: `נוצרה טיוטת הסכם ראשונית${proposal.transfer_category ? ` · ${proposal.transfer_category}` : ''}`,
    });
  }

  requests.forEach((r) => {
    // אירוע הצעת שחקן/מנהל אישי
    events.push({
      id: `${r.id}-propose`,
      type: 'propose',
      ts: r.created_date,
      loggedBy: r.sender_role === 'manager' ? `מנהל אישי — ${r.sender_name || ''}`.trim() : `שחקן — ${r.sender_name || ''}`.trim(),
      loggedByRole: r.sender_role || 'player',
      clause: r.clause_label,
      clauseKey: r.clause_key,
      detail: `הציע: ${r.proposed_value || '—'} (ערך נוכחי: ${r.current_value || '—'})`,
      reasoning: r.reasoning,
    });
    // אירוע תגובת המועדון (אישור/דחייה)
    if (r.status !== 'pending' && r.responded_at) {
      events.push({
        id: `${r.id}-respond`,
        type: r.status,
        ts: r.responded_at,
        loggedBy: 'מועדון (מנהל מקצועי)',
        loggedByRole: 'club',
        clause: r.clause_label,
        clauseKey: r.clause_key,
        detail: r.status === 'accepted'
          ? `סעיף אושר ויושם אוטומטית: ${r.proposed_value || '—'}`
          : 'הצעה נדחתה',
        notes: r.director_notes,
      });
    }
  });

  events.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  return events;
}

// בונה מצב "מסלול התנגשות" לכל סעיף — עמדת המועדון (current) מול הצעת השחקן (latest) וסטטוס.
export function buildClauseMatrix(requests = [], proposal = {}) {
  const byClause = new Map();
  // הערכים הנוכחיים מתוך ההצעה עצמה = עמדת המועדון
  const currentValues = {
    contract_value: proposal.contract_value != null ? String(proposal.contract_value) : '',
    iefa_commission_fee: proposal.iefa_commission_fee != null ? String(proposal.iefa_commission_fee) : '',
    loan_start_date: proposal.loan_start_date || '',
    loan_end_date: proposal.loan_end_date || '',
    contract_duration: '',
    release_clause: '',
    bonuses: '',
    custom: '',
  };

  requests.forEach((r) => {
    const key = r.clause_key || r.clause_label || 'custom';
    if (!byClause.has(key)) {
      byClause.set(key, {
        clauseKey: key,
        clauseLabel: r.clause_label || key,
        clubValue: currentValues[key] != null ? currentValues[key] : (r.current_value || ''),
        latestProposal: r.proposed_value || '',
        latestStatus: r.status,
        latestReasoning: r.reasoning || '',
        history: [],
      });
    }
    const c = byClause.get(key);
    c.history.push({ proposed: r.proposed_value, status: r.status, ts: r.created_date, reasoning: r.reasoning, notes: r.director_notes });
    // עדכן אחרון
    if (!c.latestProposal || new Date(r.created_date) > new Date(c.latestTs || 0)) {
      c.latestProposal = r.proposed_value || '';
      c.latestStatus = r.status;
      c.latestReasoning = r.reasoning || '';
      c.latestTs = r.created_date;
    }
  });

  return Array.from(byClause.values()).sort((a, b) => a.clauseLabel.localeCompare(b.clauseLabel, 'he'));
}