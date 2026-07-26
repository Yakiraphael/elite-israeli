import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, X, Loader2, FileText, ShieldAlert, Send, ExternalLink, PenLine } from 'lucide-react';
import { IFA_TEMPLATES, getTemplate, buildContractDocument, signatureStatus } from '@/lib/contractTemplates';
import ContractSignModal from '../contracts/ContractSignModal';

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
  const [signing, setSigning] = useState(null);
  const queryClient = useQueryClient();

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-base">ניהול חוזים — מנגנון משפטי חכם</h3>
        <button onClick={() => setShowCreate(true)}
          className="min-h-[44px] flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 rounded-sm hover:bg-amber-400 transition-colors">
          <Plus size={14} /> חוזה חדש מתבנית
        </button>
      </div>

      <div className="bg-[#1B263B] border border-amber-500/20 rounded-lg p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-white font-bold text-xs">מצב חסימה — Compliance Enforcement</div>
            <p className="text-white/40 text-[10px]">שחקן ללא אישור רפואי בתוקף לא יופיע בסגל הפעיל של המאמן</p>
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
          <div className="text-center py-12 text-white/30 text-sm">אין חוזים עדיין — לחץ על "חוזה חדש מתבנית" כדי להתחיל</div>
        )}
        {contracts.map(c => {
          const badge = statusBadge(c);
          const sig = signatureStatus(c);
          const fullySigned = c.status === 'חתום';
          return (
            <div key={c.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <FileText size={16} className="text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm">{c.player_name}</div>
                  <div className="text-white/40 text-xs">{c.contract_type} · {c.start_date || '—'} עד {c.end_date}</div>
                  {c.ifa_form_reference && (
                    <div className="text-white/30 text-[10px] mt-0.5">מסמך ייחוס: {c.ifa_form_reference}</div>
                  )}
                  {fullySigned && c.signed_at && (
                    <div className="text-white/25 text-[10px] mt-1">נחתם סופית · {new Date(c.signed_at).toLocaleString('he-IL')}</div>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
              </div>
              {/* Signature progress + actions */}
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
                    <button onClick={() => setSigning(c)} className="flex items-center gap-1 text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1 rounded-full hover:bg-[#D4AF37]/25 transition-colors">
                      <PenLine size={11} /> חתום במערכת
                    </button>
                    <a href={shareLink(c)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-white/5 text-white/60 border border-white/15 px-2.5 py-1 rounded-full hover:bg-white/10 transition-colors" title="קישור חתימה לשיתוף עם שחקן/אפוטרופוס">
                      <Send size={11} /> קישור לחתימה
                    </a>
                  </>
                )}
                {c.ifa_template_key && (
                  <a href={getTemplate(c.ifa_template_key).reference_url} target="_blank" rel="noopener noreferrer" className="text-white/30 text-[10px] hover:text-[#D4AF37] flex items-center gap-1">
                    <ExternalLink size={10} /> טופס מקור
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && <CreateContractModal onClose={() => setShowCreate(false)} />}
      {signing && <ContractSignModal contract={signing} onClose={() => setSigning(null)} />}
    </div>
  );
}

function CreateContractModal({ onClose }) {
  const queryClient = useQueryClient();
  const [tplKey, setTplKey] = useState(IFA_TEMPLATES[0].key);
  const [form, setForm] = useState({ player_name: '', player_id: '', club_name: '', start_date: '', end_date: '', salary_monthly: '' });
  const [search, setSearch] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [issuedBy, setIssuedBy] = useState('');

  const tpl = getTemplate(tplKey);

  const { data: players = [] } = useQuery({
    queryKey: ['contract-player-search', search],
    queryFn: () => base44.entities.PlayerRegistration.filter({}, '-created_date', 200),
    enabled: search.length > 1,
  });
  const matches = players.filter(p => p.full_name?.includes(search)).slice(0, 6);

  const pickPlayer = (p) => {
    setForm(f => ({ ...f, player_id: p.id, player_name: p.full_name, club_name: p.team_name || f.club_name, salary_monthly: f.salary_monthly }));
    setPlayerData(p);
    setSearch(p.full_name);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: async () => {
      const doc = buildContractDocument(tpl, {
        player_name: form.player_name,
        id_number: playerData?.id_number,
        team_name: playerData?.team_name,
        club_name: form.club_name,
        start_date: form.start_date,
        end_date: form.end_date,
        salary_monthly: form.salary_monthly,
        season_label: `${new Date().getFullYear()}/${(new Date().getFullYear() + 1) % 100}`,
        guardian_name: playerData?.guardian_name,
        is_adult: playerData?.is_adult,
        player_phone: playerData?.phone,
        ifa_id: playerData?.ifa_id,
        contract_type: tpl.contract_type,
        issued_by_name: issuedBy.trim() || 'נציג מועדון',
        issued_by_role: 'מנהל מקצועי',
        issued_at: new Date().toISOString(),
        created_date: new Date().toISOString(),
        created_by_club: form.club_name,
      });
      return base44.entities.Contract.create({
        player_id: form.player_id,
        player_name: form.player_name,
        contract_type: tpl.contract_type,
        ifa_template_key: tpl.key,
        ifa_form_reference: tpl.ifa_form_reference,
        club_name: form.club_name,
        start_date: form.start_date,
        end_date: form.end_date,
        salary_monthly: Number(form.salary_monthly) || null,
        requires_guardian: tpl.requires_guardian && playerData ? !playerData.is_adult : tpl.requires_guardian,
        document_content: doc,
        status: 'ממתין לחתימה',
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contracts'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-base">יצירת חוזה חכם מתבנית ההתאחדות</h3>
          <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
        </div>

        <div className="mb-4">
          <label className="text-white/40 text-xs">בחר תבנית רשמית (מבוסס טפסי football.org.il)</label>
          <div className="space-y-2 mt-1.5">
            {IFA_TEMPLATES.map(t => (
              <button key={t.key} onClick={() => setTplKey(t.key)}
                className={`w-full text-right p-3 rounded-sm border transition-colors ${tplKey === t.key ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40' : 'border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-xs">{t.label}</span>
                  <a href={t.reference_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-white/30 hover:text-[#D4AF37]"><ExternalLink size={11} /></a>
                </div>
                <div className="text-white/40 text-[10px] mt-1">{t.description}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{t.requires_guardian ? '✓ נדרשת חתימת אפוטרופוס' : '✓ לשחקן בוגר בלבד'}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-white/40 text-xs">חפש שחקן</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="שם שחקן..."
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
            {matches.length > 0 && (
              <div className="mt-1 bg-[#0D1B2A] border border-white/10 rounded-lg overflow-hidden">
                {matches.map(p => (
                  <button key={p.id} onClick={() => pickPlayer(p)} className="w-full text-right px-3 py-2 text-white/70 text-xs hover:bg-white/5">
                    {p.full_name} {p.team_name ? `· ${p.team_name}` : ''} {p.is_adult ? '(בוגר)' : '(קטין)'}
                  </button>
                ))}
              </div>
            )}
          </div>
          {playerData && playerData.is_adult === false && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm p-2 text-amber-400 text-[10px] font-bold flex items-center gap-1.5">
              <ShieldAlert size={11} /> שחקן קטין — ידרשו חתימות שחקן + אפוטרופוס ({playerData.guardian_name || 'חסר שם אפוטרופוס'})
            </div>
          )}
          <div>
            <label className="text-white/40 text-xs">שם המועדון החתום</label>
            <input value={form.club_name} onChange={e => set('club_name', e.target.value)} placeholder="שם מועדון"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>
          {tpl.contract_type === 'חוזה מקצועי' && (
            <div>
              <label className="text-white/40 text-xs">שכר חודשי (₪)</label>
              <input type="number" value={form.salary_monthly} onChange={e => set('salary_monthly', e.target.value)} placeholder="למשל 5000"
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs">תאריך תחילה</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none" />
            </div>
            <div>
              <label className="text-white/40 text-xs">תאריך סיום</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs">שם נציג המועדון (חותם על היצירה)</label>
            <input value={issuedBy} onChange={e => setIssuedBy(e.target.value)} placeholder="שם מלא ותפקיד"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm mt-1 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>
          <button disabled={!form.player_id || !form.end_date || create.isPending} onClick={() => create.mutate()}
            className="w-full min-h-[44px] bg-[#D4AF37] text-[#0D1B2A] font-black text-sm rounded-sm hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {create.isPending ? <Loader2 size={16} className="animate-spin" /> : <>צור חוזה חכם ושלח לחתימה</>}
          </button>
          <p className="text-white/30 text-[10px] text-center">החוזה ייווצר מתוכן תבנית ההתאחדות ויופיע אצל השחקן/אפוטרופוס לחתימה דיגיטלית. לאחר השלמת כל החתימות, סטטוס השחקן יעודכן אוטומטית.</p>
        </div>
      </div>
    </div>
  );
}