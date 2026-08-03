import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, ShieldCheck, FileText, Loader2, CheckCircle2, ExternalLink, MapPin, Ruler } from 'lucide-react';

const OPS = ['ממתין להפעלה', 'בבדיקה', 'פעיל', 'מושעה', 'נדחה'];
const VERIFY = ['ממתין לאימות', 'מאומת', 'נדחה'];
const STAGE = ['הגשה', 'אימות מסמכים', 'חברות בהתאחדות', 'פעיל'];

// מודאל בחינת מועדון: סקירת מסמכים מוסדיים + קביעת סטטוס אימות/תפעולי + דחייה מנומקת.
export default function ClubReviewModal({ club, user, onClose }) {
  const queryClient = useQueryClient();
  const [operationalStatus, setOperationalStatus] = useState(club.operational_status || 'ממתין להפעלה');
  const [verificationStatus, setVerificationStatus] = useState(club.verification_status || 'ממתין לאימות');
  const [onboardingStage, setOnboardingStage] = useState(club.onboarding_stage || 'הגשה');
  const [isVerified, setIsVerified] = useState(!!club.is_verified);
  const [orgClassification, setOrgClassification] = useState(club.org_classification || 'YOUTH_DEPARTMENT');
  const [rejectionReason, setRejectionReason] = useState(club.rejection_reason || '');
  const [now, setNow] = useState('');

  // Geo-Spatial — מיקום גיאוגרפי + אימות אזורי + חישוב קרבה ליגה אזורית
  const [municipality, setMunicipality] = useState(club.municipality || '');
  const [latitude, setLatitude] = useState(club.latitude || '');
  const [longitude, setLongitude] = useState(club.longitude || '');
  const [geoStatus, setGeoStatus] = useState(club.geo_verification_status || 'PENDING_VERIFICATION');
  const [serviceRadius, setServiceRadius] = useState(club.service_radius_km || 20);
  const [nearby, setNearby] = useState(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoErr, setGeoErr] = useState('');

  const computeNearby = async () => {
    setGeoBusy(true); setGeoErr('');
    try {
      const res = await base44.functions.invoke('geo-proximity-engine', { action: 'nearbyClubs', target_club_id: club.id, max_distance_km: +serviceRadius });
      const d = res.data || res;
      if (d.error) { setGeoErr(d.error); setNearby(null); }
      else setNearby(d);
    } catch (e) { setGeoErr(e.response?.data?.error || e.message); setNearby(null); }
    setGeoBusy(false);
  };

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const esc = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', esc);
    setNow(new Date().toISOString());
    return () => { root.style.overflow = prev; window.removeEventListener('keydown', esc); };
  }, [onClose]);

  const save = useMutation({
    mutationFn: async () => {
      const patch = {
        operational_status: operationalStatus,
        verification_status: verificationStatus,
        onboarding_stage: onboardingStage,
        org_classification: orgClassification,
        is_verified: isVerified,
        rejection_reason: operationalStatus === 'נדחה' || verificationStatus === 'נדחה' ? rejectionReason : '',
        reviewer_id: user?.id || '',
        reviewer_name: user?.full_name || '',
        reviewed_at: now,
        operational_active_from: operationalStatus === 'פעיל' && !club.operational_active_from
          ? now.slice(0, 10)
          : club.operational_active_from,
        // Geo-Spatial
        municipality: municipality || 'לא צוין',
        latitude: latitude ? +latitude : null,
        longitude: longitude ? +longitude : null,
        geo_verification_status: geoStatus,
        service_radius_km: +serviceRadius || 20,
      };
      return base44.entities.Club.update(club.id, patch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-clubs'] });
      base44.entities.AuditLog.create({
        actor_id: user?.id, actor_name: user?.full_name, actor_role: user?.role,
        action: 'club_verified', club_id: club.id,
        details: `SuperAdmin הגדיר מועדון ${club.club_name} — תפעול: ${operationalStatus}, אימות: ${verificationStatus}`,
      }).catch(() => {});
      onClose();
    },
  });

  const docs = [
    { label: 'תעודת רישום (רשם חברות/עמותות)', url: club.incorporation_certificate_url },
    { label: 'תעודת חברות בהתאחדות לכדורגל', url: club.ifa_membership_certificate_url },
    { label: 'פוליסת ביטוח חבות מעביד / צד ג', url: club.insurance_certificate_url },
  ];
  const protocols = Array.isArray(club.protocol_documents) ? club.protocol_documents : [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-hairline rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="sticky top-0 bg-surface border-b border-hairline px-6 py-4 flex items-start justify-between gap-3 z-10">
          <div>
            <h2 className="text-ink font-black text-base">{club.club_name}</h2>
            <p className="text-ink-faint text-[11px] mt-0.5">{club.club_tier} · {club.organization_type || ''}</p>
            <p className="text-ink-faint text-[10px] mt-1">איש קשר: {club.contact_name || '—'} · {club.contact_email || ''} · {club.contact_phone || ''}</p>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Documents */}
          <Section title="מסמכים מוסדיים" icon={FileText}>
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d.label} className="flex items-center justify-between bg-panel border border-hairline rounded-md px-3 py-2">
                  <span className="text-ink-muted text-xs">{d.label}</span>
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand text-[11px] font-bold hover:text-amber-300">
                      צפה <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-red-400 text-[10px] font-bold">חסר</span>
                  )}
                </div>
              ))}
              {protocols.length > 0 && (
                <div className="pt-1">
                  <div className="text-ink-faint text-[10px] font-bold mb-1">פרוטוקולים נוספים</div>
                  {protocols.map((p, i) => (
                    <a key={i} href={p.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand text-[11px] hover:text-amber-300 py-0.5">
                      <ExternalLink size={10} /> {p.label || `מסמך ${i + 1}`}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Verification controls */}
          <Section title="קביעת סטטוס" icon={ShieldCheck}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="סטטוס תפעולי">
                <select value={operationalStatus} onChange={e => setOperationalStatus(e.target.value)} className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line">
                  {OPS.map(o => <option key={o} value={o} className="bg-surface text-ink">{o}</option>)}
                </select>
              </Field>
              <Field label="סטטוס אימות מועדון">
                <select value={verificationStatus} onChange={e => setVerificationStatus(e.target.value)} className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line">
                  {VERIFY.map(o => <option key={o} value={o} className="bg-surface text-ink">{o}</option>)}
                </select>
              </Field>
              <Field label="שלב קליטה">
                <select value={onboardingStage} onChange={e => setOnboardingStage(e.target.value)} className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line">
                  {STAGE.map(o => <option key={o} value={o} className="bg-surface text-ink">{o}</option>)}
                </select>
              </Field>
              <Field label="סיווג ארגוני (מנוע פרופיל/סקאוטינג)">
                <select value={orgClassification} onChange={e => setOrgClassification(e.target.value)} className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line">
                  {['IFA_VERIFIED','YOUTH_DEPARTMENT','AMATEUR_LEAGUE','ASSOCIATION'].map(o => <option key={o} value={o} className="bg-surface text-ink">{o}</option>)}
                </select>
              </Field>
              <label className="flex items-center gap-2 bg-panel border border-hairline rounded-sm px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} className="accent-amber-500" />
                <span className="text-ink text-xs font-bold">מועדון מאומת ידנית</span>
              </label>
            </div>
            {(operationalStatus === 'נדחה' || verificationStatus === 'נדחה') && (
              <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="סיבת דחייה / השהיה (חובה)"
                className="w-full mt-3 bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs placeholder-ink-faint focus:outline-none focus:border-brand-line min-h-[70px]" />
            )}
          </Section>

          {/* Geo-Spatial — אימות אזורי גיאוגרפי */}
          <Section title="אימות אזורי גיאוגרפי (Geo-Spatial)" icon={MapPin}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="רשות מקומית">
                <input value={municipality} onChange={e => setMunicipality(e.target.value)} placeholder="נתיבות / קרית גת / באר שבע" className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line" />
              </Field>
              <Field label="סטטוס אימות אזורי">
                <select value={geoStatus} onChange={e => setGeoStatus(e.target.value)} className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line">
                  {['PENDING_VERIFICATION', 'VERIFIED_REGIONAL', 'REJECTED'].map(o => <option key={o} value={o} className="bg-surface text-ink">{o}</option>)}
                </select>
              </Field>
              <Field label="קו אורך (Latitude)"><input dir="ltr" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="31.7921" className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line" /></Field>
              <Field label="קו רוחב (Longitude)"><input dir="ltr" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="34.6589" className="w-full bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line" /></Field>
              <Field label="רדיוס פעילות (ק״מ)">
                <div className="flex items-center gap-2">
                  <Ruler size={13} className="text-brand flex-shrink-0" />
                  <input type="number" min={1} max={200} value={serviceRadius} onChange={e => setServiceRadius(e.target.value)} className="w-24 bg-panel border border-hairline rounded-sm px-3 py-2 text-ink text-xs focus:outline-none focus:border-brand-line" />
                  <button onClick={computeNearby} disabled={geoBusy || (!latitude || !longitude)} type="button"
                    className="text-[11px] font-bold bg-brand text-brand-ink px-3 py-2 rounded hover:brightness-110 disabled:opacity-40 flex items-center gap-1">
                    {geoBusy ? <Loader2 size={11} className="animate-spin" /> : <MapPin size={11} />} חשב קרבה אזורית
                  </button>
                </div>
              </Field>
            </div>
            {geoErr && <div className="text-red-400 text-[11px] mt-2">{geoErr}</div>}
            {nearby && (
              <div className="mt-3 bg-panel border border-hairline rounded-md p-3">
                <div className="text-ink-faint text-[10px] font-bold mb-2">מועדונים מאומתים-אזורית ברדיוס {nearby.target?.service_radius_km || serviceRadius} ק״מ ({nearby.count})</div>
                {nearby.nearby?.length === 0 ? (
                  <div className="text-ink-faint text-[11px]">אין מועדונים מאומתים-אזורית בטווח זה עדיין.</div>
                ) : (
                  <div className="space-y-1">
                    {nearby.nearby.map((n, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-ink">{n.name} <span className="text-ink-faint">· {n.municipality || '—'}</span></span>
                        <span className="text-brand font-bold">{n.distance_km} ק״מ</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-ink-faint text-[10px] mt-2">אימות אזורי נפרד מאימות מוסדי — מאפשר שיוך לליגה אזורית על בסיס קרבה גיאוגרפית (Haversine).</p>
          </Section>

          {/* Save */}
          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="w-full flex items-center justify-center gap-2 bg-brand text-brand-ink font-bold text-sm py-3 rounded-sm hover:brightness-105 transition disabled:opacity-40">
            {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {save.isPending ? 'שומר…' : 'שמור החלטת קליטה'}
          </button>
          {save.isError && <div className="text-red-400 text-[11px] text-center">{save.error?.message}</div>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-surface border border-hairline rounded-lg p-4">
      <div className="flex items-center gap-1.5 text-ink-muted text-xs font-bold mb-3"><Icon size={13} /> {title}</div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-ink-faint text-[10px] font-bold mb-1">{label}</div>
      {children}
    </label>
  );
}