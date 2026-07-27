import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Check, ChevronDown, ChevronUp, User, Baby } from 'lucide-react';
import { getOfficialForm } from '@/lib/ifaOfficialForms';

// כרטיס "שליחת מסמך לשחקן לחתימה דרך המערכת" — מופיע בעורך התבניות לאחר מילוי המסמך.
// יוצר רשומת Contract עם document_url מקושר + Notification לשחקן/הורה
// + פותח אוטומטית תיק העברה/השאלה כאשר הטופס משפחת העברה/חוזה שחקן.

const DEFAULT_END_DATE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function SendToPlayerCard({ documentUrl, documentLabel, formKey }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [clubName, setClubName] = useState('');
  const [openTransfer, setOpenTransfer] = useState(true);
  const [notifyPlayer, setNotifyPlayer] = useState(true);
  const [sent, setSent] = useState(false);
  const queryClient = useQueryClient();

  const form = getOfficialForm(formKey);
  const formIsTransfer = form?.category === 'transfer'
    || !!formKey?.includes('player_transfer')
    || !!formKey?.includes('player_loan')
    || !!formKey?.includes('player_removal')
    || !!formKey?.includes('player_cancellation');
  const formIsPlayerContract = form?.category === 'player_contract';
  const canAutoTransfer = formIsTransfer || formIsPlayerContract;

  const { data: players = [] } = useQuery({
    queryKey: ['send-players-search', search],
    queryFn: () => base44.entities.PlayerRegistration.filter({}, '-created_date', 200),
    enabled: search.length > 1,
  });
  const matches = players.filter(p => p.full_name?.includes(search)).slice(0, 6);

  const pickPlayer = (p) => {
    setPlayerData(p);
    setClubName(p.team_name || clubName);
    setSearch(p.full_name);
  };

  const send = useMutation({
    mutationFn: async () => {
      if (!playerData) throw new Error('יש לבחור שחקן');
      const user = await base44.auth.me().catch(() => null);

      // 1. צור רשומת Contract עם המסמך שכבר מולא
      const contract = await base44.entities.Contract.create({
        player_id: playerData.id,
        player_name: playerData.full_name,
        contract_type: form?.category === 'coach_contract' ? 'חוזה מאמן'
          : formIsTransfer ? 'טופס העברה'
          : formIsPlayerContract ? 'חוזה שחקן'
          : 'מסמך רשמי',
        ifa_template_key: formKey,
        ifa_form_reference: form?.label || documentLabel,
        club_name: clubName || playerData.team_name || 'מועדון',
        document_url: documentUrl,
        document_content: `נשלח ישירות מעורך התבניות: ${form?.label || documentLabel}`,
        requires_guardian: !!form?.requires_guardian && !playerData.is_adult,
        end_date: DEFAULT_END_DATE,
        status: 'ממתין לחתימה',
      });

      // 2. פתח תיק העברה/השאלה במקביל (ברירת מחדל לטפסי העברה/השאלה ולחוזי שחקן חדשים)
      let transferProposal = null;
      if (openTransfer && canAutoTransfer) {
        try {
          const ageFlag = !!playerData.is_adult;
          const isLoan = formKey?.includes('loan');
          const category = isLoan
            ? (ageFlag ? 'השאלה - בוגרים - תוך ארצי' : 'השאלת נוער')
            : (ageFlag ? 'בוגרים - תוך ארצי' : 'העברת נוער');
          transferProposal = await base44.entities.TransferProposal.create({
            club_name: clubName || playerData.team_name || 'מועדון קולט',
            contact_name: user?.full_name || 'מנהל מקצועי',
            player_elite_id: playerData.elite_id || playerData.id,
            player_name: playerData.full_name,
            proposal_details: `נפתח מעורך התבניות לאחר מילוי: ${form?.label || documentLabel} (חוזה #${contract.id})`,
            transfer_category: category,
            is_adult: ageFlag,
            status: 'ממתין לאישור הנהלה',
            notes: `תהליך אוטומטי מעורך התבניות על ידי ${user?.full_name || 'מנהל מקצועי'}`,
          });
        } catch (err) { console.error('Auto-transfer open failed:', err); }
      }

      // 3. שלח הודעה לשחקן/הורה
      if (notifyPlayer) {
        try {
          await base44.entities.Notification.create({
            audience: playerData.is_adult ? 'player' : 'parent',
            type: 'contract_pending',
            title: `מסמך חדש ממתין לחתימה — ${form?.label || documentLabel}`,
            body: `המועדון שלח לך מסמך דרך המערכת. יש להיכנס לפורטל, לעבור על המסמך ולחתום דיגיטלית.`,
            player_id: playerData.id,
            player_name: playerData.full_name,
            link_tab: 'transfer',
            target_user_email: playerData.is_adult ? (playerData.manager_email || undefined) : (playerData.parent_email || undefined),
            is_read: false,
          });
        } catch (err) { console.error('Notification create failed:', err); }
      }

      return { contract, transferProposal };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['dir-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-proposals'] });
      setSent(true);
    },
  });

  return (
    <div className="bg-[#0D1B2A]/60 border border-[#D4AF37]/20 rounded-lg overflow-hidden">
      <button onClick={() => setCollapsed(c => !c)} className="w-full flex items-center gap-2 p-3 hover:bg-white/[0.03] transition-colors text-right">
        <Send size={14} className="text-[#D4AF37]" />
        <div className="flex-1">
          <div className="text-white font-bold text-xs">שלח את המסמך לשחקן לחתימה דרך המערכת</div>
          <div className="text-white/40 text-[10px] mt-0.5">צור חוזה, שלח קישור חתימה ישירות לפורטל השחקן/הורה{canAutoTransfer ? ' + פתח תיק העברה אוטומטי' : ''}</div>
        </div>
        {collapsed ? <ChevronDown size={14} className="text-white/40" /> : <ChevronUp size={14} className="text-white/40" />}
      </button>
      {!collapsed && !sent && (
        <div className="p-4 border-t border-white/5 space-y-3">
          <div>
            <label className="text-white/40 text-xs">חפש שחקן</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="שם שחקן..."
              className="w-full bg-[#1B263B] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
            {matches.length > 0 && (
              <div className="mt-1 bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
                {matches.map(p => (
                  <button key={p.id} onClick={() => pickPlayer(p)}
                    className="w-full text-right px-3 py-2 text-white/70 text-xs hover:bg-white/5 flex items-center gap-2">
                    {p.is_adult ? <User size={11} className="text-white/30" /> : <Baby size={11} className="text-amber-400" />}
                    {p.full_name} {p.team_name ? `· ${p.team_name}` : ''} {p.is_adult ? '' : '(קטין)'}
                  </button>
                ))}
              </div>
            )}
          </div>
          {playerData && (
            <>
              <div>
                <label className="text-white/40 text-xs">שם המועדון</label>
                <input value={clubName} onChange={e => setClubName(e.target.value)} placeholder="שם מועדון"
                  className="w-full bg-[#1B263B] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
              </div>
              {canAutoTransfer && (
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={openTransfer} onChange={e => setOpenTransfer(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#D4AF37]" />
                    <div className="text-white/70 text-[11px] leading-snug">פתח תהליך העברה/השאלה במקביל (חובה לחוזי שחקן ולטפסי העברה)</div>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={notifyPlayer} onChange={e => setNotifyPlayer(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#D4AF37]" />
                    <div className="text-white/70 text-[11px] leading-snug">שלח הודעה לשחקן{!playerData.is_adult ? '/הורה' : ''} עם קישור חתימה</div>
                  </label>
                </div>
              )}
              <button onClick={() => send.mutate()} disabled={send.isPending}
                className="w-full min-h-[44px] bg-[#D4AF37] text-[#0D1B2A] font-black text-sm rounded-sm hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                {send.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                שלח מסמך לחתימה
              </button>
              {send.isError && <div className="text-red-400 text-[11px]">{send.error?.message || 'השליחה נכשלה'}</div>}
            </>
          )}
        </div>
      )}
      {sent && (
        <div className="p-4 border-t border-white/5 bg-green-500/5 flex items-center gap-2 text-green-400 text-xs font-bold">
          <Check size={14} /> המסמך נשלח לשחקן — יקבל התראה בפורטל עם קישור לחתימה
        </div>
      )}
    </div>
  );
}