import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Trash2, Edit2, CheckCircle2, X, Loader2, ShieldCheck,
  Mail, Phone, MapPin, Award, FileText, Upload, ExternalLink, AlertTriangle,
  FileSignature, FolderOpen, XCircle
} from 'lucide-react';

const TIERS = [
  'Tier 1 — עלית (ליגת העל / בינלאומי)',
  'Tier 2 — מקצועי לאומית',
  'Tier 3 — חובבן רשום A (ליגה א/ב, מגרש בבעלות)',
  'Tier 4 — חובבן רשום B (ליגות מחוזיות/אזוריות)',
  'Tier 5 — עמותה / איגוד נוער וילדים (לא על דשא)',
];

const ORG_TYPES = [
  'מועדון רשום (חברה / עמותה)',
  'עמותה / איגוד המפעיל ליגות',
];

export default function ClubDocumentsPanel() {
  const queryClient = useQueryClient();
  const [openClub, setOpenClub] = useState(null);

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['admin-clubs-docs'],
    queryFn: () => base44.entities.Club.list('-created_date', 100),
  });

  // חישוב status תיעודי לכל מועדון
  const getDocs = (club) => {
    const items = [
      {
        key: 'incorporation_certificate_url',
        label: 'תעודת רישום (רשם חברות / עמותות)',
        required: true,
        value: club.incorporation_certificate_url,
        icon: FileText,
        desc: 'נייר הקמה / אישור עמותה פעילה',
      },
      {
        key: 'ifa_membership_certificate_url',
        label: 'תעודת חברות בהתאחדות לכדורגל',
        required: true,
        value: club.ifa_membership_certificate_url,
        icon: ShieldCheck,
        desc: 'אישור חברות עדכני לליגות רשמיות',
      },
    ];
    return items;
  };

  const getStatus = (club) => {
    const docs = getDocs(club);
    const missing = docs.filter(d => d.required && !d.value).length;
    if (missing === 0) return { label: 'מלא', cls: 'bg-green-500/15 text-green-400 border-green-500/30', count: missing };
    return { label: `${missing} חסרים`, cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', count: missing };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <FolderOpen size={20} className="text-[#D4AF37]" />
            ארכיון מסמכי מועדונים
          </h2>
          <p className="text-white/40 text-xs mt-1">
            ניהול תעודות רישום ואישורי התאחדות לכל מועדון · סטטוס ברור לכל מסמך חובה
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5 text-green-400 text-xs font-bold">
            ✓ {clubs.filter(c => getStatus(c).count === 0).length} מלאים
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 text-amber-400 text-xs font-bold">
            ⏳ {clubs.filter(c => getStatus(c).count > 0).length} עם מסמכים חסרים
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#D4AF37] mx-auto" /></div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">אין מועדונים עדיין</div>
      ) : (
        <div className="space-y-2">
          {clubs.map(club => {
            const docs = getDocs(club);
            const status = getStatus(club);
            const isOpen = openClub === club.id;
            return (
              <div key={club.id} className="bg-[#1B263B] border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenClub(isOpen ? null : club.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors text-right"
                >
                  <Building2 size={16} className="text-[#D4AF37] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm">{club.club_name}</div>
                    <div className="text-white/40 text-xs mt-0.5">
                      {club.club_tier?.split(' — ')[0] || 'Tier 5'} · {club.organization_type?.includes('עמותה') ? 'עמותה/איגוד' : 'מועדון רשום'}
                    </div>
                  </div>
                  {/* תצוגת סטטוס מסמכים */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {docs.map(d => (
                      <span
                        key={d.key}
                        title={d.label}
                        className={`w-7 h-7 rounded flex items-center justify-center border ${d.value ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}
                      >
                        {d.value ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      </span>
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${status.cls}`}>
                    {status.label}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        {docs.map(doc => (
                          <DocumentRow key={doc.key} club={club} doc={doc} />
                        ))}
                        <div className="pt-2 text-white/30 text-[10px] flex items-center gap-1.5">
                          <AlertTriangle size={11} />
                          מועדון שאינו מלא את כל המסמכים לא יאומת מול ההתאחדות לכדורגל ולא יוכל לרשום שחקנים בליגות רשמיות.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocumentRow({ club, doc }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const DocIcon = doc.icon;

  const upload = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Club.update(club.id, { [doc.key]: file_url });
    },
    onMutate: () => setUploading(true),
    onSuccess: () => {
      setUploading(false);
      queryClient.invalidateQueries({ queryKey: ['admin-clubs-docs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
    },
    onError: () => setUploading(false),
  });

  const remove = useMutation({
    mutationFn: () => base44.entities.Club.update(club.id, { [doc.key]: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clubs-docs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-clubs'] });
    },
  });

  return (
    <div className={`bg-[#0D1B2A] border rounded-lg p-3 ${doc.value ? 'border-green-500/20' : 'border-red-500/20'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ${doc.value ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
          <DocIcon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-xs flex items-center gap-1.5">
            {doc.label}
            {doc.required && <span className="text-red-400 text-[9px]">חובה</span>}
          </div>
          <div className="text-white/40 text-[10px] mt-0.5">{doc.desc}</div>

          {doc.value ? (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <a href={doc.value} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-400 hover:text-green-300 text-[11px] font-bold">
                <ExternalLink size={11} /> צפה במסמך
              </a>
              <button
                onClick={() => upload.mutate}
                className="hidden"
              />
              <label className="flex items-center gap-1 text-white/40 hover:text-white text-[11px] cursor-pointer">
                <Upload size={11} /> החלף
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }}
                  disabled={uploading}
                />
              </label>
              <button
                onClick={() => remove.mutate()}
                className="text-red-400 hover:text-red-300 text-[11px]"
              >
                הסר
              </button>
            </div>
          ) : (
            <label className="mt-2 flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-sm py-2.5 cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) upload.mutate(f); }}
                disabled={uploading}
              />
              {uploading
                ? <Loader2 size={12} className="animate-spin text-[#D4AF37]" />
                : <><Upload size={12} className="text-white/40" /><span className="text-white/50 text-[11px] font-bold">העלה מסמך</span></>}
            </label>
          )}
        </div>
      </div>
    </div>
  );
}