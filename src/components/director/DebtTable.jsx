import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Send, ExternalLink } from 'lucide-react';

function calcDaysOverdue(dueDate) {
  if (!dueDate) return 0;
  return Math.ceil((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24));
}

export default function DebtTable({ payments, loading }) {
  const queryClient = useQueryClient();
  const [creatingId, setCreatingId] = useState(null);

  const remind = useMutation({
    mutationFn: (payment) => base44.entities.Notification.create({
      audience: 'director',
      type: 'document_expiring',
      title: `תזכורת תשלום נשלחה — ${payment.player_name}`,
      body: `סכום ₪${payment.amount} עבור ${payment.plan_name || 'תשלום'} ממתין לתשלום.`,
      player_id: payment.player_id,
      player_name: payment.player_name,
    }),
  });

  const createLink = async (payment) => {
    setCreatingId(payment.id);
    try {
      const res = await base44.functions.invoke('create-checkout', { payment_id: payment.id });
      if (res.data?.redirectUrl) window.open(res.data.redirectUrl, '_blank');
      else alert(res.data?.error || 'שגיאה ביצירת קישור תשלום');
    } catch (e) {
      alert('שגיאה ביצירת קישור תשלום — ודא שספק סליקה מחובר');
    }
    setCreatingId(null);
    queryClient.invalidateQueries({ queryKey: ['finance-payments'] });
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>;

  const open = payments.filter(p => p.status !== 'Paid');

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-xs">
        <thead className="bg-[#1B263B]">
          <tr>
            {['שחקן', 'מסלול', 'סכום', 'תאריך יעד', 'סטטוס', 'פעולות'].map(h => (
              <th key={h} className="text-white/40 font-bold py-3 px-4 text-right whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {open.length === 0 && (
            <tr><td colSpan={6} className="text-center py-8 text-white/30">אין חובות פתוחים 🎉</td></tr>
          )}
          {open.map(p => {
            const daysOver = calcDaysOverdue(p.due_date);
            const isOverdue = p.status === 'Overdue' || daysOver > 0;
            return (
              <tr key={p.id} className={`border-t border-white/5 ${isOverdue ? 'bg-red-500/5' : ''}`}>
                <td className="py-3 px-4 text-white font-bold whitespace-nowrap">{p.player_name}</td>
                <td className="py-3 px-4 text-white/50">{p.plan_name || '—'}</td>
                <td className="py-3 px-4 text-white font-semibold">₪{p.amount}</td>
                <td className="py-3 px-4 text-white/50">{p.due_date}</td>
                <td className="py-3 px-4">
                  <span className={isOverdue ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                    {isOverdue ? `🔴 באיחור ${daysOver}י׳` : '🟡 ממתין'}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button onClick={() => remind.mutate(p)} disabled={remind.isPending}
                    className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-1.5 rounded hover:bg-amber-500/30 transition-colors flex items-center gap-1">
                    <Send size={10} /> תזכורת
                  </button>
                  <button onClick={() => createLink(p)} disabled={creatingId === p.id}
                    className="text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1.5 rounded hover:bg-[#D4AF37]/30 transition-colors flex items-center gap-1">
                    {creatingId === p.id ? <Loader2 size={10} className="animate-spin" /> : <ExternalLink size={10} />} קישור תשלום
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}