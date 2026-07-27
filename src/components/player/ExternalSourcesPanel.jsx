import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Globe, Shield, Activity, Loader2, Check, Pencil, ExternalLink, RefreshCw,
} from 'lucide-react';

// פאנל מקורות מידע חיצוניים — השחקן מוסיף ומנהל חיבורים ל-Transfermarkt, IFA, 365Scores.
// חיווי סנכרון נעשה ידנית דרך external_sync_status (Synced / Pending / Error).
// ללא דריסת מידע פנימי — שדות אלו מקושרים ל-Feed חיצוניים בלבד.

const SYNC_COLORS = {
  Synced: 'text-green-400 bg-green-500/15 border-green-500/30',
  Pending: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  Error: 'text-red-400 bg-red-500/15 border-red-500/30',
};

export default function ExternalSourcesPanel({ player }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    transfermarkt_url: player.transfermarkt_url || '',
    ifa_player_id: player.ifa_player_id || '',
    scores365_id: player.scores365_id || '',
    external_sync_status: player.external_sync_status || 'Pending',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.PlayerRegistration.update(player.id, {
        transfermarkt_url: form.transfermarkt_url.trim(),
        ifa_player_id: form.ifa_player_id.trim(),
        scores365_id: form.scores365_id.trim(),
        external_sync_status: form.external_sync_status,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const sources = [
    { id: 'tm', label: 'Transfermarkt', icon: Globe, idKey: 'transfermarkt_url', isLink: true, hint: 'לינק פרופיל Transfermarkt — שווי שוק, היסטוריית מעברים' },
    { id: 'ifa', label: 'התאחדות לכדורגל (IFA)', icon: Shield, idKey: 'ifa_player_id', isLink: false, hint: 'מזהה רישום רשמי — כרטיסים, השעיות, מעמד רשמי' },
    { id: '365', label: '365Scores', icon: Activity, idKey: 'scores365_id', isLink: false, hint: 'מזהה מעקב — ציון משחק, דקות, שערים בזמן אמת' },
  ];

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase flex items-center gap-2">
          <Globe size={12} /> מקורות מידע חיצוניים
        </h3>
        <button
          onClick={() => (editing ? save() : setEditing(true))}
          disabled={saving}
          className="text-white/40 hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[10px] font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" />
            : editing ? <Check size={12} />
            : <Pencil size={12} />}
          {saving ? 'שומר...' : editing ? 'שמור' : 'ערוך מקורות'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sources.map(src => {
          const Icon = src.icon;
          const has = !!form[src.idKey];
          return (
            <div key={src.id} className={`rounded-lg border p-3 ${has ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5' : 'border-red-500/15 bg-red-500/5'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={14} className={has ? 'text-[#D4AF37]' : 'text-white/40'} />
                <span className="text-white text-xs font-bold">{src.label}</span>
              </div>
              <div className="text-white/40 text-[10px] mb-2 leading-relaxed">{src.hint}</div>

              {!editing ? (
                src.isLink && has ? (
                  <a href={form[src.idKey]} target="_blank" rel="noopener noreferrer"
                    className="text-[#D4AF37] text-xs truncate hover:underline flex items-center gap-1"
                    title={form[src.idKey]}>
                    <ExternalLink size={10} /> <span className="truncate">{form[src.idKey].replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 34)}</span>
                  </a>
                ) : (
                  <div className="text-white/50 text-xs truncate" title={form[src.idKey]} dir="ltr">
                    {has ? `ID: ${form[src.idKey]}` : <span className="text-red-400">— לא מחובר</span>}
                  </div>
                )
              ) : (
                <input
                  type="text"
                  value={form[src.idKey]}
                  onChange={e => setForm(f => ({ ...f, [src.idKey]: e.target.value }))}
                  placeholder={src.isLink ? 'https://transfermarkt.com/... ' : 'מזהה רישום'}
                  dir="ltr"
                  className="w-full bg-[#0D1B2A] border border-white/15 rounded px-2 py-1.5 text-white text-[11px] placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* חיווי סנכרון */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] flex-wrap">
        <RefreshCw size={11} className="text-white/30" />
        <span className="text-white/40">סטטוס סנכרון:</span>
        <span className={`px-2 py-0.5 rounded-full border font-bold ${SYNC_COLORS[form.external_sync_status] || 'text-white/40 bg-white/5 border-white/10'}`}>
          {form.external_sync_status || 'Pending'}
        </span>
        {player.transfermarkt_last_checked && (
          <span className="text-white/30 flex items-center gap-1">
            · עודכן לאחרונה מול Transfermarkt: {player.transfermarkt_last_checked}
          </span>
        )}
      </div>

      {saved && <div className="mt-2 text-green-400 text-[11px] font-bold">✓ מקורות המידע נשמרו בהצלחה</div>}
    </div>
  );
}