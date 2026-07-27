import { motion } from 'framer-motion';
import { X, Star, Calendar, Users, User } from 'lucide-react';

const TYPE_META = {
  'מקצועי': { color: '#D4AF37', icon: '🎯', scales: [
    { k: 'intensity', label: 'מאמץ עבודה' }, { k: 'execution', label: 'ביצוע תרגילים' },
    { k: 'pressing', label: 'לחץ / נשיאה' }, { k: 'transitions', label: 'מעברים' },
    { k: 'set_pieces', label: 'מצבים קבועים' }, { k: 'tactical_shape', label: 'ארגון טקטי' },
  ], texts: [
    { k: 'tactical_focus', label: 'מוקד טקטי' }, { k: 'strengths', label: 'חוזקות' },
    { k: 'weaknesses', label: 'חלשויות' }, { k: 'next_plan', label: 'תכנון אימות הבא' },
  ] },
  'מנטלי': { color: '#60a5fa', icon: '🧠', scales: [
    { k: 'group_cohesion', label: 'לכידות קבוצתית' }, { k: 'energy_mood', label: 'אנרגיה / מצב רוח' },
    { k: 'focus_mental', label: 'ריכוז' }, { k: 'resilience', label: 'עמידות מול קושי' },
    { k: 'leadership_emergence', label: 'הופעת מנהיגות' }, { k: 'pressure_handling', label: 'התמודדות עם לחץ' },
  ], texts: [
    { k: 'standout', label: 'בלטויות חיוביות' }, { k: 'concerns', label: 'דגלים אדומים / חששות' },
    { k: 'intervention', label: 'כנית התערבות / טיפול' },
  ] },
  'אישי': { color: '#34d399', icon: '👤', scales: [
    { k: 'technical', label: 'טכני' }, { k: 'tactical', label: 'טקטי' },
    { k: 'attitude', label: 'גישה' }, { k: 'work_ethic', label: 'אתיקת עבודה' },
    { k: 'confidence', label: 'ביטחון עצמי' }, { k: 'social', label: 'דינמיקה חברתית' },
  ], texts: [
    { k: 'strengths', label: 'חוזקות' }, { k: 'improvements', label: 'תחומים לשיפור' },
    { k: 'action_items', label: 'פעולות נדרשות' }, { k: 'private_note', label: 'הערה פנימית לצוות' },
  ] },
};

export default function TeamReportDetailView({ report, onClose }) {
  const meta = TYPE_META[report.report_type] || TYPE_META['מקצועי'];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded border flex items-center justify-center" style={{ borderColor: meta.color + '50', background: meta.color + '15' }}>
              <span className="text-base">{meta.icon}</span>
            </div>
            <div>
              <h3 className="text-white font-black text-base">דוח {report.report_type} — {report.team_name}</h3>
              <p className="text-white/40 text-xs flex items-center gap-2">
                {report.player_name ? <><User size={11} /> {report.player_name} ·</> : null}
                <Calendar size={11} /> {report.date_start}
                {report.author_role && ` · ${report.author_role}`}
              </p>
            </div>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {report.session_label && (
            <div className="text-white/50 text-[11px] flex items-center gap-1 bg-[#0D1B2A] border border-white/10 rounded px-2.5 py-1.5">
              <Users size={11} className="text-[#D4AF37]" /> קושר לאימות: {report.session_label}
            </div>
          )}

          {/* סקלות */}
          {meta.scales.some(s => report[s.k] > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {meta.scales.map(s => (
                <div key={s.k} className="flex items-center justify-between bg-[#0D1B2A] border border-white/10 rounded px-3 py-2">
                  <span className="text-white/60 text-xs">{s.label}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12}
                        style={report[s.k] >= i + 1 ? { color: meta.color, fill: meta.color } : undefined}
                        className={report[s.k] >= i + 1 ? '' : 'text-white/15'} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* טקסטים */}
          {meta.texts.map(t => report[t.k] ? (
            <div key={t.k}>
              <div className="text-white/40 text-[11px] font-bold mb-1">{t.label}</div>
              <div className="text-white/80 text-sm leading-relaxed bg-[#0D1B2A] border border-white/10 rounded px-3 py-2 whitespace-pre-wrap">{report[t.k]}</div>
            </div>
          ) : null)}

          {report.summary && (
            <div>
              <div className="text-white/40 text-[11px] font-bold mb-1">תקציר</div>
              <div className="text-white/80 text-sm leading-relaxed bg-[#0D1B2A] border border-white/10 rounded px-3 py-2 whitespace-pre-wrap">{report.summary}</div>
            </div>
          )}

          {!meta.scales.some(s => report[s.k] > 0) && !meta.texts.some(t => report[t.k]) && !report.summary ? (
            <div className="text-center text-white/30 text-sm py-6">לא תועדו נתונים בדוח</div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}