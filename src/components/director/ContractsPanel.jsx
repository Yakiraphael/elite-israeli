import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Loader2, FileText, ShieldAlert, Send, ExternalLink, PenLine, Baby, User, Edit3, Repeat } from 'lucide-react';
import ContractFillModal from '../contracts/ContractFillModal';
import { getContractForms, getOfficialForm } from '@/lib/ifaOfficialForms';
import { signatureStatus } from '@/lib/contractTemplates';
import OfficialContractSignModal from '../contracts/OfficialContractSignModal';

function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

function statusBadge(contract) {
  if (contract.status === 'ממתין לחתימה') return { label: '⏳ ממתין לחתימה', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  if (contract.status === 'בוטל') return { label: '✗ בוטל', cls: 'bg-white/10 text-white/40 border-white/10' };
  const days = daysLeft(contract.end_date);
  if (days !== null && days < 0) return { label: '🔴 פג תוקף', cls: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (days !== null && days < 30) return { label: `🟡 ${days} ימים`, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  if (days !== null && days < 90) return { label: `🟢 ${days} ימים`, cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
  return { label: '✓ חתום', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
}

export default function ContractsPanel() {
  const [showCreate, setShowCreate] = useState(false);
  const [signing, setSigning] = useState(null); // { contract, formKey }
  const [filling, setFilling] = useState(null); // contract to fill
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date', 100),
  });

  const { data: settingsList = [] } = useQuery({
    queryKey: ['compliance-settings'],
    queryFn: () => base44.entities.ComplianceSettings.list(),
  });
  const settings = settingsList[0];

  const toggleBlocking = useMutation({
    mutationFn: () => settings
      ? base44.entities.ComplianceSettings.update(settings.id, { enforce_medical_blocking: !settings.enforce_medical_blocking })
      : base44.entities.ComplianceSettings.create({ enforce_medical_blocking: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compliance-settings'] }),
  });

  const shareLink = (c) => `${window.location.origin}/sign-contract?contract_id=${c.id}`;

  // קבלת formKey מהחוזה — בדיקה גם במפתח ipa_template_key (legacy) וגם ifa_template_key
  const getFormKey = (contract) => {
    // ניסיון לזהות לפי שפה וסוג
    if (contract.contract_type?.includes('מאמן')) return 'coach_agreement_he';
    if (contract.contract_type === 'חוזה מקצועי') return 'player_agreement_en';
    if (contract.contract_type === 'חוזה חובבני') return 'player_agreement_amateur';
    return 'player_agreement_he';
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-base">ניהול חוזים — טפסי ההתאחדות הרשמיים</h3>
        <button onClick={() => setShowCreate(true)}
          className="min-h-[44px] flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 rounded-sm hover:bg-amber-400 transition-colors">
          <Plus size={14} /> חוזה חדש
        </button>
      </div>

      {/* Compliance toggle */}
      <div className="bg-[#1B263B] border border-amber-500/20 rounded-lg p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-xs">מצב חסימה — Compliance Enforcement</div>
            <p className="text-white/40 text-[10px]">שחקן ללא אישור רפואי בתוקף לא יופיע בסגל הפעיל</p>
          </div>
        </div>
        <button onClick={() => toggleBlocking.mutate()}
          className={`min-h-[44px] min-w-[70px] rounded-full px-1 transition-colors relative flex-shrink-0 ${settings?.enforce_medical_blocking ? 'bg-green-500' : 'bg-white/15'}`}>
          <span className={`block w-8 h-8 bg-white rounded-full transition-transform ${settings?.enforce_medical_blocking ? 'translate-x-[-38px]' : ''}`} />
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[#D4AF37]" /></div>}

      <div className="space-y-2">
        {!isLoading && contracts.length === 0 && (
          <div className="text-center py-12 text-white/30 text-sm">אין חוזים עדיין — לחץ "חוזה חדש" כדי להתחיל</div>
        )}
        {contracts.map(c => {
          const badge = statusBadge(c);
          const sig = signatureStatus(c);
          const fullySigned = c.status === 'חתום';
          const formKey = getFormKey(c);
          const form = getOfficialForm(formKey);
          return (
            <div key={c.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <FileText size={16} className="text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm">{c.player_name}</div>
                  <div className="text-white/40 text-xs">{c.contract_type} · {c.start_date || '—'} עד {c.end_date}</div>
                  {form && (
                    <div className="text-white/25 text-[10px] mt-0.5">{form.label}</div>
                  )}
                  {fullySigned && c.signed_at && (
                    <div className="text-white/25 text-[10px] mt-1">נחתם סופית · {new Date(c.signed_at).toLocaleString('he-IL')}</div>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
              </div>

              {/* חתימות + פעולות */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                {sig.player && (
                  <span className={`text-[10px] font-bold ${sig.player.cls}`}>{sig.player.label}</span>
                )}
                {sig.guardian && (
                  <span className={`text-[10px] font-bold ${sig.guardian.cls}`}>{sig.guardian.label}</span>
                )}
                <div className="flex-1" />
                {!fullySigned && (
                  <>
                    <button
                      onClick={() => setFilling(c)}
                      className="flex items-center gap-1 text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full hover:bg-blue-500/25 transition-colors">
                      <Edit3 size={11} /> מלא חוזה
                    </button>
                    <button
                      onClick={() => setSigning({ contract: c, formKey })}
                      className="flex items-center gap-1 text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1 rounded-full hover:bg-[#D4AF37]/25 transition-colors">
                      <PenLine size={11} /> פתח לחתימה
                    </button>
                    <a href={shareLink(c)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-bold bg-white/5 text-white/60 border border-white/15 px-2.5 py-1 rounded-full hover:bg-white/10 transition-colors">
                      <Send size={11} /> קישור לשחקן
                    </a>
                  </>
                )}
                {form?.pdf_url && (
                  <a href={form.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 text-[10px] hover:text-[#D4AF37] flex items-center gap-1">
                    <ExternalLink size={10} /> PDF מקורי
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filling && <ContractFillModal contract={filling} onClose={() => setFilling(null)} onSaved={() => setFilling(null)} />}
      {showCreate && <CreateContractModal onClose={() => setShowCreate(false)} />}

      {signing && (
        <OfficialContractSignModal
          contractKey={signing.formKey}
          contract={signing.contract}
          player={null}
          signerRole="director"
          currentUser={user}
          onClose={() => setSigning(null)}
          onSigned={() => { setSigning(null); queryClient.invalidateQueries({ queryKey: ['contracts'] }); }}
        />
      )}
    </div>
  );
}

// ===== מודל יצירת חוזה חדש =====
function CreateContractModal({ onClose }) {
  const queryClient = useQueryClient();
  const forms = getContractForms();
  const [selectedFormKey, setSelectedFormKey] = useState(forms[0]?.key || '');
  const [search, setSearch] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [clubName, setClubName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salary, setSalary] = useState('');
  const [openTransfer, setOpenTransfer] = useState(true);
  const [notifyPlayer, setNotifyPlayer] = useState(true);

  const selectedForm = getOfficialForm(selectedFormKey);
  const formIsTransfer = selectedForm?.category === 'transfer'
    || !!selectedFormKey?.includes('player_loan')
    || !!selectedFormKey?.includes('player_transfer')
    || !!selectedFormKey?.includes('player_removal')
    || !!selectedFormKey?.includes('player_cancellation');
  const formIsPlayerContract = selectedForm?.category === 'player_contract';

  const { data: players = [] } = useQuery({
    queryKey: ['contract-player-search', search],
    queryFn: () => base44.entities.PlayerRegistration.filter({}, '-created_date', 200),
    enabled: search.length > 1,
  });
  const matches = players.filter(p => p.full_name?.includes(search)).slice(0, 6);

  const pickPlayer = (p) => {
    setPlayerData(p);
    setClubName(p.team_name || clubName);
    setSearch(p.full_name);
  };

  const create = useMutation({
    mutationFn: async () => {
      const isGuardianRequired = selectedForm?.requires_guardian && playerData && !playerData.is_adult;
      const user = await base44.auth.me().catch(() => null);

      // 1. יצירת החוזה עצמו
      const contract = await base44.entities.Contract.create({
        player_id: playerData?.id || '',
        player_name: playerData?.full_name || search,
        contract_type: selectedForm?.category === 'coach_contract' ? 'חוזה מאמן' : salary ? 'חוזה מקצועי' : 'חוזה חובבני',
        ifa_template_key: selectedFormKey,
        ifa_form_reference: selectedForm?.label,
        club_name: clubName,
        start_date: startDate,
        end_date: endDate,
        salary_monthly: Number(salary) || null,
        requires_guardian: isGuardianRequired,
        document_content: `טופס רשמי: ${selectedForm?.label} — ${selectedForm?.pdf_url}`,
        status: 'ממתין לחתימה',
      });

      // 2. פתיחת תהליך העברה/השאלה במקביל (ברירת מחדל לטפסי העברה/השאלה ולחוזי שחקן חדשים)
      let transferProposal = null;
      if (openTransfer && playerData && (formIsTransfer || formIsPlayerContract)) {
        const ageFlag = !!playerData.is_adult;
        const isLoan = selectedFormKey?.includes('loan');
        const category = isLoan
          ? (ageFlag ? 'השאלה - בוגרים - תוך ארצי' : 'השאלת נוער')
          : (ageFlag ? 'בוגרים - תוך ארצי' : 'העברת נוער');
        try {
          transferProposal = await base44.entities.TransferProposal.create({
            club_name: clubName || playerData.team_name || 'מועדון קולט',
            contact_name: user?.full_name || 'מנהל מקצועי',
            player_elite_id: playerData.elite_id || playerData.id,
            player_name: playerData.full_name,
            proposal_details: `נפתח אוטומטית מיצירת חוזה: ${selectedForm?.label} (חוזה #${contract.id})`,
            transfer_category: category,
            is_adult: ageFlag,
            player_consent: false,
            status: 'ממתין לאישור הנהלה',
            notes: `תהליך שנפתח אוטומטית מתוך יצירת חוזה על ידי ${user?.full_name || 'מנהל מקצועי'}`,
          });
        } catch (err) { console.error('Auto-transfer open failed:', err); }
      }

      // 3. שליחת הודעה לשחקן/הורה על חוזה הממתין לחתימה
      if (notifyPlayer && playerData) {
        const audience = playerData.is_adult ? 'player' : 'parent';
        const targetEmail = playerData.is_adult ? (playerData.manager_email || '') : (playerData.parent_email || '');
        try {
          await base44.entities.Notification.create({
            audience,
            type: 'contract_pending',
            title: `חוזה חדש ממתין לחתימה — ${selectedForm?.label}`,
            body: `נפתח חוזה עבור ${playerData.full_name} על ידי ${clubName || 'המועדון'}. יש להיכנס לפורטל ולחתום דיגיטלית.`,
            player_id: playerData.id,
            player_name: playerData.full_name,
            link_tab: 'transfer',
            target_user_email: targetEmail || undefined,
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
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-[#1B263B] border border-white/10 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-base">חוזה חדש — טפסי ההתאחדות 2026/27</h3>
          <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
        </div>

        {/* בחירת טופס */}
        <div className="mb-4">
          <label className="text-white/40 text-xs mb-2 block">בחר טופס רשמי</label>
          <div className="space-y-2">
            {forms.map(f => (
              <button key={f.key} onClick={() => setSelectedFormKey(f.key)}
                className={`w-full text-right p-3 rounded-lg border transition-colors ${selectedFormKey === f.key ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40' : 'border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-bold text-xs">{f.label}</span>
                  <a href={f.pdf_url} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-white/30 hover:text-[#D4AF37] flex-shrink-0">
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{f.league_type === 'professional' ? 'ליגות מקצועניות' : f.league_type === 'amateur' ? 'חובבניות/נוער' : 'כל הליגות'}</span>
                  {f.requires_guardian && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1"><Baby size={9} />נדרש הורה</span>}
                  {f.negotiable_fields.length > 0 && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">{f.negotiable_fields.length} סעיפים למו"מ</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-white/40 text-xs">חפש שחקן/מאמן</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="שם..."
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
            {matches.length > 0 && (
              <div className="mt-1 bg-[#0D1B2A] border border-white/10 rounded-lg overflow-hidden">
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

          {playerData && !playerData.is_adult && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm p-2 text-amber-400 text-[10px] font-bold flex items-center gap-1.5">
              <ShieldAlert size={11} /> שחקן קטין — ידרשו חתימות שחקן + אפוטרופוס ({playerData.guardian_name || 'לא מוגדר'})
            </div>
          )}

          <div>
            <label className="text-white/40 text-xs">שם המועדון</label>
            <input value={clubName} onChange={e => setClubName(e.target.value)} placeholder="שם מועדון"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>

          <div>
            <label className="text-white/40 text-xs">שכר חודשי (₪) — אם רלוונטי</label>
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="0 = חובבני ללא שכר"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs">תאריך תחילה</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs">תאריך סיום</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none" />
            </div>
          </div>

          {/* פעולות אוטומטיות בעת יצירת החוזה */}
          {(formIsTransfer || formIsPlayerContract) && playerData && (
            <div className="bg-[#0D1B2A]/60 border border-white/10 rounded-lg p-3 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={openTransfer} onChange={e => setOpenTransfer(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Repeat size={11} className="text-blue-400" /> פתח תהליך העברה/השאלה במקביל
                  </div>
                  <div className="text-white/40 text-[10px] mt-0.5 leading-snug">
                    {formIsTransfer
                      ? 'הטופס שנבחר שייך למשפחת ההעברות — יפתח תיק העברה עם שלבי אישור מול מועדון קולט/מעביר ואימות התאחדות הרשמית.'
                      : 'חוזה שחקן חדש דורש פתיחת תיק העברה/השאלה במקביל כדי לאפשר אימות מול ההתאחדות הרשמית. ניתן לבטל אם מדובר בחידוש חוזה לאותו מועדון.'}
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={notifyPlayer} onChange={e => setNotifyPlayer(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Send size={11} className="text-green-400" /> שלח הודעה לשחקן{!playerData.is_adult ? '/הורה' : ''}
                  </div>
                  <div className="text-white/40 text-[10px] mt-0.5 leading-snug">
                    השחקן יקבל התראה בפורטל שלו על חוזה הממתין לחתימה, עם קישור לחתימה דיגיטלית.
                  </div>
                </div>
              </label>
            </div>
          )}

          <button
            disabled={(!playerData && !search) || !endDate || create.isPending}
            onClick={() => create.mutate()}
            className="w-full min-h-[44px] bg-[#D4AF37] text-[#0D1B2A] font-black text-sm rounded-sm hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {create.isPending ? <Loader2 size={16} className="animate-spin" /> : 'צור חוזה ושלח לחתימה'}
          </button>
          <p className="text-white/25 text-[10px] text-center">
            החוזה יישמר במערכת ויופיע לחתימה על הטופס הרשמי של ההתאחדות.
            המנהל האישי יוכל להציע שינויים לסעיפים לפני החתימה הסופית.
          </p>
        </div>
      </div>
    </div>
  );
}