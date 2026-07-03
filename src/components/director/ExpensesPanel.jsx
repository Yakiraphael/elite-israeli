import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Loader2 } from 'lucide-react';

const CATEGORIES = ['ציוד', 'מגרשים', 'הסעות', 'שכר', 'אחר'];

export default function ExpensesPanel({ expenses, revenueThisMonth, expensesThisMonth }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ description: '', category: 'אחר', amount: '', expense_date: '' });

  const createExpense = useMutation({
    mutationFn: () => base44.entities.Expense.create({ ...form, amount: Number(form.amount) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['finance-expenses'] }); setForm({ description: '', category: 'אחר', amount: '', expense_date: '' }); },
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h3 className="text-white font-black text-sm mb-3">רישום הוצאה</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="תיאור"
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} type="number" placeholder="סכום (₪)"
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none" />
          <input value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} type="date"
            className="bg-[#0D1B2A] border border-white/15 rounded px-3 py-2 text-white text-xs focus:outline-none" />
        </div>
        <button onClick={() => createExpense.mutate()} disabled={!form.description || !form.amount || !form.expense_date || createExpense.isPending}
          className="mt-3 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors flex items-center gap-2 disabled:opacity-40">
          {createExpense.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} הוסף הוצאה
        </button>
      </div>

      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h3 className="text-white font-black text-sm mb-3">דו״ח רווח והפסד — החודש</h3>
        <div className="space-y-2 text-xs max-w-sm">
          <div className="flex justify-between"><span className="text-white/40">הכנסות</span><span className="text-green-400 font-bold">₪{revenueThisMonth.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-white/40">הוצאות</span><span className="text-red-400 font-bold">₪{expensesThisMonth.toLocaleString()}</span></div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-white font-bold">רווח נקי</span>
            <span className={`font-black ${revenueThisMonth - expensesThisMonth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₪{(revenueThisMonth - expensesThisMonth).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead className="bg-[#1B263B]">
            <tr>
              {['תיאור', 'קטגוריה', 'סכום', 'תאריך'].map(h => (
                <th key={h} className="text-white/40 font-bold py-3 px-4 text-right whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-white/30">אין הוצאות רשומות</td></tr>}
            {expenses.map(e => (
              <tr key={e.id} className="border-t border-white/5">
                <td className="py-3 px-4 text-white font-bold whitespace-nowrap">{e.description}</td>
                <td className="py-3 px-4 text-white/50">{e.category}</td>
                <td className="py-3 px-4 text-red-400 font-semibold">₪{e.amount}</td>
                <td className="py-3 px-4 text-white/50">{e.expense_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}