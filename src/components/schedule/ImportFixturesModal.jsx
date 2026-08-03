import { useState, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImportFixturesModal({ club, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(''); setResult(null);
    try {
      // 1) העלאת הקובץ לאחסון
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // 2) שליחה למנוע לייבוא
      const res = await base44.functions.invoke('fixtures-engine', {
        action: 'import',
        file_url,
        club_id: club.id,
        club_name: club.club_name,
      });
      setResult(res.data);
      onDone?.();
    } catch (e) {
      setError(e.message || 'שגיאה בייבוא');
    }
    setUploading(false);
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-panel border border-hairline rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="sticky top-0 bg-panel border-b border-hairline px-5 py-3 flex items-center justify-between">
          <h2 className="text-ink font-black text-sm flex items-center gap-2"><FileSpreadsheet size={15} className="text-brand" /> ייבוא לו״ז מקובץ (Excel/CSV)</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* הסבר פורמט */}
          <div className="bg-surface border border-hairline rounded-lg p-3 text-[11px] text-ink-muted leading-relaxed">
            עמודות נדרשות: <span className="text-ink font-bold">age_group, home_team, away_team, match_date (YYYY-MM-DD), kickoff_time (HH:MM), stadium_name</span>. עמודות אופציונליות: competition, round, notes. המנוע מזהה כפילויות, סתירות מגרש/קבוצה, והפרות מנוחת נוער לפני השמירה.
          </div>

          <label className="block border-2 border-dashed border-hairline rounded-lg p-6 text-center cursor-pointer hover:border-brand-line transition-colors">
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div className="text-ink text-sm font-bold">{file.name}</div>
            ) : (
              <div className="text-ink-faint text-sm">בחר קובץ להעלאה</div>
            )}
          </label>

          <button onClick={handleUpload} disabled={!file || uploading} className="w-full bg-brand text-brand-ink font-bold text-sm py-2.5 rounded-md flex items-center justify-center gap-1.5 disabled:opacity-40">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? 'מייבא ומאמת…' : 'ייבא ואמת'}
          </button>

          {error && <div className="text-red-400 text-xs">{error}</div>}

          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400 text-sm font-bold"><CheckCircle2 size={14} /> הייבוא הושלם</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="נשמרו" value={result.imported} color="green" />
                <Stat label="התנגשויות" value={result.blockedByConflict} color="red" />
                <Stat label="כפילויות" value={result.duplicates} color="amber" />
              </div>
              {result.blockedByConflict > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {result.conflicts.map((c, i) => (
                    <div key={i} className="text-red-300 text-[11px]">
                      <AlertTriangle size={10} className="inline ml-1" />
                      {c.fixture.home_team} נגד {c.fixture.away_team} — {c.conflicts.map(x => x.type).join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Backdrop>
  );
}

function Stat({ label, value, color }) {
  const c = { green: 'text-green-400', red: 'text-red-400', amber: 'text-amber-400' }[color];
  return <div className="bg-surface border border-hairline rounded-md p-2">
    <div className={`text-xl font-black ${c}`}>{value}</div>
    <div className="text-ink-faint text-[10px]">{label}</div>
  </div>;
}

function Backdrop({ children, onClose }) {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow; root.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { root.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>{children}</div>;
}