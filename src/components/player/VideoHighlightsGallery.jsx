import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Link as LinkIcon, Video, Pencil, X, Plus, Check, ChevronRight, ChevronLeft } from 'lucide-react';

const MAX_VIDEOS = 6;
const PAGE_SIZE = 6;

function getYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function VideoTile({ link, cardKey, playingId, setPlayingId, onRemove, editing }) {
  const ytId = getYoutubeId(link);
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-[#0D1B2A] border border-white/10">
      {editing && (
        <button onClick={() => onRemove(link)} className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500/80 flex items-center justify-center transition-colors">
          <X size={12} className="text-white" />
        </button>
      )}
      {ytId ? (
        playingId === cardKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
            title={cardKey}
            className="w-full h-full"
            allow="accelerate; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlayingId(cardKey)} className="group relative w-full h-full block">
            <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={cardKey} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg">
                <Play size={16} className="text-[#0D1B2A] ml-0.5" fill="currentColor" />
              </div>
            </div>
          </button>
        )
      ) : (
        <a href={link} target="_blank" rel="noopener noreferrer" className="group relative w-full h-full flex flex-col items-center justify-center gap-2 text-white/40 hover:text-[#D4AF37] transition-colors">
          <LinkIcon size={20} />
          <span className="text-[10px] px-3 text-center truncate max-w-full">{link}</span>
        </a>
      )}
    </div>
  );
}

export default function VideoHighlightsGallery({ player }) {
  const [links, setLinks] = useState(player.media_links || []);
  const [playingId, setPlayingId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);

  const persist = async (updated) => {
    setSaving(true);
    await base44.entities.PlayerRegistration.update(player.id, { media_links: updated });
    setLinks(updated);
    setSaving(false);
  };

  const handleAdd = () => {
    if (!newUrl.trim() || links.length >= MAX_VIDEOS) return;
    persist([...links, newUrl.trim()]);
    setNewUrl('');
  };

  const handleRemove = (link) => persist(links.filter(l => l !== link));

  if (!links.length && !editing) return null;

  const totalPages = Math.max(1, Math.ceil(links.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageLinks = links.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase flex items-center gap-2">
          <Video size={12} /> Highlights <span className="text-white/30 normal-case">({links.length})</span>
        </h3>
        <button onClick={() => setEditing(e => !e)} className="text-white/40 hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[10px] font-bold">
          {editing ? <><Check size={12} /> סיום עריכה</> : <><Pencil size={12} /> ערוך</>}
        </button>
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-3">
          {pageLinks.map((link, i) => (
            <VideoTile key={`${safePage}-${i}-${link}`} link={link} cardKey={`${safePage}-${i}-${link}`} playingId={playingId} setPlayingId={setPlayingId} onRemove={handleRemove} editing={editing} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-3">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
              <ChevronRight size={14} className="text-white/70" />
            </button>
            <span className="text-white/40 text-[10px] font-bold">{safePage + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
              <ChevronLeft size={14} className="text-white/70" />
            </button>
          </div>
        )}
      </div>

      {editing && links.length < MAX_VIDEOS && (
        <div className="flex items-center gap-2 mt-3">
          <input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="קישור לסרטון (YouTube וכו')"
            className="flex-1 bg-[#0D1B2A] border border-white/15 rounded-sm px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/60"
          />
          <button onClick={handleAdd} disabled={saving || !newUrl.trim()} className="bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-3 py-2 rounded-sm hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-1">
            <Plus size={13} /> הוסף
          </button>
        </div>
      )}
    </div>
  );
}