// קטלוג סעיפי חוזה מובנה — מקור יחיד (Single Source of Truth) לכל הסעיפים הרשמיים בחוזה.
// משמש את התצוגה המובנית (ContractClausesView), הצעות משא ומתן, והיסטוריה, ומבטיח עקביות מול
// תקנון ההתאחדות לכדורגל. כל סעיף מקוטלג ומצוין מי רשאי לערוך אותו ישירות (= מועדון בלבד).

export const CLAUSE_CATEGORIES = [
  { id: 'engagement',  label: 'תקופת ההתקשרות',        description: 'משך החוזה, תאריכי תחילה/סיום ותקופת השאלה' },
  { id: 'salary',      label: 'תנאי שכר',                description: 'שווי חוזה שנתי, משכורת, דמי תיווך' },
  { id: 'bonuses',     label: 'מענקים ובונוסים',          description: 'בונוס השתתפות, מענק חתימה, תוספות ביצוע' },
  { id: 'sell_on',     label: 'דמי השבחה / Sell-On',      description: 'סעיף שחרור, אחוז Sell-On, דמי סולידריות' },
  { id: 'mutual',      label: 'התחייבויות הדדיות',          description: 'התחייבויות שחקן/מועדון, נאמנות, תקנון' },
];

// type משמש לבחירת אינפוט נכון; mapsToField מצביע על שדה ב-TransferProposal שמתעדכן בעת אישור.
export const CLAUSE_CATALOG = [
  // תקופת ההתקשרות
  { key: 'contract_duration', label: 'אורך חוזה (שנים)',     category: 'engagement', type: 'number', loanOnly: false },
  { key: 'loan_start_date',   label: 'תחילת תקופת השאלה',    category: 'engagement', type: 'date',   loanOnly: true,  mapsToField: 'loan_start_date' },
  { key: 'loan_end_date',     label: 'סיום תקופת השאלה',       category: 'engagement', type: 'date',   loanOnly: true,  mapsToField: 'loan_end_date' },

  // תנאי שכר
  { key: 'contract_value',    label: 'שווי חוזה שנתי (₪)',    category: 'salary',    type: 'number', mapsToField: 'contract_value',
    alsoCompute: { iefa_commission_fee: (v) => Math.round(Number(v) * 0.05 * 100) / 100 } },
  { key: 'iefa_commission_fee', label: 'עמלת תיווך IEFA (₪)', category: 'salary',    type: 'number', mapsToField: 'iefa_commission_fee' },

  // מענקים ובונוסים
  { key: 'signing_bonus',     label: 'מענק חתימה (₪)',         category: 'bonuses',   type: 'text' },
  { key: 'bonuses',           label: 'מענקים / בונוסים',         category: 'bonuses',   type: 'text' },

  // דמי השבחה / Sell-On
  { key: 'release_clause',       label: 'סעיף שחרור (Release)',    category: 'sell_on',  type: 'text' },
  { key: 'sell_on_percentage',   label: 'אחוז Sell-On ממכירה עתידית', category: 'sell_on', type: 'percent' },
  { key: 'solidarity_contribution', label: 'דמי סולידריות FIFA',    category: 'sell_on', type: 'percent' },

  // התחייבויות הדדיות
  { key: 'player_commitments', label: 'התחייבויות השחקן',     category: 'mutual', type: 'text' },
  { key: 'club_commitments',   label: 'התחייבויות המועדון',    category: 'mutual', type: 'text' },
  { key: 'club_bylaws',        label: 'אישור תקנון המועדון',   category: 'mutual', type: 'text' },

  // סעיף חופשי
  { key: 'custom',             label: 'סעיף אחר — טקסט חופשי',   category: 'mutual', type: 'text', custom: true },
];

// מפה מהירה key -> סעיף
export const CLAUSE_BY_KEY = Object.fromEntries(CLAUSE_CATALOG.map(c => [c.key, c]));

// סעיפים רלוונטיים להצעה (לפי סוג — השאלה מסתירה סעיפי תקופה שאינם loan)
export function visibleClauses(transferCategory = '') {
  const isLoan = (transferCategory || '').startsWith('השאל');
  return CLAUSE_CATALOG.filter(c => !c.loanOnly || isLoan);
}

export function clausesByCategory(transferCategory = '') {
  const list = visibleClauses(transferCategory);
  return CLAUSE_CATEGORIES
    .map(cat => ({ ...cat, clauses: list.filter(c => c.category === cat.id) }))
    .filter(g => g.clauses.length > 0);
}

// ערך נוכחי של סעיף מתוך ההצעה (עמדת המועדון הראשונית). סעיפים ללא mapsToField אינם נקבעו עדיין.
export function currentClauseValue(clauseKey, proposal = {}) {
  const def = CLAUSE_BY_KEY[clauseKey];
  if (!def || !def.mapsToField) return '';
  const v = proposal[def.mapsToField];
  return v == null ? '' : String(v);
}

// פורמט תצוגה ידידותי
export function formatClauseValue(clauseKey, value) {
  const def = CLAUSE_BY_KEY[clauseKey];
  if (!def || value === '' || value == null) return '';
  if (def.type === 'percent') return `${value}%`;
  return String(value);
}

// בונה מצב מלא לכל סעיף (מאחד את הקטלוג עם היסטוריית המשא ומתן).
// requests: NegotiationRequest[] עבור ההצעה. מחזיר מערך מקובץ לפי קטגוריה.
export function buildFullClauseMatrix(requests = [], proposal = {}) {
  return CLAUSE_CATEGORIES.map(cat => {
    const clauses = visibleClauses(proposal.transfer_category)
      .filter(c => c.category === cat.id)
      .map(def => {
        const key = def.key;
        const history = requests
          .filter(r => (r.clause_key || 'custom') === key || (key === 'custom' && r.clause_key === 'custom' && !!r.clause_label && r.clause_label === def.label))
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        const latest = history[history.length - 1] || null;
        return {
          def,
          clauseKey: key,
          clauseLabel: def.label,
          clubValue: currentClauseValue(key, proposal),
          latestProposal: latest?.proposed_value || '',
          latestStatus: latest?.status || (currentClauseValue(key, proposal) ? 'accepted' : 'pending'),
          latestReasoning: latest?.reasoning || '',
          lastActor: latest?.sender_name || '',
          lastActorRole: latest?.sender_role || 'club',
          respondedAt: latest?.responded_at || '',
          directorNotes: latest?.director_notes || '',
          history,
        };
      });
    return { ...cat, clauses };
  });
}