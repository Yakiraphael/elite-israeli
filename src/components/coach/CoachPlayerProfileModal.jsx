import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, MessageCircle, AlertTriangle, Pencil, Check, Loader2 } from 'lucide-react';
import CaseNotesPanel from '../player/CaseNotesPanel';
import GuardianContactCard from '../player/GuardianContactCard';

function calcDaysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function getReadiness(player) {
  if (!player.is_available_next_match) {
    return { color: 'red', label: 'לא כשיר', reason: player.unavailability_reason || 'סומן כלא זמין' };
  }
  if (!player.medical_certificate_url) {
    return { color: 'red', label: 'לא כשיר', reason: 'חסר אישור רפואי' };
  }
  const days = calcDaysLeft(player.medical_expiry_date);
  if (days !== null && days < 0) return { color: 'red', label: 'לא כשיר', reason: 'אישור רפואי פג תוקף' };
  if (player.yellow_cards_count >= 3) return { color: 'red', label: 'לא כשיר', reason: 'הרחקה — 3 כרטיסים צהובים' };
  if (days !== null && days < 30) return { color: 'yellow', label: 'מוגבל', reason: `אישור רפואי יפוג בעוד ${days} ימים` };
  return { color: 'green', label: 'כשיר', reason: '100% פעילות' };
}

