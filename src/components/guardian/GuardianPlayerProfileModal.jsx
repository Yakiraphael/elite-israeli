import { X, User, MapPin, Star, ShieldCheck, HeartPulse, FileText, Download, Calendar, Lock } from 'lucide-react';

// תצוגת פרופיל אפוטרופוס — קריאה בלבד, מוגבלת למידע שאפוטרופוס מורשה לראות.
// עיקרון: פרטים אישיים וסטטוס רפואי רמזור בלבד (לא תיק רפואי מלא), סטטוס רישום, מסמכים בכספת,
// וסיכום הסכמות. חוזים/שכר/תיק רפואי מלא/היסטוריית העברות/הערות פנימיות — חסומים לצוות מועדון בלבד.

const MEDICAL_LIGHT = {
  green: { label: 'כשיר לחלוטין', color: '#10B981' },
  yellow: { label: 'נדרש חידוש בקרוב', color: '#F59E0B' },
  red: { label: 'לא כשיר', color: '#EF4444' },
};

function ageFromBirth(bd) {
  if (!bd) return null;
  return Math.floor((Date.now() - new Date(bd).getTime()) / (365.25 * 24 * 3600 * 1000));
}

export default function GuardianPlayerProfileModal({ player, onClose }) {
  const isExpired = player.medical_expiry_date && new Date(player.medical_expiry_date) < new Date();
  const isSoon = !isExpired && player.medical_expiry_date && (new Date(player.medical_expiry_date) - new Date()) < 30 * 24 * 60 * 60 * 1000;
  const light = !player.medical_certificate_url ? 'red' : isExpired ? 'red' : isSoon ? 'yellow' : 'green';
  const terms = player.legal_terms_accepted || {};
  const yearsOld = ageFromBirth(player.birth_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" dir="rtl">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#1B263B] border border-white/15 rounded-xl shadow-2xl">
        <button onClick={onClose} className="absolute top-3 left-3 text-white/40 hover:text-white z-10">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-l from-[#0D1B2A] to-[#1B263B]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border-2 border-[#D4AF37]/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {player.avatar_url
                ? <img src={player.avatar_url} alt={player.full_name} className="w-full h-full object-cover" />
                : <User size={20} className="text-[#D4AF37]" />}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-black text-base">{player.full_name}</h3>
              <div className="flex items-center gap-1.5 text-white/50 text-[11px] mt-0.5">
                <Star size={10} className="text-[#D4AF37]" /> {player.position}
                {player.team_name && <span>· {player.team_name}</span>}
              </div>
            </div>
            {player.elite_id && <span className="bg-[#D4AF37] text-[#0D1B2A] text-[10px] font-black px-2 py-0.5 rounded-full">{player.elite_id}</span>}
          </div>
          <p className="text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase mt-2">
            {player.is_adult ? 'שחקן בוגר' : 'שחקן נוער'} · תצוגת אפוטרופוס
          </p>
        </div>

        <div className="p-5 space-y-3">
          {/* Personal info */}
          <Section icon={User} title="פרטים אישיים">
            <Row label="תאריך לידה" value={player.birth_date ? `${player.birth_date}${yearsOld != null ? ` · ${yearsOld} שנים` : ''}` : '—'} />
            <Row label="עיר" value={player.city || '—'} icon={MapPin} />
            <Row label="אזור פעילות" value={player.region || '—'} />
            <Row label="גובה / משקל" value={(player.height_cm || player.weight_kg) ? `${player.height_cm || '—'} ס״מ / ${player.weight_kg || '—'} ק״ג` : '—'} />
            <Row label="רגל דומיננטית" value={player.dominant_foot || '—'} />
          </Section>

          {/* Medical light — רמזור בלבד, לא תיק מלא */}
          <div className="rounded-lg p-3 border" style={{ backgroundColor: `${MEDICAL_LIGHT[light].color}15`, borderColor: `${MEDICAL_LIGHT[light].color}40` }}>
            <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: MEDICAL_LIGHT[light].color }}>
              <HeartPulse size={12} /> כשירות רפואית (סטטוס רמזור)
            </div>
            <div className="text-white/70 text-[11px] mt-0.5">
              {MEDICAL_LIGHT[light].label}{player.medical_expiry_date ? ` · תוקף עד ${player.medical_expiry_date}` : ''}
            </div>
            <p className="text-white/30 text-[9px] mt-1">תיק רפואי מלא מוגבל לצוות המועדון בלבד.</p>
          </div>

          {/* Registration status */}
          <Section icon={ShieldCheck} title="סטטוס רישום">
            <Row label="מצב חשבון" value={player.account_status || '—'} />
            <Row label="מוכן להתאחדות" value={player.ifa_ready ? '✓ כן' : 'חסר'} />
            <Row label="שחקן חופשי" value={player.is_free_agent ? 'כן' : 'לא'} />
            <Row label="תוקף חוזה" value={player.contract_end_date || '—'} icon={Calendar} />
          </Section>

          {/* Documents accessible to guardian */}
          <Section icon={FileText} title="מסמכים בכספת">
            <DocLink label="תעודת זהות" url={player.id_document_url} />
            {!player.is_adult && <DocLink label="ספח תעודת זהות (הוכחת שייכות)" url={player.id_suffix_url} />}
            <DocLink label="אישור רפואי" url={player.medical_certificate_url} />
          </Section>

          {/* Consents summary */}
          <Section icon={ShieldCheck} title="סטטוס הסכמות">
            <ConsentRow label="אישור שימוש במדיה" done={!!terms.media_consent} />
            <ConsentRow label="ויתור סודיות רפואית" done={!!terms.medical_waiver} />
            <ConsentRow label="ייפוי כוח דיגיטלי" done={!!terms.digital_power_of_attorney} />
            <ConsentRow label="תקנון מועדון" done={!!terms.club_bylaws} />
          </Section>

          {/* Privacy notice */}
          <div className="flex items-start gap-2 bg-white/[0.03] border border-white/10 rounded-lg p-3">
            <Lock size={12} className="text-white/40 mt-0.5 flex-shrink-0" />
            <p className="text-white/45 text-[10px] leading-relaxed">
              תצוגה זו מוגבלת למידע שאפוטרופוס מורשה לראות. פרטים רגישים (חוזים, שכר, תיק רפואי מלא, היסטוריית העברות, הערות פנימיות) מוגבלים לצוות המועדון המורשה בלבד, בהתאם לתקנון הגנת הפרטיות.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-[#0D1B2A]/60 border border-white/10 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-[#D4AF37] text-[11px] font-bold mb-2">
        <Icon size={12} /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-0.5">
      <span className="text-white/40 flex items-center gap-1">{Icon && <Icon size={10} />}{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function DocLink({ label, url }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-1">
      <span className="text-white/70">{label}</span>
      {url
        ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-amber-300 flex items-center gap-1"><Download size={11} /> צפה</a>
        : <span className="text-red-400">לא הועלה</span>}
    </div>
  );
}

function ConsentRow({ label, done }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-0.5">
      <span className="text-white/60">{label}</span>
      <span className={done ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{done ? '✓ נחתם' : 'חסר'}</span>
    </div>
  );
}