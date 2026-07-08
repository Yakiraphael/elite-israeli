import { FileText, TrendingUp, ArrowLeftRight } from 'lucide-react';

export default function AssetContractTab({ player, contracts, transfers }) {
  const tmData = player.transfermarkt_data || {};
  const inSystemSigned = transfers.filter(t => t.status === 'Signed');

  return (
    <div className="space-y-4">
      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={13} /> סטטוס חוזי</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="סיום חוזה נוכחי" value={player.contract_end_date || '—'} />
          <Stat label="דמי השבחה (חוזה קודם)" value={inSystemSigned[0]?.solidarity_contribution ? `${inSystemSigned[0].solidarity_contribution}` : '—'} />
          <Stat label="שווי שוק נוכחי" value={tmData.market_value_current || '—'} />
          <Stat label="מסלול מנוי" value={player.subscription_tier || '—'} />
        </div>
        {contracts.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {contracts.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-[#1B263B] rounded px-3 py-2 text-xs">
                <span className="text-white">{c.contract_type}</span>
                <span className="text-white/40">{c.start_date} → {c.end_date}</span>
                <span className="text-[#D4AF37]">{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {tmData.market_value_history?.length > 0 && (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
          <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp size={13} /> היסטוריית שווי שוק</h4>
          <div className="space-y-1">
            {tmData.market_value_history.map((m, i) => (
              <div key={i} className="flex justify-between text-xs bg-[#1B263B] rounded px-3 py-1.5">
                <span className="text-white/50">{m.date}</span>
                <span className="text-white font-bold">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><ArrowLeftRight size={13} /> היסטוריית מעברים — פספורט השחקן</h4>
        <div className="space-y-1.5">
          {(tmData.transfer_history || []).map((t, i) => (
            <div key={`tm-${i}`} className="text-xs bg-[#1B263B] rounded px-3 py-2 flex justify-between">
              <span className="text-white/70">{t.from_club} ← {t.to_club}</span>
              <span className="text-white/40">{t.date} · {t.fee}</span>
            </div>
          ))}
          {inSystemSigned.map(t => (
            <div key={t.id} className="text-xs bg-[#1B263B] rounded px-3 py-2 flex justify-between">
              <span className="text-white/70">{t.club_from} ← {t.club_to}</span>
              <span className="text-white/40">{t.signed_at} · {t.offer_amount} {t.currency}</span>
            </div>
          ))}
          {(!tmData.transfer_history || tmData.transfer_history.length === 0) && inSystemSigned.length === 0 && (
            <p className="text-white/25 text-xs">אין היסטוריית מעברים מתועדת</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#1B263B] rounded p-2 flex justify-between">
      <span className="text-white/40">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}