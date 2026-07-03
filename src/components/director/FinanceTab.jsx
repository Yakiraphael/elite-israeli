import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Wallet, TrendingUp, AlertTriangle, Plus, Send, ExternalLink, Loader2 } from 'lucide-react';
import PaymentPlansPanel from './PaymentPlansPanel';
import DebtTable from './DebtTable';
import ExpensesPanel from './ExpensesPanel';

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function FinanceTab() {
  const [subTab, setSubTab] = useState('overview');
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['finance-payments'],
    queryFn: () => base44.entities.Payment.list('-due_date', 500),
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ['finance-expenses'],
    queryFn: () => base44.entities.Expense.list('-expense_date', 200),
  });
  const { data: transfers = [] } = useQuery({
    queryKey: ['finance-transfers'],
    queryFn: () => base44.entities.TransferTracker.list('-created_date', 100),
  });

  const monthKey = currentMonthKey();
  const revenueThisMonth = payments.filter(p => p.status === 'Paid' && p.paid_date?.startsWith(monthKey)).reduce((s, p) => s + (p.amount || 0), 0);
  const openDebt = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue').reduce((s, p) => s + (p.amount || 0), 0);
  const forecast = payments.filter(p => p.status !== 'Paid').reduce((s, p) => s + (p.amount || 0), 0) + revenueThisMonth;
  const expensesThisMonth = expenses.filter(e => e.expense_date?.startsWith(monthKey)).reduce((s, e) => s + (e.amount || 0), 0);
  const compensationTotal = transfers.reduce((s, t) => s + (t.iefa_fee_amount || 0) + (t.solidarity_contribution || 0), 0);

  const SUB_TABS = [
    { id: 'overview', label: 'סקירה' },
    { id: 'debts', label: 'מעקב חובות' },
    { id: 'plans', label: 'מסלולי תשלום' },
    { id: 'expenses', label: 'הוצאות ורווח והפסד' },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-[#1B263B] border border-white/10 rounded-lg p-1 w-fit">
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded min-h-[36px] transition-colors ${subTab === t.id ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/40'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FinKpi label="הכנסות החודש" value={`₪${revenueThisMonth.toLocaleString()}`} icon={Wallet} color="green" />
            <FinKpi label="חובות פתוחים" value={`₪${openDebt.toLocaleString()}`} icon={AlertTriangle} color={openDebt > 0 ? 'red' : 'green'} />
            <FinKpi label="צפי הכנסות" value={`₪${forecast.toLocaleString()}`} icon={TrendingUp} color="amber" />
            <FinKpi label="עמלות העברה (IEFA)" value={`₪${compensationTotal.toLocaleString()}`} icon={Wallet} color="green" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-black text-sm mb-3">רווח והפסד — החודש</h3>
              <div className="space-y-2 text-xs">
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
            <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
              <h3 className="text-white font-black text-sm mb-3">חובות דחופים</h3>
              {loadingPayments ? <Loader2 size={18} className="animate-spin text-[#D4AF37]" /> : (
                payments.filter(p => p.status === 'Overdue').length === 0
                  ? <p className="text-white/30 text-xs">אין חובות באיחור 🎉</p>
                  : (
                    <div className="space-y-2">
                      {payments.filter(p => p.status === 'Overdue').slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between text-xs">
                          <span className="text-white/70">{p.player_name}</span>
                          <span className="text-red-400 font-bold">₪{p.amount}</span>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === 'debts' && <DebtTable payments={payments} loading={loadingPayments} />}
      {subTab === 'plans' && <PaymentPlansPanel />}
      {subTab === 'expenses' && <ExpensesPanel expenses={expenses} revenueThisMonth={revenueThisMonth} expensesThisMonth={expensesThisMonth} />}
    </div>
  );
}

function FinKpi({ label, value, icon: Icon, color }) {
  const map = { red: ['text-red-400', 'bg-red-500/10', 'border-red-500/20'], amber: ['text-amber-400', 'bg-amber-500/10', 'border-amber-500/20'], green: ['text-green-400', 'bg-green-500/10', 'border-green-500/20'] };
  const [tc, bg, border] = map[color] || map.green;
  return (
    <div className={`rounded-lg p-5 border ${bg} ${border}`}>
      <Icon size={18} className={`mb-2 ${tc}`} />
      <div className={`font-black text-2xl ${tc}`}>{value}</div>
      <div className="text-white/50 text-xs mt-0.5">{label}</div>
    </div>
  );
}