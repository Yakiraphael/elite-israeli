import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, TrendingUp } from 'lucide-react';

function resilienceAvg(m) {
  const vals = [m.resilience_error_recovery, m.resilience_disadvantage_drive, m.resilience_squad_status, m.resilience_emotional_control].filter(v => v != null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function buildTimeline(mentalList, physioList) {
  const map = {};
  mentalList.forEach(m => {
    if (!m.assessment_date) return;
    const r = resilienceAvg(m);
    map[m.assessment_date] = {
      ...(map[m.assessment_date] || {}),
      date: m.assessment_date,
      nlp: m.mental_score_nlp ?? null,
      resilience: r != null ? +(r * 20).toFixed(1) : null,
    };
  });
  physioList.forEach(p => {
    if (!p.assessment_date) return;
    map[p.assessment_date] = {
      ...(map[p.assessment_date] || {}),
      date: p.assessment_date,
      physio: p.readiness_score != null ? p.readiness_score * 10 : null,
    };
  });
  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default function PlayerProgressChart({ player }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState('');
  const [physioName, setPhysioName] = useState('');
  const [notes, setNotes] = useState('');

  const { data: mentalList = [], isLoading: loadingMental } = useQuery({
    queryKey: ['mental-history', player.id],
    queryFn: () => base44.entities.MentalAssessment.filter({ player_id: player.id }, 'assessment_date', 30),
  });
  const { data: physioList = [], isLoading: loadingPhysio } = useQuery({
    queryKey: ['physio-history', player.id],
    queryFn: () => base44.entities.PhysioAssessment.filter({ player_id: player.id }, 'assessment_date', 30),
  });

  const addPhysio = useMutation({
    mutationFn: () => base44.entities.PhysioAssessment.create({
      player_id: player.id,
      player_name: player.full_name,
      assessment_date: new Date().toISOString().slice(0, 10),
      readiness_score: Number(score),
      physio_name: physioName.trim(),
      notes: notes.trim(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physio-history', player.id] });
      setShowForm(false); setScore(''); setPhysioName(''); setNotes('');
    },
  });

  const loading = loadingMental || loadingPhysio;
  const timeline = buildTimeline(mentalList, physioList);

  return (
    <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
          <TrendingUp size={12} /> דוח התקדמות לאורך זמן
        </h4>
        <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-1 text-[10px] font-bold text-green-400 hover:text-green-300">
          <Plus size={12} /> הוסף הערכת פיזיותרפיסט
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input type="number" min="1" max="10" value={score} onChange={e => setScore(e.target.value)} placeholder="ציון כשירות (1-10)"
              className="bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            <input value={physioName} onChange={e => setPhysioName(e.target.value)} placeholder="שם הפיזיותרפיסט"
              className="bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="הערות (אופציונלי)"
            className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-2.5 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
          <button onClick={() => addPhysio.mutate()} disabled={!score || addPhysio.isPending}
            className="w-full bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs py-2 rounded-sm hover:bg-green-500/25 transition-colors disabled:opacity-40">
            {addPhysio.isPending ? 'שומר...' : 'שמור הערכה'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /></div>
      ) : timeline.length === 0 ? (
        <p className="text-white/30 text-xs text-center py-6">אין עדיין נתוני התקדמות עבור שחקן זה</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#ffffff60' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#ffffff60' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1B263B', border: '1px solid #D4AF3730', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="nlp" name="ציון NLP" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="resilience" name="חוסן מנטלי" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="physio" name="כשירות פיזית" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}