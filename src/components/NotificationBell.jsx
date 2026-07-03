import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TYPE_ICON = { request_new: '📥', request_status: '✅', document_expiring: '⚠️' };

export default function NotificationBell({ audience, onNavigate }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', audience],
    queryFn: () => base44.entities.Notification.filter({ audience, is_read: false }, '-created_date', 30),
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', audience] }),
  });

  const handleClick = (n) => {
    markRead.mutate(n.id);
    if (n.link_tab && onNavigate) onNavigate(n.link_tab);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-white/60 hover:text-white transition-colors">
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#1B263B] border border-white/10 rounded-lg shadow-xl z-50" dir="rtl">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-white font-bold text-xs">התראות</span>
              <button onClick={() => setOpen(false)}><X size={14} className="text-white/40 hover:text-white" /></button>
            </div>
            {notifications.length === 0 && (
              <div className="p-6 text-center text-white/30 text-xs">אין התראות חדשות</div>
            )}
            {notifications.map(n => (
              <button key={n.id} onClick={() => handleClick(n)}
                className="w-full text-right p-3 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-2">
                <span className="text-base flex-shrink-0">{TYPE_ICON[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-bold truncate">{n.title}</div>
                  {n.body && <div className="text-white/40 text-[10px] truncate">{n.body}</div>}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}