import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NotificationPrefsFields from '../NotificationPrefsFields';

const NOTIFICATION_OPTIONS = [
  { key: 'medical_expiry', label: 'פקיעת תוקף אישור רפואי' },
  { key: 'request_status', label: 'עדכון סטטוס בקשה' },
  { key: 'transfer_offer', label: 'הצעת העברה חדשה' },
  { key: 'contract_status', label: 'עדכון סטטוס חוזה' },
];

export default function PlayerNotificationSettingsModal({ player, onClose }) {
  const [prefs, setPrefs] = useState(player.notification_preferences || {});

  const handleChange = async (key, checked) => {
    const updated = { ...prefs, [key]: checked };
    setPrefs(updated);
    await base44.entities.PlayerRegistration.update(player.id, { notification_preferences: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1B263B] border border-white/10 rounded-lg max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-base">הגדרות התראות במייל</h3>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>
        <NotificationPrefsFields options={NOTIFICATION_OPTIONS} value={prefs} onChange={handleChange} />
      </motion.div>
    </div>
  );
}