import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

const POSITIONS = ['שוער', 'בלם', 'מגן צד', 'קשר מגן', 'קשר', 'קשר התקפי', 'חלוץ צד', 'חלוץ'];
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

function calcDaysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function ReportCenter({ players }) {
  const positionData = POSITIONS.map(pos => ({ position: pos, count: players.filter(p => p.position === pos).length }));

  const medicalOk = players.filter(p => { const d = calcDaysLeft(p.medical_expiry_date); return p.medical_certificate_url && (d === null || d >= 30); }).length;
  const medicalSoon = players.filter(p => { const d = calcDaysLeft(p.medical_expiry_date); return p.medical_certificate_url && d !== null && d >= 0 && d < 30; }).length;
  const medicalBad = players.length - medicalOk - medicalSoon;
  const medicalData = [
    { name: 'תקין', value: medicalOk },
    { name: 'בסכנה (30 יום)', value: medicalSoon },
    { name: 'לא כשיר', value: medicalBad },
  ];

  const teamGroups = [...new Set(players.map(p => p.team_name).filter(Boolean))];
  const engagementData = teamGroups.map(team => {
    const teamPlayers = players.filter(p => p.team_name === team);
    const complete = teamPlayers.filter(p => p.id_document_url && p.medical_certificate_url).length;
    return { team, rate: teamPlayers.length ? Math.round((complete / teamPlayers.length) * 100) : 0 };
  });

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('IEFA - Report Center', 14, 15);
    doc.setFontSize(11);
    doc.text('Position Distribution:', 14, 28);
    positionData.forEach((p, i) => doc.text(`${p.position}: ${p.count}`, 18, 36 + i * 6));
    let y = 36 + positionData.length * 6 + 8;
    doc.text('Medical Compliance:', 14, y);
    medicalData.forEach((m, i) => doc.text(`${m.name}: ${m.value}`, 18, y + 8 + i * 6));
    doc.save('iefa-report.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={exportPdf} className="flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors">
          <Download size={14} /> ייצוא PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <h3 className="text-white font-black text-sm mb-3">התפלגות עמדות בסגל</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={positionData}>
              <CartesianGrid stroke="#ffffff10" />
              <XAxis dataKey="position" tick={{ fontSize: 9, fill: '#ffffff60' }} />
              <YAxis tick={{ fontSize: 9, fill: '#ffffff60' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', border: '1px solid #ffffff20', fontSize: 11 }} />
              <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
          <h3 className="text-white font-black text-sm mb-3">דוח כשירות רפואית</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={medicalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {medicalData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', border: '1px solid #ffffff20', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5 md:col-span-2">
          <h3 className="text-white font-black text-sm mb-3">דוח היענות — השלמת מסמכים לפי קבוצה</h3>
          {engagementData.length === 0 ? <p className="text-white/30 text-xs">אין נתוני קבוצות</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={engagementData}>
                <CartesianGrid stroke="#ffffff10" />
                <XAxis dataKey="team" tick={{ fontSize: 9, fill: '#ffffff60' }} />
                <YAxis tick={{ fontSize: 9, fill: '#ffffff60' }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', border: '1px solid #ffffff20', fontSize: 11 }} />
                <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}