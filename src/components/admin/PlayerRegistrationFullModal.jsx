import { useState } from 'react';
import { X, ExternalLink, User, Phone, Mail, FileText, Shield, HeartPulse, Calendar, Ruler, Weight, Award, CreditCard } from 'lucide-react';

// פופאפ רישום מלא: מציג את כל שדות טופס הרישום של השחקן, מסמכים מצורפים (כולל אפוטרופוס) וכרטיס אפוטרופוס — מותאם רזולוציה ונפתח בלחיצה.
// "שני צדדי המטבע": גם תצוגת פרטים מלאת רישום וגם הצגת המסמכים באותו מסך.
export default function PlayerRegistrationFullModal({ player, onClose }) {
  if (!player) return null;

  const docs = [
    { label: 'תעודת זהות', url: player.id_document_url },
    { label: 'ספח ת.ז (קטין)', url: player.id_suffix_url, minorOnly: true },
    { label: 'תמונת פנים (סלפי)', url: player.selfie_url },
    { label: 'אישור רפואי', url: player.medical_certificate_url, medical: true },
  ].filter(d => !d.minorOnly || !player.is_adult);

  const extraDocs = Array.isArray(player.documents) ? player.documents : [];
  const certs = Array.isArray(player.certificates) ? player.certificates : [];
  const legal = player.legal_terms_accepted || {};
  const legalKeys = Object.keys(legal);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-[#1B263B] border border-white/10 rounded-xl w-full max-w-3xl max-h-[94vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
        {/* Header */}
        <div className="sticky top-0 bg-[#1B263B] border-b border-white/10 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
              <User size={18} className="text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-white font-black text-base">{player.full_name}</h2>
              <p className="text-white/40 text-[11px]">תיק רישום מלא · {player.is_adult ? 'בוגר' : 'קטין'} · {player.position || '—'}</p>
            </div>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* פרטים אישיים */}
          <Block title="פרטים אישיים" icon={CreditCard}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Info label="שם מלא" value={player.full_name} />
              <Info label="ת.ז" value={player.id_number} ltr />
              <Info label="תאריך לידה" value={player.birth_date} icon={Calendar} />
              <Info label="טלפון" value={player.phone} ltr icon={Phone} />
              <Info label="עיר" value={player.city} />
              <Info label="כתובת" value={player.street_address} span2 />
              <Info label="אזור" value={player.region} />
            </div>
          </Block>

          {/* פרטי ספורט */}
          <Block title="פרטי משחק" icon={Award}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Info label="עמדה ראשית" value={player.position} />
              <Info label="עמדה משנית" value={player.secondary_position} />
              <Info label="רגל דומיננטית" value={player.dominant_foot} />
              <Info label="קבוצה" value={player.team_name} />
              <Info label="ליגה" value={player.league_name} />
              <Info label="ארגון" value={player.organization_name} />
              <Info label={'גובה (ס"מ)'} value={player.height_cm} icon={Ruler} />
              <Info label={'משקל (ק"ג)'} value={player.weight_kg} icon={Weight} />
              <Info label="שנות ניסיון" value={player.experience_years} />
            </div>
          </Block>

          {/* כרטיס אפוטרופוס — מוצג אך ורק לקטינים */}
          {!player.is_adult && (
            <Block title="כרטיס אפוטרופוס" icon={Shield} tone="gold">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Info label="שם הורה/אפוטרופוס" value={player.guardian_name} />
                <Info label="ת.ז הורה" value={player.guardian_id} ltr />
                <Info label="טלפון הורה" value={player.parent_phone} ltr icon={Phone} />
                <Info label="מייל הורה" value={player.parent_email} ltr icon={Mail} span2 />
              </div>
            </Block>
          )}

          {/* מסמכים */}
          <Block title="מסמכים מצורפים" icon={FileText}>
            <div className="space-y-2">
              {docs.map(d => (
                <DocRow key={d.label} label={d.label} url={d.url} medical={d.medical} />
              ))}
              {extraDocs.length > 0 && (
                <div className="pt-2">
                  <div className="text-white/40 text-[10px] font-bold mb-1">מסמכים נוספים ({extraDocs.length})</div>
                  {extraDocs.map((d, i) => (
                    <DocRow key={i} label={d.label || `מסמך ${i + 1}`} url={d.file_url} sub={d.doc_type} />
                  ))}
                </div>
              )}
              {certs.length > 0 && (
                <div className="pt-2">
                  <div className="text-white/40 text-[10px] font-bold mb-1">תעודות והישגים — Trophy Room ({certs.length})</div>
                  {certs.map((c, i) => (
                    <DocRow key={i} label={`${c.title}${c.issuer ? ` · ${c.issuer}` : ''}${c.date ? ` · ${c.date}` : ''}`} url={c.file_url} />
                  ))}
                </div>
              )}
            </div>
          </Block>

          {/* אישורים משפטיים */}
          {legalKeys.length > 0 && (
            <Block title="אישורים משפטיים" icon={Shield}>
              <div className="flex flex-wrap gap-1.5">
                {legalKeys.map(k => (
                  <span key={k} className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${legal[k] ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                    {legal[k] ? '✓' : '✗'} {LEGAL_LABELS[k] || k}
                  </span>
                ))}
              </div>
            </Block>
          )}

          {/* סטטוס */}
          <Block title="סטטוס רישום וחשבון" icon={HeartPulse}>
            <div className="flex flex-wrap gap-2">
              <Badge label={`רישום: ${player.status || 'ממתין'}`} />
              <Badge label={`חשבון: ${player.account_status || 'ממתין לאישור'}`} />
              {player.ifa_ready && <Badge label="IFA Ready" gold />}
              {player.is_free_agent && <Badge label="שחקן חופשי" />}
              {player.ifa_registration_status && <Badge label={`התאחדות: ${player.ifa_registration_status}`} />}
            </div>
          </Block>
        </div>

        <div className="px-5 py-3 border-t border-white/10 text-white/30 text-[10px] flex items-center gap-1.5">
          <FileText size={11} /> גישה למסמכים רפואיים נרשמת ביומן ביקורת (view_medical).
        </div>
      </div>
    </div>
  );
}

