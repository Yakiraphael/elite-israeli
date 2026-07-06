import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Award, Download, Loader2, Plus } from 'lucide-react';

export default function CertificatesPanel({ player }) {
  const [certificates, setCertificates] = useState(player.certificates || []);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newCert = { title: file.name.replace(/\.[^/.]+$/, ''), issuer: '', date: new Date().toISOString().slice(0, 10), file_url };
    const updated = [...certificates, newCert];
    await base44.entities.PlayerRegistration.update(player.id, { certificates: updated });
    setCertificates(updated);
    setUploading(false);
  };

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-black text-sm mb-3">🏅 Trophy Room — תעודות והישגים</h3>
      <p className="text-white/50 text-xs mb-4">תעודות מצטיין, אישורי נבחרת, קורסים ואישורי השתתפות</p>

      {certificates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {certificates.map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
              <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                <Award size={16} className="text-[#D4AF37]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{c.title}</p>
                <p className="text-white/40 text-[10px]">{c.issuer && `${c.issuer} · `}{c.date}</p>
              </div>
              {c.file_url && (
                <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-amber-300 flex-shrink-0">
                  <Download size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 border border-dashed border-white/20 text-white/50 text-xs px-4 py-3 rounded-lg hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors w-full justify-center cursor-pointer">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {uploading ? 'מעלה...' : 'הוסף תעודה / קובץ'}
        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}