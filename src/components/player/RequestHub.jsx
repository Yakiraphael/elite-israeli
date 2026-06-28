import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronRight, X, CheckCircle2, Clock, Eye, AlertCircle,
  Upload, Loader2, FileText, Calendar
} from 'lucide-react';

const CATEGORIES = [
  { id: 'חופשה/היעדרות', label: 'חופשה / היעדרות', icon: '🏖️', desc: 'בקשת שחרור מאימון, ימי חופש', needsDate: true },
  { id: 'פגישה מקצועית', label: 'פגישה מקצועית', icon: '🤝', desc: 'משוב, דיון על חוזה, שיחה מקצועית' },
  { id: 'בקשת מסמך', label: 'בקשת מסמך רשמי', icon: '📄', desc: 'אישור מועדון, טופס להעברה, אישור ספורטאי' },
  { id: 'פציעה/בריאות', label: 'דיווח פציעה / בריאות', icon: '🏥', desc: 'כאב, עייפות, בקשת פיזיו', urgent: true },
  { id: 'שינוי עמדה', label: 'בקשת שינוי עמדה', icon: '⚽', desc: 'מעוניין לשחק בעמדה אחרת' },
  { id: 'בקשת ציוד', label: 'בקשת ציוד', icon: '👕', desc: 'נעליים, אימוניות, ציוד אישי' },
  { id: 'סיוע לוגיסטי', label: 'סיוע לוגיסטי', icon: '🚗', desc: 'הסעות, לינה, לוגיסטיקת משחק חוץ' },
  { id: 'אחר', label: 'אחר', icon: '💬', desc: 'כל נושא אחר שלא נמצא ברשימה' },
];

const STATUS_MAP = {
  'נשלח': { icon: <Clock size={12} />, label: 'נשלח', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  'בטיפול': { icon: <Eye size={12} />, label: 'בטיפול', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  'אושר': { icon: <CheckCircle2 size={12} />, label: 'אושר', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  'נדחה': { icon: <X size={12} />, label: 'נדחה', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

export default function RequestHub({ playerId, playerName }) {
  const [showNew, setShowNew] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['player-requests', playerId],
    queryFn: () => base44.entities.PlayerRequest.filter({ player_id: playerId }, '-created_date', 30),
    enabled: !!playerId,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-black text-base">🎯 מרכז הבקשות</h3>
          <p className="text-white/40 text-xs">שלח בקשות למנהל המקצועי ועקוב אחר סטטוס</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors">
          <Plus size={13} /> בקשה חדשה
        </button>
      </div>

      {/* Request list */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-8 text-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-white/40 text-sm">אין בקשות עדיין — לחץ "בקשה חדשה" כדי להתחיל</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(req => <RequestRow key={req.id} req={req} />)}
        </div>
      )}

      {/* New request modal */}
      {showNew && !selectedCat && (
        <CategoryPicker onSelect={setSelectedCat} onClose={() => setShowNew(false)} />
      )}
      {showNew && selectedCat && (
        <RequestForm
          category={selectedCat}
          playerId={playerId}
          playerName={playerName}
          onClose={() => { setShowNew(false); setSelectedCat(null); }}
          onSaved={() => { setShowNew(false); setSelectedCat(null); refetch(); }}
        />
      )}
    </div>
  );
}

function RequestRow({ req }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORIES.find(c => c.id === req.category);
  const st = STATUS_MAP[req.status] || STATUS_MAP['נשלח'];

  return (
    <motion.div layout className="bg-[#0D1B2A] border border-white/10 rounded-lg overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full p-4 text-right flex items-center gap-3">
        <span className="text-lg flex-shrink-0">{cat?.icon || '💬'}</span>
        <div className="flex-1">
          <div className="text-white font-bold text-sm">{req.subject}</div>
          <div className="text-white/40 text-xs">{req.category} · {req.created_date?.slice(0, 10)}</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${st.color}`}>
          {st.icon} {st.label}
        </span>
        <ChevronRight size={13} className={`text-white/20 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="px-4 pb-4 border-t border-white/10 pt-3 space-y-2">
            <p className="text-white/60 text-xs leading-relaxed">{req.details}</p>
            {req.requested_date && <p className="text-white/30 text-xs">📅 תאריך מבוקש: {req.requested_date}</p>}
            {req.attachment_url && (
              <a href={req.attachment_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] text-xs flex items-center gap-1 hover:text-amber-300">
                <FileText size={12} /> קובץ מצורף
              </a>
            )}
            {req.manager_notes && (
              <div className="bg-[#1B263B] border border-white/10 rounded p-3">
                <p className="text-[#D4AF37] text-[10px] font-bold mb-1">הערות מנהל:</p>
                <p className="text-white/60 text-xs">{req.manager_notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryPicker({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-white font-black text-base">+ בקשה חדשה</h3>
          <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
        </div>
        <div className="p-4">
          <p className="text-white/40 text-xs mb-4">בחר סוג בקשה:</p>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => onSelect(cat)}
                className="w-full bg-[#0D1B2A] border border-white/10 hover:border-[#D4AF37]/40 rounded-lg p-4 flex items-center gap-3 text-right transition-all group">
                <span className="text-xl flex-shrink-0">{cat.icon}</span>
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">{cat.label}</div>
                  <div className="text-white/35 text-xs">{cat.desc}</div>
                </div>
                {cat.urgent && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">דחוף</span>}
                <ChevronRight size={14} className="text-white/20 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RequestForm({ category, playerId, playerName, onClose, onSaved }) {
  const [form, setForm] = useState({ subject: '', details: '', requested_date: '', priority: 'רגיל' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.subject || !form.details) return;
    setSaving(true);
    await base44.entities.PlayerRequest.create({
      player_id: playerId,
      player_name: playerName,
      category: category.id,
      subject: form.subject,
      details: form.details,
      requested_date: form.requested_date || undefined,
      priority: category.urgent ? 'קריטי' : form.priority,
      status: 'נשלח',
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg max-w-md w-full"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">{category.icon}</span>
            <h3 className="text-white font-black text-base">{category.label}</h3>
          </div>
          <button onClick={onClose}><X size={16} className="text-white/30 hover:text-white" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">נושא הבקשה *</label>
            <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="תאר בקצרה את הבקשה"
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
          </div>
          <div>
            <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">פירוט * <span className="text-white/30 font-normal">(חובה — עוזר למנהל להחליט)</span></label>
            <textarea value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} placeholder="הסבר בפירוט את הסיבה ואת מה שאתה צריך..." rows={3}
              className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
          </div>
          {category.needsDate && (
            <div>
              <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-1.5 block">תאריך מבוקש</label>
              <input type="date" value={form.requested_date} onChange={e => setForm(p => ({ ...p, requested_date: e.target.value }))}
                className="w-full bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]/60" />
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-white/20 text-white/60 text-sm py-2.5 rounded-sm hover:bg-white/5">ביטול</button>
            <button onClick={handleSave} disabled={!form.subject || !form.details || saving}
              className="flex-1 bg-[#D4AF37] text-[#0D1B2A] font-black text-sm py-2.5 rounded-sm hover:bg-amber-400 disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} שלח בקשה
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}