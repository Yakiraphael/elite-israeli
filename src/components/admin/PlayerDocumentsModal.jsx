import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Upload, Loader2, FileText, Download, Trash2 } from 'lucide-react';

const DOC_TYPES = ['טופס העברה חתום', 'אישור רפואי', 'תעודת זהות', 'חוזה', 'אחר'];

export default function PlayerDocumentsModal({ player, onClose }) {
  const queryClient = useQueryClient();
  const [docs, setDocs] = useState(player.documents || []);
  const [label, setLabel] = useState('');
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: (updated) => base44.entities.PlayerRegistration.update(player.id, { documents: updated }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-players'] }),
  });

  const handleUpload = async (file) => {
    if (!file || !label.trim()) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      let user = null;
      try { user = await base44.auth.me(); } catch { /* ignore */ }
      const updated = [...docs, {
        label: label.trim(),
        doc_type: docType,
        file_url,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user?.full_name || 'מנהל',
      }];
      setDocs(updated);
      save.mutate(updated);
      setLabel('');
    } catch {
      /* upload failed silently — user can retry */
    }
    setUploading(false);
  };

  const handleRemove = (idx) => {
    const updated = docs.filter((_, i) => i !== idx);
    setDocs(updated);
    save.mutate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="bg-[#1B263B] border border-white/10 rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-black text-base">כספת מסמכים — {player.full_name}</h3>
            <p className="text-white/40 text-xs mt-0.5">טפסי העברה חתומים, אישורים רפואיים ותעודות זהות במקום אחד מאובטח</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white" /></button>
        </div>

        {/* Upload form */}
        <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-4 mb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="שם המסמך"
              className="bg-transparent border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60" />
            <select value={docType} onChange={e => setDocType(e.target.value)}
              className="bg-transparent border border-white/15 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-[#D4AF37]/60">
              {DOC_TYPES.map(t => <option key={t} value={t} className="bg-[#1B263B]">{t}</option>)}
            </select>
          </div>
          <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-sm py-4 cursor-pointer transition-colors ${!label.trim() ? 'border-white/10 opacity-40 cursor-not-allowed' : 'border-white/15 hover:border-[#D4AF37]/50'}`}>
            {uploading ? <Loader2 size={16} className="animate-spin text-[#D4AF37]" /> : <Upload size={16} className="text-white/30" />}
            <span className="text-white/40 text-xs">{uploading ? 'מעלה...' : 'לחץ להעלאת קובץ'}</span>
            <input type="file" accept="image/*,.pdf" className="hidden" disabled={!label.trim() || uploading}
              onChange={e => handleUpload(e.target.files?.[0])} />
          </label>
        </div>

        {/* Existing documents */}
        <div className="space-y-2">
          {docs.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-xs">אין מסמכים שמורים עדיין</div>
          ) : docs.map((d, i) => (
            <div key={i} className="flex items-center justify-between bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} className="text-[#D4AF37] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-white text-xs font-bold truncate">{d.label}</div>
                  <div className="text-white/30 text-[10px]">{d.doc_type} · {d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('he-IL') : ''}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-amber-300"><Download size={14} /></a>
                <button onClick={() => handleRemove(i)} className="text-white/30 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}