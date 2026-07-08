import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2 } from 'lucide-react';

export default function ExecutiveSummaryCard({ player, contracts, latestMental }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const prompt = `כתוב תקציר מנהלים קצר (2-3 משפטים בעברית) על שחקן הכדורגל הבא, בסגנון של מנהל מקצועי המסכם לעצמו את המצב:
שם: ${player.full_name}, עמדה: ${player.position}, גיל לפי תאריך לידה: ${player.birth_date || 'לא ידוע'}.
ציון מקצועי כולל: ${player.overall_rating ?? 'אין נתון'}.
תאריך סיום חוזה: ${player.contract_end_date || 'אין חוזה פעיל'}.
פוטנציאל שוק מתויג: ${player.market_potential_tag || 'לא תויג'}.
שווי שוק: ${player.transfermarkt_data?.market_value_current || 'לא ידוע'}.
כרטיסים צהובים בעונה: ${player.yellow_cards_count || 0}.
סטטוס רפואי: ${player.medical_certificate_url ? 'תקין' : 'חסר אישור'}.
ציון מנטלי אחרון: ${latestMental?.mental_score_nlp ?? 'אין נתון'}.
מטרות פיתוח לעונה: ${player.season_development_goals || 'לא הוגדרו'}.
כתוב בסגנון תמציתי כמו: "עידן כהן (17) – ציון מקצועי 8.8, חוזה מסתיים ב-2027, פוטנציאל מכירה גבוה, רמת סיכון רפואי: נמוכה. מומלץ: להחתים על חוזה בוגרים בקרוב."`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setSummary(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-l from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={13} /> תקציר מנהלים (AI)</h4>
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0D1B2A] font-black text-[11px] px-3 py-1.5 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-50">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {summary ? 'רענן' : 'צור דוח'}
        </button>
      </div>
      {summary ? (
        <p className="text-white text-sm leading-relaxed">{summary}</p>
      ) : (
        <p className="text-white/30 text-xs">לחץ "צור דוח" לקבלת תקציר מנהלים אוטומטי המבוסס על נתוני השחקן</p>
      )}
    </div>
  );
}