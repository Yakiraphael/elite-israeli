import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ChevronDown, ChevronLeft, Clock, CheckCircle2, XCircle, Pencil, Plus,
  History, UserCircle, Lock, MessageSquare, CheckCheck, Save,
} from 'lucide-react';
import ClauseProposeInline from './ClauseProposeInline';
import { formatClauseValue } from '@/lib/contractClauses';
import { canRole } from '@/lib/negotiationAudit';

// כרטיס סעיף חוזה בודד: מציג ערך נוכחי, הצעה אחרונה, סטטוס הסכמה, מי לחץ/הציע/אישר,
// וסטוריה מתרחבת. פעולות נעולות לפי תפקיד (role): מועדון → עריכה; אחרים → הצעה בלבד.
const STATUS_META = {
  pending:  { icon: Clock,         color: '#F59E0B', bg: 'bg-amber-400/10', border: 'border-amber-400/30', label: 'בבדיקה — ממתינה למועדון' },
  accepted: { icon: CheckCircle2,   color: '#10B981', bg: 'bg-green-400/10', border: 'border-green-400/30', label: 'מאושר — ערך רשמי בחוזה' },
  rejected: { icon: XCircle,        color: '#EF4444', bg: 'bg-red-400/10',   border: 'border-red-400/30',   label: 'דורש תיקון — נדחה' },
};

function fmtDate(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return String(ts); }
}

// טקסט לתצוגת "מי עשה את הפעולה האחרונה" בסעיף
function lastActorLabel(clause, role) {
  if (!clause.history.length && clause.clubValue) return 'מועדון (טיוטה ראשונית)';
  if (!clause.history.length) return '—';
  const last = clause.history[clause.history.length - 1];
  if (last.status === 'pending') {
    const who = last.sender_role === 'manager' ? `מנהל אישי — ${last.sender_name || ''}`.trim() : `${last.sender_role === 'player' ? 'שחקן' : last.sender_role} — ${last.sender_name || ''}`.trim();
    return `${who} · הציע ${fmtDate(last.created_date)}`;
  }
  if (last.responded_at) return `מועדון — ${last.status === 'accepted' ? 'אישר' : 'דחה'} ${fmtDate(last.responded_at)}`;
  return last.sender_name || '—';
}

export default function ClauseCard({ clause, proposal, player, role, currentUser }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const canEdit = canRole(role, 'canEdit');
  const canPropose = canRole(role, 'canPropose');
  const sm = STATUS_META[clause.latestStatus] || STATUS_META.pending;
  const SIcon = sm.icon;
  const conflict = clause.clubValue && clause.latestProposal && clause.clubValue !== clause.latestProposal && clause.latestStatus === 'pending';

  return (
    <div className={`bg-[#1B263B] border ${conflict ? 'border-amber-400/40' : 'border-white/10'} rounded-lg p-3`} dir="rtl">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs font-bold">{clause.clauseLabel}</span>
            {conflict && <span className="text-amber-400 text-[9px] font-black">⚡ מחלוקת</span>}
          </div>
          {/* שורת ערכים: מועדון (current) ← הצעת שחקן */}
          <div className="text-[11px] mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-white/40">מועדון: <span className="text-white/80 font-bold">{formatClauseValue(clause.clauseKey, clause.clubValue) || '—'}</span></span>
            {clause.latestProposal && (
              <>
                <span className="text-white/20">←</span>
                <span className="text-[#D4AF37] font-bold">הצעה: {formatClauseValue(clause.clauseKey, clause.latestProposal)}</span>
              </>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${sm.bg} ${sm.color} ${sm.border} flex-shrink-0`}>
          <SIcon size={11} /> {sm.label}
        </span>
      </div>

      {/* מי היה הגורם האחרון שנגע בסעיף */}
      <div className="flex items-center gap-1.5 mt-2 text-white/50 text-[10px]">
        <UserCircle size={11} className="text-white/40" />
        <span className="font-bold">Logged By:</span>
        <span className="text-white/75">{lastActorLabel(clause, role)}</span>
      </div>

      {/* פעולות לפי תפקיד */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {canEdit ? (
          <button onClick={() => setEditing(e => !e)}
          disabled={proposal.status === 'אושרה סופית'}
          className="flex items-center gap-1 text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1.5 rounded-sm hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-40">
          {clause.clubValue ? <Pencil size={11} /> : <Plus size={11} />} {clause.clubValue ? 'ערוך סעיף' : 'קבע סעיף'}
          </button>
        ) : canPropose ? (
          <button onClick={() => setEditing(e => !e)}
            className="flex items-center gap-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1.5 rounded-sm hover:bg-blue-500/20 transition-colors">
            <Pencil size={11} /> הצע שינוי לסעיף
          </button>
        ) : (
          <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold"><Lock size={11} /> קריאה בלבד</div>
        )}
        {clause.history.length > 0 && (
          <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-[10px] font-bold text-white/50 hover:text-white transition-colors px-2 py-1.5">
            <History size={11} /> היסטוריה ({clause.history.length})
            {expanded ? <ChevronDown size={11} /> : <ChevronLeft size={11} />}
          </button>
        )}
      </div>

      {/* טופס עריכה/הצעה */}
      {editing && (
        <ClauseProposeInline def={{ key: clause.clauseKey, label: clause.clauseLabel, type: clause.def.type, mapsToField: clause.def.mapsToField, alsoCompute: clause.def.alsoCompute, category: clause.def.category }}
          proposal={proposal} player={player} role={role} currentUser={currentUser} onClose={() => setEditing(false)} />
      )}

      {/* סטוריה מתרחבת */}
      {expanded && clause.history.length > 0 && (
        <div className="mt-3 pt-2 border-t border-white/10 space-y-2">
          <div className="text-white/40 text-[9px] font-bold uppercase tracking-wide flex items-center gap-1">
            <History size={10} /> היסטוריית משא ומתן — תיעוד מלא
          </div>
          {clause.history.map((h, i) => {
            const hm = STATUS_META[h.status] || STATUS_META.pending;
            const HIcon = hm.icon;
            return (
              <div key={i} className={`rounded p-2 border ${hm.bg} ${hm.border}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <HIcon size={11} className="" style={{ color: hm.color }} />
                    <span className="text-[10px] font-bold" style={{ color: hm.color }}>{hm.label}</span>
                  </div>
                  <span className="text-white/30 text-[9px]">{fmtDate(h.status === 'pending' ? h.created_date : (h.responded_at || h.created_date))}</span>
                </div>
                <div className="text-white/80 text-[11px]">
                  <span className="text-white/40">הצעה: </span>{formatClauseValue(clause.clauseKey, h.proposed_value) || '—'}
                  <span className="text-white/40"> · ערך דאז: </span>{formatClauseValue(clause.clauseKey, h.current_value) || '—'}
                </div>
                {h.reasoning && <p className="text-white/50 text-[10px] mt-1 whitespace-pre-wrap">"{h.reasoning}"</p>}
                {h.director_notes && (
                  <p className="text-white/60 text-[10px] mt-1 pt-1 border-t border-white/10 whitespace-pre-wrap">
                    <span className="font-bold text-white/70">תגובת מועדון: </span>{h.director_notes}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-white/5 text-white/40 text-[10px]">
                  <UserCircle size={9} /> {h.sender_role === 'manager' ? 'מנהל אישי' : h.sender_role === 'player' ? 'שחקן' : h.sender_role}: {h.sender_name || '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}