import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Users, ShieldCheck, TrendingUp, FileSignature, Wallet, BookOpen, AlertTriangle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import ReportCenter from './ReportCenter';
import InsightEngine from './InsightEngine';
import { IFA_TEMPLATES } from '@/lib/contractTemplates';

const PIE_COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7'];
const POSITIONS = ['שוער', 'בלם', 'מגן צד', 'קשר מגן', 'קשר', 'קשר התקפי', 'חלוץ צד', 'חלוץ'];

function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

// סקירה מעשית — מציגה נתונים קיימים אמיתיים ממאגר המערכת במבט חטוף,
// ללא תלות ב-AI או דוחות חיצוניים. כל מדד מבוסס על ישות אמיתית.
function PracticalSnapshot({ players, payments, contracts, transfers }) {
  // פילוח לפי עמדה
  const posData = POSITIONS
    .map(p => ({ name: p, value: players.filter(x => x.position === p).length }))
    .filter(d => d.value > 0);

  // סטטוס רישום
  const regStatus = ['ממתין', 'מאושר', 'פעיל', 'הועבר', 'IFA Ready']
    .map(s => ({ name: s, value: players.filter(p => p.status === s).length }))
    .filter(d => d.value > 0);

  // אימות חשבון
  const accStatus = ['לא מאומת', 'ממתין לאישור', 'מאושר', 'מושעה']
    .map(s => ({ name: s, value: players.filter(p => p.account_status === s).length }))
    .filter(d => d.value > 0);

  // פקיעת אישורים רפואיים — תוך חלוקה לטווחים מעשיים
  const exp30 = players.filter(p => { const d = daysLeft(p.medical_expiry_date); return d !== null && d >= 0 && d < 30; }).length;
  const exp60 = players.filter(p => { const d = daysLeft(p.medical_expiry_date); return d !== null && d >= 30 && d < 60; }).length;
  const exp90 = players.filter(p => { const d = daysLeft(p.medical_expiry_date); return d !== null && d >= 60 && d < 90; }).length;
  const expOver = players.filter(p => { const d = daysLeft(p.medical_expiry_date); return d !== null && d >= 90; }).length;

  // חוזים חתימות
  const signed = contracts.filter(c => c.status === 'חתום').length;
  const pendingSign = contracts.filter(c => c.status === 'ממתין לחתימה').length;

  // שחקנים חופשיים ו-IFA Ready
  const freeAgents = players.filter(p => p.is_free_agent).length;
  const ifaReady = players.filter(p => p.ifa_ready).length;
  const compliancePct = players.length ? Math.round((ifaReady / players.length) * 100) : 0;

  // העברות לפי שלב
  const transferStages = ['Trialist', 'Contract Pending', 'Signed', 'Rejected', 'Cancelled', 'ITC Required']
    .map(s => ({ name: s, value: transfers.filter(t => t.status === s).length }))
    .filter(d => d.value > 0);

  // כספים
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  const overduePayments = payments.filter(p => p.status === 'Overdue').length;
  const totalOutstanding = payments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top-line metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="שחקנים רשומים" value={players.length} icon={Users} color="#3B82F6" />
        <MetricCard label="IFA Ready" value={ifaReady} icon={ShieldCheck} color="#10B981" suffix={players.length ? `${compliancePct}%` : ''} />
        <MetricCard label="שחקנים חופשיים" value={freeAgents} icon={TrendingUp} color="#A855F7" />
        <MetricCard label="חוזים ממתינים לחתימה" value={pendingSign} icon={FileSignature} color="#F59E0B" urgent={pendingSign > 0} />
      </div>

      {/* Position distribution (live chart) */}
      <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">פילוח שחקנים לפי עמדה</h4>
        {posData.length === 0 ? (
          <div className="text-white/30 text-sm py-8 text-center">אין נתוני עמדות</div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={posData} layout="vertical" margin={{ left: 10, right: 30, top: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ background: '#0D1B2A', border: '1px solid #94a3b820', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Registration status + Verification funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">סטטוס רישום שחקנים</h4>
          {regStatus.length === 0 ? (
            <div className="text-white/30 text-sm py-8 text-center">אין נתונים</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={regStatus} dataKey="value" nameKey="name" outerRadius={70} label>
                    {regStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0D1B2A', border: '1px solid #94a3b820', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">אימות חשבון (פנאל אישי)</h4>
          {accStatus.length === 0 ? (
            <div className="text-white/30 text-sm py-8 text-center">אין נתונים</div>
          ) : (
            <div className="space-y-2">
              {accStatus.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">{s.name}</span>
                  <span className="text-white font-bold text-sm" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medical expiring funnel + Transfer stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Calendar size={12} /> פקיעת אישורים רפואיים
          </h4>
          <div className="space-y-2.5">
            <FunnelBar label="< 30 יום" value={exp30} max={Math.max(1, exp30, exp60, exp90, expOver)} color="#EF4444" />
            <FunnelBar label="30-60 יום" value={exp60} max={Math.max(1, exp30, exp60, exp90, expOver)} color="#F59E0B" />
            <FunnelBar label="60-90 יום" value={exp90} max={Math.max(1, exp30, exp60, exp90, expOver)} color="#3B82F6" />
            <FunnelBar label="> 90 יום" value={expOver} max={Math.max(1, exp30, exp60, exp90, expOver)} color="#10B981" />
          </div>
        </div>
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3">סטטוס העברות פעילות</h4>
          {transferStages.length === 0 ? (
            <div className="text-white/30 text-sm py-8 text-center">אין העברות פעילות</div>
          ) : (
            <div className="space-y-2.5">
              {transferStages.map((s, i) => (
                <FunnelBar key={s.name} label={s.name} value={s.value} max={Math.max(1, ...transferStages.map(x => x.value))} color={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contract / Payment / Templates quick look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiTile label="חוזים חתומים" value={signed} sub={`מתוך ${contracts.length} חוזים`} icon={FileSignature} color="#10B981" />
        <KpiTile label="תשלומים בהמתנה" value={pendingPayments + overduePayments} sub={`₪${totalOutstanding.toLocaleString('he-IL')} חוב פתוח`} icon={Wallet} color="#F59E0B" urgent={overduePayments > 0} />
        <KpiTile label="תבניות זמינות" value={IFA_TEMPLATES.length} sub="תבניות התאחדות רשמיות" icon={BookOpen} color="#D4AF37" />
      </div>

      {/* Alerts row */}
      {(exp30 > 0 || pendingSign > 0 || overduePayments > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-black">
            <AlertTriangle size={14} /> נדרש טיפול מיידי
          </div>
          {exp30 > 0 && <div className="text-amber-400/80 text-xs">· {exp30} שחקנים עם אישור רפואי שפג תוקפו / יפוג תוך 30 יום</div>}
          {pendingSign > 0 && <div className="text-amber-400/80 text-xs">· {pendingSign} חוזים ממתינים לחתימה — לא מאושרים אוטומטית</div>}
          {overduePayments > 0 && <div className="text-amber-400/80 text-xs">· {overduePayments} תשלומים באיחור — בסך ₪{totalOutstanding.toLocaleString('he-IL')}</div>}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, suffix, urgent }) {
  return (
    <div className={`bg-[#1B263B] border rounded-lg p-4 ${urgent ? 'border-amber-500/30 animate-pulse' : 'border-white/10'}`}>
      <Icon size={16} style={{ color }} className="mb-2" />
      <div className="text-white font-black text-2xl">
        {value}
        {suffix && <span className="text-xs font-normal text-white/40 mr-1">{suffix}</span>}
      </div>
      <div className="text-white/40 text-xs">{label}</div>
    </div>
  );
}

function KpiTile({ label, value, sub, icon: Icon, color, urgent }) {
  return (
    <div className={`bg-[#1B263B] border rounded-lg p-5 ${urgent ? 'border-amber-500/30' : 'border-white/10'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/50 text-xs">{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="font-black text-2xl" style={{ color }}>{value}</div>
      <div className="text-white/30 text-[10px] mt-0.5">{sub}</div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-white/60 text-xs">{label}</span>
        <span className="text-white font-bold text-xs" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AnalyticsTab({ players }) {
  const [subTab, setSubTab] = useState('snapshot');

  // הבאת נתונים נדרשים לסקירה המעשית — כל הנתונים נשאבים במקביל לתצוגה חיה.
  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['finance-payments'],
    queryFn: () => base44.entities.Payment.list('-due_date', 500),
  });
  const { data: contracts = [] } = useQuery({
    queryKey: ['analytics-contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date', 200),
  });
  const { data: transfers = [] } = useQuery({
    queryKey: ['analytics-transfers'],
    queryFn: () => base44.entities.TransferTracker.list('-created_date', 100),
  });

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-[#1B263B] border border-white/10 rounded-lg p-1 w-fit overflow-x-auto">
        {[
          { id: 'snapshot', label: 'סקירה מעשית' },
          { id: 'reports', label: 'מרכז הדוחות' },
          { id: 'insights', label: 'מנוע תובנות' },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded min-h-[36px] transition-colors whitespace-nowrap ${subTab === t.id ? 'bg-[#D4AF37] text-[#0D1B2A]' : 'text-white/40 hover:text-white/70'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'snapshot' && (loadingPayments
        ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>
        : <PracticalSnapshot players={players} payments={payments} contracts={contracts} transfers={transfers} />)}

      {subTab === 'reports' && <ReportCenter players={players} />}
      {subTab === 'insights' && <InsightEngine players={players} payments={payments} />}
    </div>
  );
}