import { useState } from 'react';
import { Play, Link as LinkIcon, Video } from 'lucide-react';

function getYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function VideoHighlightsGallery({ links = [] }) {
  const [playingId, setPlayingId] = useState(null);

  if (!links.length) return null;

  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2">
        <Video size={12} /> Highlights
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {links.map((link, i) => {
          const ytId = getYoutubeId(link);
          const cardKey = `${i}-${link}`;
          return (
            <div key={cardKey} className="flex-shrink-0 w-[220px]">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-[#0D1B2A] border border-white/10">
                {ytId ? (
                  playingId === cardKey ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                      title={`highlight-${i}`}
                      className="w-full h-full"
                      allow="accelerate; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button onClick={() => setPlayingId(cardKey)} className="group relative w-full h-full block">
                      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={`highlight-${i}`} className="w-full h-full object-cover" />
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
            </div>
          );
        })}
      </div>
    </div>
  );
}