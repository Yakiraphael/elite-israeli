import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, ShieldAlert, FileText, Gavel, UserCog, Baby, PenLine,
  CheckCircle2, XCircle, AlertTriangle, ExternalLink, Loader2, Fingerprint, ScrollText,
} from 'lucide-react';
import { computePlayerIfaCompliance } from '@/lib/documentPackages';

// תיק משפטי — ריכוז כל הנתונים המשפטיים/רגולטוריים של שחקן לאימות מול ההתאחדות והמערך.
// מיועד למנהל מקצועי בלבד: תנאים משפטיים, אפוטרופוס, חתימות, מסמכים, חוזים, היסטוריית העברות, סטטוס רישום IFA ואימות זהות.

const SECTION = 'border border-white/10 rounded-lg bg-[#0D1B2A]/60 p-4 space-y-3';
const SECTION_TITLE = 'flex items-center gap-2 text-white font-black text-sm';

function calcDaysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

function StatusPill({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${ok ? 'text-green-400 bg-green-500/10 border-green-500/25' : 'text-red-400 bg-red-500/10 border-red-500/25'}`}>
      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {label}
    </span>
  );
}

function Row({ label, value, dir }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-white/40 flex-shrink-0">{label}</span>
      <span className="text-white/90 font-bold text-left" dir={dir || 'rtl'}>{value}</span>
    </div>
  );
}

function DocLink({ url, label }) {
  if (!url) return <span className="text-white/30 text-[11px]">—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[#D4AF37] hover:text-amber-300 text-[11px] font-bold">
      <ExternalLink size={11} /> {label || 'צפייה'}
    </a>
  );
}

export default function DirectorLegalCaseFileTab({ player, contracts = [], transfers = [] }) {
  const { data: proposals = [], isLoading: loadingProposals } = useQuery({
    queryKey: ['legal-transfer-proposals', player.id, player.elite_id],
    queryFn: () => base44.entities.TransferProposal.filter({ player_elite_id: player.elite_id || player.id }, '-created_date', 20),
    enabled: !!player.elite_id || !!player.id,
  });

  const compliance = computePlayerIfaCompliance(player, contracts);
  const lt = player.legal_terms_accepted || {};
  const termsList = [
    { key: 'platform_terms', label: 'תקנון הפלטפורמה' },
    { key: 'digital_power_of_attorney', label: 'ייפוי כוח בירוקרטי דיגיטלי' },
    { key: 'medical_waiver', label: 'ויתור סודיות רפואית' },
    { key: 'digital_representation', label: 'בלעדיות ייצוג דיגיטלי (5%)' },
    { key: 'payment_pre_auth', label: 'אישור סליקה מראש' },
    { key: 'media_consent', label: 'אישור שימוש במדיה' },
    { key: 'club_bylaws', label: 'תקנון מועדון' },
  ];
  const signedTerms = termsList.filter(t => lt[t.key]).length;
  const contractDays = calcDaysLeft(player.contract_end_date);
  const docs = (player.documents || []).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* כותרת + סטטוס רישום IFA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-white font-black text-base">
          <Gavel size={15} className="text-[#D4AF37]" /> תיק משפטי — {player.full_name}
        </div>
        <StatusPill ok={player.ifa_registration_status === 'Under Contract'} label={`IFA: ${player.ifa_registration_status || 'Unverified'}`} />
      </div>

      {/* תיק IFA אישי — 4 מדדי חובה */}
      <div className={SECTION}>
        <div className={SECTION_TITLE}>
          <ShieldAlert size={14} className="text-amber-400" />
          אימות מול ההתאחדות — {compliance.completed}/{compliance.total} ({compliance.pct}%)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {compliance.checks.map(c => (
            <div key={c.key} className={`flex items-center gap-2 text-[11px] ${c.passed ? 'text-green-400' : 'text-red-400'}`}>
              {c.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />} <span className="font-bold">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* תנאים משפטיים חתומים */}
      <div className={SECTION}>
        <div className={SECTION_TITLE}>
          <PenLine size={14} className="text-[#D4AF37]" />
          תנאים משפטיים — {signedTerms}/{termsList.length} אושרו
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {termsList.map(t => (
            <div key={t.key} className={`flex items-center gap-2 text-[11px] ${lt[t.key] ? 'text-green-400' : 'text-red-400'}`}>
              {lt[t.key] ? <CheckCircle2 size={11} /> : <XCircle size={11} />} <span>{t.label}</span>
            </div>
          ))}
        </div>
        {!player.digital_signature && (
          <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-bold">
            <AlertTriangle size={11} /> חסרה חתימה דיגיטלית של השחקן
          </div>
        )}
      </div>

      {/* אפוטרופוס / קטין */}
      {!player.is_adult && (
        <div className={SECTION}>
          <div className={SECTION_TITLE}>
            <Baby size={14} className="text-amber-400" /> אפוטרופוס / הורה (קטין)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Row label="שם אפוטרופוס" value={player.guardian_name} />
            <Row label="ת.ז אפוטרופוס" value={player.guardian_id} />
            <Row label="טלפון הורה" value={player.parent_phone} dir="ltr" />
            <Row label="מייל הורה" value={player.parent_email} dir="ltr" />
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-white/40 text-[10px]">ספח תעודת זהות (הוכחת שיוך הורה-קטין)</span>
            <DocLink url={player.id_suffix_url} label="צפה בספח" />
          </div>
          <div className="pt-1">
            <StatusPill ok={!!(player.guardian_name && player.guardian_id && player.id_suffix_url && lt.digital_power_of_attorney)} label={player.guardian_name ? 'אפוטרופוס מאומת' : 'חסר אימות אפוטרופוס'} />
          </div>
        </div>
      )}

      {/* חתימות שחקן + אישור חתימה Pre-Signature */}
      <div className={SECTION}>
        <div className={SECTION_TITLE}>
          <ScrollText size={14} className="text-[#D4AF37]" /> חתימות ואימותים
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-white/40">חתימה דיגיטלית</span>
            {player.digital_signature ? <StatusPill ok label="קיימת" /> : <StatusPill ok={false} label="חסרה" />}
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-white/40">אישור חתימה (Pre-Sign)</span>
            {player.audit_signed_at ? <StatusPill ok label="נחתם" /> : <StatusPill ok={false} label="ממתין" />}
          </div>
          {player.audit_signed_at && <Row label="תאריך אישור" value={new Date(player.audit_signed_at).toLocaleDateString('he-IL')} />}
          {player.audit_signed_by && <Row label="מאשר" value={player.audit_signed_by} />}
        </div>
      </div>

      {/* אימות זהות / סטטוס חשבון */}
      <div className={SECTION}>
        <div className={SECTION_TITLE}>
          <Fingerprint size={14} className="text-[#D4AF37]" /> אימות זהות וסטטוס
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Row label="סטטוס חשבון" value={player.account_status} />
          <Row label="מקור אימות" value={player.verification_source} />
          <Row label="IFA ID" value={player.ifa_id} dir="ltr" />
          <Row label="IFA Player ID" value={player.ifa_player_id} dir="ltr" />
          <Row label="Elite ID" value={player.elite_id} dir="ltr" />
          <Row label="סיום חוזה נוכחי" value={player.contract_end_date ? `${new Date(player.contract_end_date).toLocaleDateString('he-IL')} · ${contractDays !== null ? contractDays + ' ימים' : ''}` : null} />
        </div>
        {player.verification_link && <DocLink url={player.verification_link} label="קישור אימות חיצוני" />}
        {player.internal_notes && (
          <div className="mt-2 bg-amber-500/5 border border-amber-500/20 rounded p-2">
            <div className="text-amber-400 text-[10px] font-bold mb-1">הערות אימות פנימיות</div>
            <p className="text-white/60 text-[11px] leading-relaxed">{player.internal_notes}</p>
          </div>
        )}
      </div>

      {/* מסמכים מצורפים */}
      <div className={SECTION}>
        <div className={SECTION_TITLE}>
          <FileText size={14} className="text-[#D4AF37]" /> מסמכים ({docs.length})
        </div>
        {docs.length === 0 ? (
          <div className="text-white/30 text-[11px]">לא הועלו מסמכים</div>
        ) : (
          <div className="space-y-2">
            {docs.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-2 bg-white/[0.03] rounded p-2">
                <div className="min-w-0">
                  <div className="text-white text-[11px] font-bold truncate">{d.label || 'מסמך'}</div>
                  <div className="text-white/40 text-[10px]">{d.doc_type || '—'}{d.uploaded_at ? ` · ${new Date(d.uploaded_at).toLocaleDateString('he-IL')}` : ''}</div>
                </div>
                <DocLink url={d.file_url} label="צפה" />
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <DocLink url={player.medical_certificate_url} label="אישור רפואי" />
          <DocLink url={player.id_document_url} label="תעודת זהות" />
          <DocLink url={player.id_suffix_url} label="ספח ת.ז" />
        </div>
      </div>

      {/* חוזים פעילים */}
      <div className={SECTION}>
        <div className={SECTION_TITLE}>
          <ShieldCheck size={14} className="text-[#D4AF37]" /> חוזים ({contracts.length})
        </div>
        {contracts.length === 0 ? (
          <div className="text-white/30 text-[11px]">אין חוזים רשומים</div>
        ) : (
          <div className="space-y-2">
            {contracts.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-2 bg-white/[0.03] rounded p-2">
                <div className="min-w-0">
                  <div className="text-white text-[11px] font-bold truncate">{c.contract_type}</div>
                  <div className="text-white/40 text-[10px]">{c.start_date || '—'} עד {c.end_date || '—'}</div>
                </div>
                <StatusPill ok={c.status === 'חתום'} label={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* היסטוריית העברות / השאלות */}
      <div className={SECTION}>
        <div className={SECTION_TITLE}>
          <UserCog size={14} className="text-[#D4AF37]" /> היסטוריית העברות ({transfers.length})
        </div>
        {transfers.length === 0 ? (
          <div className="text-white/30 text-[11px]">אין העברות רשומות</div>
        ) : (
          <div className="space-y-2">
            {transfers.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-2 bg-white/[0.03] rounded p-2">
                <div className="min-w-0">
                  <div className="text-white text-[11px] font-bold truncate">{t.club_from || '—'} ← {t.club_to || '—'}</div>
                  <div className="text-white/40 text-[10px]">{t.transfer_category || t.status}</div>
                </div>
                <StatusPill ok={t.status === 'Signed'} label={t.status} />
              </div>
            ))}
          </div>
        )}
        {loadingProposals && <div className="flex justify-center py-2"><Loader2 size={14} className="animate-spin text-[#D4AF37]" /></div>}
        {!loadingProposals && proposals.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <div className="text-white/40 text-[10px] font-bold mb-1">הצעות העברה פתוחות ({proposals.length})</div>
            {proposals.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-[11px] py-1">
                <span className="text-white/70 truncate">{p.club_name}</span>
                <span className="text-amber-400 font-bold">{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* שחרור מאחריות — תיק פנימי */}
      <div className="text-white/30 text-[10px] text-center pt-2 border-t border-white/5">
        תיק משפטי פנימי · נגיש למנהל מקצועי בלבד · {new Date().toLocaleDateString('he-IL')}
      </div>
    </div>
  );
}