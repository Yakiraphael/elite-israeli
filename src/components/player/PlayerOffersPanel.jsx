import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Inbox, Building2, FileText, CheckCircle2, Calendar, Phone, Mail,
  CreditCard, Clock, Handshake, ArrowLeft,
} from 'lucide-react';
import TransferPipelineStepper from '../admin/TransferPipelineStepper';
import TransparencyDashboard from '@/components/negotiation/TransparencyDashboard';
import NegotiationTimeline from '@/components/negotiation/NegotiationTimeline';
import { isLoanCategory } from '@/lib/transferDocumentRequirements';

const STATUS_STYLES = {
  'ממתין לאישור הנהלה': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', dot: 'bg-amber-400' },
  'מאושר — ממתין לאפוטרופוס': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', dot: 'bg-amber-400' },
  'מאושר — ממתין לשחקן (בוגר)': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', dot: 'bg-blue-400' },
  'ממתין לאימות תשלום (בוגר)': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', dot: 'bg-blue-400' },
  'ממתין לאימות התאחדות (IFA)': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', dot: 'bg-purple-400' },
  'אושרה סופית': { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', dot: 'bg-green-400' },
  'נדחתה': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', dot: 'bg-red-400' },
  'נסגרה': { color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10', dot: 'bg-white/40' },
};

// דשבורד הצעות העברה לשחקן — מציג הצעות שהתקבלו עם פרטי קשר, תקופת השאלה, שווי חוזה,
// רכיב Pipeline Stepper סמוי ואפשרות ניהול עצמי לבוגרים.
export default function PlayerOffersPanel({ player }) {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState(null);
  const [signName, setSignName] = useState('');

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['player-offers', player.id],
    queryFn: () => base44.entities.TransferProposal.filter({ player_elite_id: player.elite_id || player.id }, '-created_date', 20),
    enabled: !!player.id,
  });

  const manageOwnTransfer = useMutation({
    mutationFn: async (offer) => {
      const now = new Date().toISOString();
      const nextStatus = offer.contract_value > 0 ? 'ממתין לאימות תשלום (בוגר)' : 'ממתין לאימות התאחדות (IFA)';
      await base44.entities.TransferProposal.update(offer.id, {
        status: nextStatus,
        player_consent: true,
        guardian_consent_name: signName.trim(),
        guardian_consent_at: now,
      });
      try {
        const user = await base44.auth.me();
        await base44.entities.AuditLog.create({
          actor_id: user?.id || player.id,
          actor_name: user?.full_name || player.full_name,
          actor_role: 'player',
          action: 'sign_player',
          player_id: player.id,
          details: `השחקן ${signName.trim()} אישר בעצמו את ההעברה למועדון ${offer.club_name}`,
        });
      } catch { /* public/unauthenticated context — skip audit log */ }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-offers', player.id] });
      setConfirmingId(null);
      setSignName('');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /></div>;
  }

  const activeCount = offers.filter(o => !['אושרה סופית', 'נדחתה', 'נסגרה'].includes(o.status)).length;
  const approvedCount = offers.filter(o => o.status === 'אושרה סופית').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-white font-black text-base flex items-center gap-2">
            <Inbox size={16} className="text-[#D4AF37]" />
            הצעות העברה והשאלה שהתקבלו
          </h3>
          <p className="text-white/40 text-xs mt-0.5">כל הצעה מקצועית שהוגשה עבורך על ידי מועדון או סקאוט מוסמך</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border text-blue-400 bg-blue-500/10 border-blue-500/30">
            <Clock size={11} /> בתהליך · <span className="font-black">{activeCount}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-2.5 py-1.5 border text-green-400 bg-green-500/10 border-green-500/30">
            <CheckCircle2 size={11} /> אושרו · <span className="font-black">{approvedCount}</span>
          </span>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-[#1B263B] border border-white/10 border-dashed rounded-lg p-10 text-center">
          <Inbox size={26} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/40 text-sm">עדיין לא התקבלו הצעות</p>
          <p className="text-white/25 text-[11px] mt-1">ברגע שמועדון יגיש הצעה עבורך, היא תופיע כאן עם מעקב שלבי התהליך המלא</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(o => {
            const sc = STATUS_STYLES[o.status] || STATUS_STYLES['ממתין לאישור הנהלה'];
            const isYouth = !player.is_adult;
            const loan = isLoanCategory(o.transfer_category || '');
            const canManage = player.is_adult && o.status === 'מאושר — ממתין לשחקן (בוגר)';
            return (
              <div key={o.id} className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
                {/* Card header */}
                <div className="p-4 border-b border-white/5 flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center flex-shrink-0">
                      <Building2 size={15} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{o.club_name || 'מועדון לא ידוע'}</div>
                      <div className="text-white/40 text-[10px] mt-0.5 flex items-center gap-1.5">
                        <Calendar size={10} /> {o.created_date ? new Date(o.created_date).toLocaleDateString('he-IL') : '—'}
                        {o.transfer_category && <><span className="text-white/20">·</span><span className="truncate max-w-[160px]">{o.transfer_category}</span></>}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${sc.bg} ${sc.color} ${sc.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {o.status}
                  </span>
                </div>

                {/* Pipeline stepper (transparent process) */}
                <div className="px-4 py-3 bg-[#0D1B2A]/40 border-b border-white/5">
                  <div className="text-white/40 text-[10px] font-bold mb-1.5 uppercase tracking-wide">שלבי התהליך</div>
                  <TransferPipelineStepper status={o.status} isAdult={player.is_adult} />
                </div>

                <div className="p-4 space-y-3">
                  {isYouth ? (
                    <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                      <p className="text-amber-400/80 text-xs leading-relaxed">
                        🔒 מאחר שאתה שחקן נוער — פרטי ההצעה המלאים והמסמכים המצורפים חשופים לצפייה ולאישור האפוטרופוס שלך בלבד.
                      </p>
                      <p className="text-amber-400/80 text-xs leading-relaxed mt-1">
                        תהליך ההעברה, לעומת זאת, שקוף ומוצג לך תמיד למעלה. ניהול משא ומתן מתבצע דרך המנהל האישי/ההורה.
                      </p>
                    </div>
                  ) : (
                    <>
                      {o.proposal_details && (
                        <p className="text-white/70 text-xs leading-relaxed">{o.proposal_details}</p>
                      )}

                      {/* לוח שקיפות — עמדות הצדדים לכל סעיף (צפייה בלבד לשחקן/אפוטרופוס) */}
                      <TransparencyDashboard proposal={o} role="player" />
                      <NegotiationTimeline proposalId={o.id} proposal={o} />

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {o.contract_value ? (
                          <InfoItem icon={CreditCard} label="שווי חוזה שנתי" value={`₪${o.contract_value.toLocaleString()}`} highlight />
                        ) : null}
                        {loan && (
                          <>
                            <InfoItem icon={Calendar} label="תחילת השאלה" value={o.loan_start_date || '—'} />
                            <InfoItem icon={Calendar} label="סיום השאלה" value={o.loan_end_date || '—'} />
                          </>
                        )}
                        {o.contact_name && <InfoItem icon={Building2} label="איש קשר" value={o.contact_name} />}
                        {o.contact_email && <InfoItem icon={Mail} label="מייל" value={o.contact_email} ltr />}
                        {o.contact_phone && <InfoItem icon={Phone} label="טלפון" value={o.contact_phone} ltr />}
                      </div>

                      {/* Document link */}
                      {o.document_url && (
                        <a href={o.document_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[#D4AF37] text-xs hover:text-amber-300 transition-colors border-t border-white/10 pt-3">
                          <FileText size={13} /> צפה במסמך ההצעה המקורי
                        </a>
                      )}

                      {/* Self-manage CTA */}
                      {canManage && (
                        <div className="mt-1 pt-3 border-t border-white/10">
                          <p className="text-blue-400 text-xs font-bold mb-2 flex items-center gap-1.5">
                            <Handshake size={13} /> כשחקן בוגר, באפשרותך לנהל את ההעברה שלך בעצמך ולאשר אותה ישירות
                          </p>
                          {confirmingId !== o.id ? (
                            <button onClick={() => setConfirmingId(o.id)}
                              className="w-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold text-xs py-2.5 rounded-lg hover:bg-blue-500/25 transition-colors flex items-center justify-center gap-2">
                              נהל את ההעברה שלי בעצמי <ArrowLeft size={13} />
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <input value={signName} onChange={e => setSignName(e.target.value)}
                                placeholder="הקלד את שמך המלא כאישור ניהול עצמי"
                                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
                              <button onClick={() => manageOwnTransfer.mutate(o)} disabled={!signName.trim() || manageOwnTransfer.isPending}
                                className="w-full bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs py-2.5 rounded-lg hover:bg-green-500/25 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                                {manageOwnTransfer.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                אני מאשר/ת את ההעברה כשחקן עצמאי
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, highlight, ltr }) {
  return (
    <div className={`flex items-center gap-2 bg-[#0D1B2A]/60 border border-white/10 rounded-lg px-2.5 py-2 ${highlight ? 'border-[#D4AF37]/25' : ''}`}>
      <Icon size={12} className={highlight ? 'text-[#D4AF37]' : 'text-white/40'} />
      <div className="min-w-0">
        <div className="text-white/40 text-[10px] leading-none">{label}</div>
        <div className={`text-xs font-bold ${highlight ? 'text-[#D4AF37]' : 'text-white'} truncate`} dir={ltr ? 'ltr' : 'rtl'}>{value}</div>
      </div>
    </div>
  );
}