function whatsappLink(player) {
  const raw = player.is_adult ? player.phone : (player.parent_phone || player.phone);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? '972' + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

const READY_COLORS = {
  green: { dot: '#10B981', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  yellow: { dot: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  red: { dot: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

export default function CoachPlayerProfileModal({ player, onClose }) {
  const queryClient = useQueryClient();
  const readiness = getReadiness(player);
  const rc = READY_COLORS[readiness.color];
  const wa = whatsappLink(player);

  const { data: mental } = useQuery({
    queryKey: ['mental-assessment', player.id],
    queryFn: async () => {
      const list = await base44.entities.MentalAssessment.filter({ player_id: player.id }, '-assessment_date', 1);
      return list[0] || null;
    },
  });

  const update = useMutation({
    mutationFn: (data) => base44.entities.PlayerRegistration.update(player.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coach-players'] }),
  });

  const toggleAvailability = () => update.mutate({ is_available_next_match: !player.is_available_next_match });

  const [markingInjury, setMarkingInjury] = useState(false);
  const [injuryReason, setInjuryReason] = useState('');
  const handleMarkInjury = () => {
    if (!injuryReason.trim()) return;
    update.mutate({ is_available_next_match: false, unavailability_reason: injuryReason.trim() });
    setMarkingInjury(false);
    setInjuryReason('');
  };

  const [editingRating, setEditingRating] = useState(false);
  const [ratingVal, setRatingVal] = useState(player.overall_rating || '');
  const saveRating = () => { update.mutate({ overall_rating: Number(ratingVal) || null }); setEditingRating(false); };

  const [tagInput, setTagInput] = useState('');
  const addTag = () => {
    if (!tagInput.trim()) return;
    update.mutate({ coach_impact_tags: [...(player.coach_impact_tags || []), tagInput.trim()] });
    setTagInput('');
  };
  const removeTag = (i) => update.mutate({ coach_impact_tags: (player.coach_impact_tags || []).filter((_, idx) => idx !== i) });

  const [editingTalk, setEditingTalk] = useState(false);
  const [talkVal, setTalkVal] = useState(player.coach_talking_point || '');
  const saveTalk = () => { update.mutate({ coach_talking_point: talkVal.trim() }); setEditingTalk(false); };

  const minutes = player.last_match_minutes || [];
  const maxMin = Math.max(90, ...minutes);
  const resilienceVals = mental ? [mental.resilience_error_recovery, mental.resilience_disadvantage_drive, mental.resilience_squad_status, mental.resilience_emotional_control].filter(v => v != null) : [];
  const resilienceAvg = resilienceVals.length ? (resilienceVals.reduce((a, b) => a + b, 0) / resilienceVals.length).toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80" onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-t-2xl sm:rounded-lg w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl">

        {/* Header */}
        <div className="sticky top-0 bg-[#1B263B] border-b border-white/10 p-5 z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-black text-lg">{player.full_name}</h3>
              <p className="text-white/40 text-xs">{player.position}{player.secondary_position ? ` / ${player.secondary_position}` : ''}{player.team_name ? ` · ${player.team_name}` : ''}</p>
            </div>
            <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
          </div>

          {/* 1. Readiness header */}
          <div className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${rc.bg} ${rc.border}`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: rc.dot }} />
              <div>
                <div className={`text-sm font-black ${rc.text}`}>{readiness.label}</div>
                <div className="text-white/50 text-[11px]">{readiness.reason}</div>
              </div>
            </div>
            <button onClick={toggleAvailability}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors flex-shrink-0 ${player.is_available_next_match ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
              {player.is_available_next_match ? '✓ זמין למשחק הבא' : '✗ לא זמין'}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* 2. Actionable alerts */}
          <div className="space-y-2">
            {!player.medical_certificate_url && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg p-2.5 text-red-400 text-xs font-bold">
                <AlertTriangle size={13} /> חסר אישור רפואי – לא לזימון
              </div>
            )}
            {player.yellow_cards_count >= 3 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg p-2.5 text-red-400 text-xs font-bold">
                <AlertTriangle size={13} /> צבר {player.yellow_cards_count} כרטיסים צהובים – מורחק מהמשחק הבא
              </div>
            )}
            {player.unavailability_reason && player.is_available_next_match === false && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-lg p-2.5 text-amber-400 text-xs font-bold">
                <AlertTriangle size={13} /> {player.unavailability_reason}
              </div>
            )}
            {!markingInjury ? (
              <button onClick={() => setMarkingInjury(true)} className="text-[11px] font-bold text-white/40 hover:text-white transition-colors">סמן פציעה / הרחקה →</button>
            ) : (
              <div className="flex gap-2">
                <input value={injuryReason} onChange={e => setInjuryReason(e.target.value)} placeholder="סיבה (למשל: פציעת ברך)"
                  className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
                <button onClick={handleMarkInjury} className="bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold px-3 rounded-sm">שמור</button>
              </div>
            )}
          </div>

          {/* 3. Tactical profile */}
          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 space-y-3">
            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">פרופיל מקצועי-טקטי</h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">ציון ביצועים</span>
              {!editingRating ? (
                <button onClick={() => setEditingRating(true)} className="flex items-center gap-1 text-white font-bold">
                  {player.overall_rating ?? '—'} <Pencil size={10} className="text-white/30" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input type="number" value={ratingVal} onChange={e => setRatingVal(e.target.value)} className="w-16 bg-[#1B263B] border border-white/15 rounded-sm px-1.5 py-1 text-white text-xs" />
                  <button onClick={saveRating}><Check size={13} className="text-green-400" /></button>
                </div>
              )}
            </div>
            <div>
              <div className="text-white/50 text-xs mb-1.5">מדדי אימפקט</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(player.coach_impact_tags || []).map((t, i) => (
                  <span key={i} onClick={() => removeTag(i)} className="cursor-pointer text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 px-2 py-1 rounded-full">
                    {t} ✕
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="הוסף תיוג (למשל: מהירות גבוהה)"
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  className="flex-1 bg-[#1B263B] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
                <button onClick={addTag} className="text-[11px] font-bold text-[#D4AF37]">הוסף</button>
              </div>
            </div>
            <CaseNotesPanel playerId={player.id} playerName={player.full_name} authorRole="מאמן" />
          </div>

          {/* 4. Mental & social */}
          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 space-y-3">
            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">פרופיל מנטלי וחברתי</h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">מדד חוסן (1-5)</span>
              <span className="text-white font-bold">{resilienceAvg ?? 'אין נתונים'}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/50">נקודה לשיחה</span>
                {!editingTalk && <button onClick={() => setEditingTalk(true)}><Pencil size={11} className="text-white/30" /></button>}
              </div>
              {!editingTalk ? (
                <p className="text-white text-xs">{player.coach_talking_point || '—'}</p>
              ) : (
                <div className="flex gap-2">
                  <input value={talkVal} onChange={e => setTalkVal(e.target.value)} placeholder="למשל: היה לו יום הולדת אתמול"
                    className="flex-1 bg-[#1B263B] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
                  <button onClick={saveTalk}><Check size={14} className="text-green-400" /></button>
                </div>
              )}
            </div>
          </div>

          {/* 5. Quick history */}
          <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 space-y-3">
            <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">היסטוריה מהירה</h4>
            {minutes.length > 0 ? (
              <div className="flex items-end gap-2 h-16">
                {minutes.slice(-5).map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-[#D4AF37]/60 rounded-t-sm" style={{ height: `${Math.max(6, (m / maxMin) * 56)}px` }} />
                    <span className="text-white/30 text-[9px]">{m}'</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-xs">אין נתוני דקות משחק</p>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs py-2.5 rounded-sm hover:bg-green-500/25 transition-colors">
                <MessageCircle size={13} /> {player.is_adult ? 'שלח וואטסאפ לשחקן' : 'שלח וואטסאפ להורה'}
              </a>
            )}
          </div>

          <GuardianContactCard player={player} />
        </div>
      </motion.div>
    </div>
  );
}