const LEGAL_LABELS = {
  platform_terms: 'תקנון פלטפורמה', digital_power_of_attorney: 'ייפוי כוח דיגיטלי',
  medical_waiver: 'ויתור סודיות רפואית', digital_representation: 'ייצוג דיגיטלי (5%)',
  payment_pre_auth: 'אישור סליקה מראש', media_consent: 'אישור מדיה', club_bylaws: 'תקנון מועדון',
};

function Block({ title, icon: Icon, tone, children }) {
  const border = tone === 'gold' ? 'border-[#D4AF37]/30' : 'border-white/10';
  return (
    <div className={`bg-[#0D1B2A] border ${border} rounded-lg p-4`}>
      <div className="flex items-center gap-1.5 text-white font-bold text-sm mb-3">
        <Icon size={14} className="text-[#D4AF37]" /> {title}
      </div>
      {children}
    </div>
  );
}

function Info({ label, value, ltr, icon: Icon, span2 }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <div className="text-white/40 text-[10px] mb-0.5 flex items-center gap-1">{Icon && <Icon size={9} />} {label}</div>
      <div className={`text-white text-xs font-bold ${ltr ? 'text-left' : ''}`} dir={ltr ? 'ltr' : 'rtl'}>{value || '—'}</div>
    </div>
  );
}

function DocRow({ label, url, sub, medical }) {
  return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-md px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        {medical && <HeartPulse size={12} className="text-red-400 flex-shrink-0" />}
        {!medical && url && <FileText size={12} className="text-white/40 flex-shrink-0" />}
        {!medical && !url && <FileText size={12} className="text-white/20 flex-shrink-0" />}
        <span className="text-white/70 text-[11px] truncate">{label}{sub ? ` · ${sub}` : ''}</span>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#D4AF37] text-[10px] font-bold hover:text-amber-300 flex-shrink-0">
          צפה <ExternalLink size={10} />
        </a>
      ) : (
        <span className="text-red-400 text-[10px] font-bold flex-shrink-0">חסר</span>
      )}
    </div>
  );
}

function Badge({ label, gold }) {
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${gold ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'text-white/70 bg-white/5 border-white/15'}`}>{label}</span>;
}