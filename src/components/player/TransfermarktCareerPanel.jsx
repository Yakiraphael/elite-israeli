import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import TransfermarktDetails from './TransfermarktDetails';

export default function TransfermarktCareerPanel({ player }) {
  const [data, setData] = useState(player.transfermarkt_data || null);
  const [lastChecked, setLastChecked] = useState(player.transfermarkt_last_checked || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sync = async (force = false) => {
    setLoading(true);
    setError(false);
    try {
      const res = await base44.functions.invoke('transfermarktSync', { playerId: player.id, force });
      if (res.data?.player) {
        setData(res.data.player.transfermarkt_data || null);
        setLastChecked(res.data.player.transfermarkt_last_checked || null);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lastChecked) sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data && loading) {
    return (
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6 text-center">
        <Loader2 size={20} className="text-[#D4AF37] mx-auto mb-2 animate-spin" />
        <p className="text-white/50 text-xs">שולף נתוני קריירה מ-Transfermarkt...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 text-center">
        <Globe size={20} className="text-[#D4AF37] mx-auto mb-2" />
        <h3 className="text-white font-black text-sm mb-1">נתוני Transfermarkt</h3>
        {error && <p className="text-red-400 text-xs mb-2">שגיאה בטעינת הנתונים, נסה שוב</p>}
        <button onClick={() => sync()} className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors inline-flex items-center gap-2">
          <RefreshCw size={14} /> טען נתונים
        </button>
      </div>
    );
  }

  const chartData = (data.market_value_history || []).map(h => ({ date: h.date, value: h.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase">קריירה מקצועית · Transfermarkt</h3>
        <button onClick={() => sync(true)} disabled={loading} className="flex items-center gap-1.5 text-white/40 hover:text-[#D4AF37] text-[10px] transition-colors disabled:opacity-40">
          {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          {lastChecked ? `עודכן לאחרונה: ${new Date(lastChecked).toLocaleString('he-IL')}` : 'רענן'}
        </button>
      </div>

      {chartData.length > 1 && (
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <h4 className="text-white font-black text-sm mb-1 flex items-center gap-2"><TrendingUp size={14} className="text-[#D4AF37]" /> שווי שוק לאורך זמן</h4>
          {data.market_value_current && <p className="text-[#D4AF37] font-black text-lg mb-3">{data.market_value_current}</p>}
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ffffff40' }} />
              <YAxis tick={{ fontSize: 10, fill: '#ffffff40' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', border: '1px solid #D4AF3730', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`€${(v / 1000000).toFixed(1)}M`, 'שווי']} />
              <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <TransfermarktDetails data={data} />
    </div>
  );
}