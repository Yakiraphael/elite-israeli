import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Loader2 } from 'lucide-react';

export default function PaymentPlansPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', type: 'דמי חבר חודשיים', amount: '', frequency: 'חודשי' });
  const [showAssign, setShowAssign] = useState(null);
  const [assignForm, setAssignForm] = useState({ player_id: '', player_name: '', due_date: '' });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['payment-plans'],
    queryFn: () => base44.entities.PaymentPlan.list('-created_date', 100),
  });
  const { data: players = [] } = useQuery({
    queryKey: ['dir-players-lite'],
    queryFn: () => base44.entities.PlayerRegistration.list('-created_date', 300),
  });

  const createPlan = useMutation({
    mutationFn: () => base44.entities.PaymentPlan.create({ ...form, amount: Number(form.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payment-plans'] }); setForm({ name: '', type: 'דמי חבר חודשיים', amount: '', frequency: 'חודשי' }); },
  });

  const assignPayment = useMutation({
    mutationFn: (plan) => base44.entities.Payment.create({
      player_id: assignForm.player_id,
      player_name: assignForm.player_name,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.amount,
      due_date: assignForm.due_date,
      status: 'Pending',
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['finance-payments'] }); setShowAssign(null); setAssignForm({ player_id: '', player_name: '', due_date: '' }); },
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h3 className="text-white font-black text-sm mb-3">מסלול תשלום חדש</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="שם מסלול"
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none">
            {['דמי חבר חודשיים', 'מחנה אימונים', 'ציוד', 'אחר'].map(t => <option key={t}>{t}</option>)}
          </select>
          <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} type="number" placeholder="סכום (₪)"
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none" />
          <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none">
            {['חד פעמי', 'חודשי', 'שנתי'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <button onClick={() => createPlan.mutate()} disabled={!form.name || !form.amount || createPlan.isPending}
          className="mt-3 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors flex items-center gap-2 disabled:opacity-40">
          {createPlan.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} צור מסלול
        </button>
      </div>

      {isLoading ? <Loader2 size={20} className="animate-spin text-[#D4AF37]" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map(plan => (
            <div key={plan.id} className="bg-[#1B263B] border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-white font-bold text-sm">{plan.name}</div>
                  <div className="text-white/40 text-xs">{plan.type} · {plan.frequency}</div>
                </div>
                <div className="text-[#D4AF37] font-black text-lg">₪{plan.amount}</div>
              </div>
              {showAssign === plan.id ? (
                <div className="space-y-2 mt-2">
                  <select value={assignForm.player_id} onChange={e => {
                    const pl = players.find(p => p.id === e.target.value);
                    setAssignForm({ ...assignForm, player_id: e.target.value, player_name: pl?.full_name || '' });
                  }} className="w-full bg-[#0D1B2A] border border-white/15 rounded px-2 py-1.5 text-white text-xs focus:outline-none">
                    <option value="">בחר שחקן...</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                  <input type="date" value={assignForm.due_date} onChange={e => setAssignForm({ ...assignForm, due_date: e.target.value })}
                    className="w-full bg-[#0D1B2A] border border-white/15 rounded px-2 py-1.5 text-white text-xs focus:outline-none" />
                  <button onClick={() => assignPayment.mutate(plan)} disabled={!assignForm.player_id || !assignForm.due_date || assignPayment.isPending}
                    className="w-full bg-[#D4AF37] text-[#0D1B2A] font-bold text-xs py-1.5 rounded disabled:opacity-40">
                    צור חיוב
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAssign(plan.id)} className="text-[10px] font-bold text-[#D4AF37] hover:text-amber-300 mt-1">
                  + הצמד לשחקן
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}