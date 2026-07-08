import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, PenLine, CheckCircle2, Clock, Loader2, FileCheck2 } from 'lucide-react';
import { REQUIRED_DOCS } from '@/lib/transferDocumentRequirements';
import DigitalSignDocModal from './DigitalSignDocModal';

export default function TransferDocumentsChecklist({ transferId, category }) {
  const [signDoc, setSignDoc] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const queryClient = useQueryClient();
  const docsConfig = REQUIRED_DOCS[category] || REQUIRED_DOCS['העברת נוער'];

  const { data: savedDocs = [], isLoading } = useQuery({
    queryKey: ['transfer-documents', transferId],
    queryFn: () => base44.entities.TransferDocument.filter({ transfer_id: transferId }, '-created_date', 50),
    enabled: !!transferId,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['transfer-documents', transferId] });

  const findDoc = (docType) => savedDocs.find(d => d.doc_type === docType);

  const handleUploadFile = async (docConfig, file) => {
    if (!file) return;
    setUploadingType(docConfig.doc_type);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.TransferDocument.create({
      transfer_id: transferId,
      transfer_category: category,
      doc_type: docConfig.doc_type,
      doc_label: docConfig.label,
      method: 'upload',
      file_url,
      status: 'הועלה',
      required: !docConfig.optional,
    });
    setUploadingType(null);
    refresh();
  };

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="space-y-2">
      <div className="text-[#D4AF37] text-xs font-bold mb-1">רשימת מסמכים נדרשת — {category}</div>
      {docsConfig.map(docConfig => {
        const saved = findDoc(docConfig.doc_type);
        return (
          <div key={docConfig.doc_type} className={`bg-[#1B263B] border rounded-lg p-3 ${saved ? 'border-green-500/20' : 'border-white/10'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {saved ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" /> : <Clock size={14} className="text-white/30 flex-shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <div className="text-white text-xs font-bold">{docConfig.label} {docConfig.optional && <span className="text-white/30 font-normal">(אם רלוונטי)</span>}</div>
                  {saved && (
                    <div className="text-[10px] text-white/40 mt-0.5">
                      {saved.method === 'upload' ? 'הועלה כקובץ חתום' : `נחתם דיגיטלית ע״י ${saved.signature_name} · ${new Date(saved.signed_at).toLocaleString('he-IL')}`}
                    </div>
                  )}
                </div>
              </div>
              {saved ? (
                saved.file_url ? (
                  <a href={saved.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:text-amber-300 flex-shrink-0">
                    <FileCheck2 size={12} /> צפה
                  </a>
                ) : (
                  <span className="text-[10px] text-green-400 font-bold flex-shrink-0">✓ נחתם</span>
                )
              ) : (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <label className="flex items-center gap-1 text-[10px] font-bold text-white/60 hover:text-white border border-white/15 rounded-full px-2 py-1 cursor-pointer transition-colors">
                    {uploadingType === docConfig.doc_type ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                    העלה חתום
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleUploadFile(docConfig, e.target.files?.[0])} />
                  </label>
                  <button onClick={() => setSignDoc(docConfig)} className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] hover:text-amber-300 border border-[#D4AF37]/30 rounded-full px-2 py-1 transition-colors">
                    <PenLine size={11} /> מלא וחתום
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {signDoc && (
        <DigitalSignDocModal
          doc={signDoc}
          transferId={transferId}
          category={category}
          onClose={() => setSignDoc(null)}
          onSaved={() => { setSignDoc(null); refresh(); }}
        />
      )}
    </div>
  );
}