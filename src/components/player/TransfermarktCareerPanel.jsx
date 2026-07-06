import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, Loader2, RefreshCw, ArrowLeftRight } from 'lucide-react';

export default function TransfermarktCareerPanel({ transfermarktUrl }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract player career data from this Transfermarkt profile: ${transfermarktUrl}. Include birth date, current market value (with currency symbol), market value history over time (date + numeric value), and transfer history between clubs (date, from club, to club, transfer fee if available).`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            birth_date: { type: 'string' },
            market_value_current: { type: 'string' },
            market_value_history: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, value: { type: 'number' } } } },
            transfer_history: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, from_club: { type: 'string' }, to_club: { type: 'string' }, fee: { type: 'string' } } } },
          },
        },
      });
      setData(res);
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  };

  if (!data) {
    return (
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 text-center">
        <Globe size={20} className="text-[#D4AF37] mx-auto mb-2" />
        <h3 className="text-white font-black text-sm mb-1">נתוני Transfermarkt</h3>
        <p className="text-white/40 text-xs mb-3">שליפת קריירה, שווי שוק והיסטוריית מעברים מהפרופיל הרשמי</p>
        {error && <p className="text-red-400 text-xs mb-2">שגיאה בטעינת הנתונים, נסה שוב</p>}
        <button onClick={load} disabled={loading}
          className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} טען נתונים
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-sm flex items-center gap-2"><Globe size={14} className="text-[#D4AF37]" /> נתוני Transfermarkt</h3>
        <button onClick={load}><RefreshCw size={13} className="text-white/30 hover:text-[#D4AF37]" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {data.birth_date && (
          <div className="bg-[#0D1B2A] rounded p-2 flex justify-between">
            <span className="text-white/40">תאריך לידה</span><span className="text-white font-bold">{data.birth_date}</span>
          </div>
        )}
        {data.market_value_current && (
          <div className="bg-[#0D1B2A] rounded p-2 flex justify-between">
            <span className="text-white/40">שווי שוק נוכחי</span><span className="text-[#D4AF37] font-bold">{data.market_value_current}</span>
          </div>
        )}
      </div>

      {data.market_value_history?.length > 1 && (
        <div className="bg-[#0D1B2A] rounded-lg p-3">
          <p className="text-white/40 text-[10px] mb-2">גרף שווי שוק לאורך זמן</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data.market_value_history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#ffffff40' }} />
              <YAxis tick={{ fontSize: 9, fill: '#ffffff40' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #D4AF3730', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.transfer_history?.length > 0 && (
        <div>
          <p className="text-white/40 text-[10px] mb-2 flex items-center gap-1"><ArrowLeftRight size={11} /> ציר מעברים בין מועדונים</p>
          <div className="space-y-2">
            {data.transfer_history.map((t, i) => (
              <div key={i} className="bg-[#0D1B2A] rounded p-2 flex items-center justify-between text-xs">
                <span className="text-white/30">{t.date}</span>
                <span className="text-white">{t.from_club} ← {t.to_club}</span>
                {t.fee && <span className="text-[#D4AF37]">{t.fee}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}