import { useState, useRef } from 'react';
import { Upload, FileCheck2, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DocumentUpload({ label, name, value, onChange, required, hint, accept = 'image/*,.pdf' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      setError('שגיאה בהעלאת הקובץ');
    }
    setUploading(false);
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="text-[#D4AF37] text-xs font-bold tracking-wide mb-2 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {hint && <p className="text-white/30 text-[10px] mb-2">{hint}</p>}
      {value ? (
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <FileCheck2 size={16} className="text-green-400" />
            <span className="text-green-400 text-xs font-bold">הקובץ הועלה בהצלחה</span>
          </div>
          <button onClick={handleRemove} className="text-white/30 hover:text-red-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-sm py-6 cursor-pointer transition-colors ${error ? 'border-red-400/40' : 'border-white/15 hover:border-[#D4AF37]/50'}`}>
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-[#D4AF37]" />
          ) : (
            <Upload size={20} className="text-white/30" />
          )}
          <span className="text-white/40 text-xs">{uploading ? 'מעלה...' : 'לחץ להעלאת קובץ'}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
        </label>
      )}
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}