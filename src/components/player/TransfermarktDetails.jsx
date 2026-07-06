import { Trophy, Table2, Flag, HeartPulse, ArrowLeftRight, Link as LinkIcon } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
      <h4 className="text-white font-black text-sm mb-3 flex items-center gap-2"><Icon size={14} className="text-[#D4AF37]" /> {title}</h4>
      {children}
    </div>
  );
}

export default function TransfermarktDetails({ data }) {
  const {
    achievements = [], career_stats = [], national_team = [],
    injuries = [], transfer_history = [], social_links = [],
  } = data;

  return (
    <>
      {achievements.length > 0 && (
        <Section icon={Trophy} title="הישגים ותארים">
          <div className="space-y-2">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <span className="text-white">{a.title}</span>
                <span className="text-white/40">{a.competition} · {a.year}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {career_stats.length > 0 && (
        <Section icon={Table2} title="נתוני קריירה לפי עונה">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="py-1.5 font-normal">עונה</th>
                  <th className="py-1.5 font-normal">קבוצה</th>
                  <th className="py-1.5 font-normal">מפעל</th>
                  <th className="py-1.5 font-normal">הופעות</th>
                  <th className="py-1.5 font-normal">שערים</th>
                  <th className="py-1.5 font-normal">בישולים</th>
                </tr>
              </thead>
              <tbody>
                {career_stats.map((s, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="py-1.5 text-white">{s.season}</td>
                    <td className="py-1.5 text-white/60">{s.club}</td>
                    <td className="py-1.5 text-white/40">{s.competition}</td>
                    <td className="py-1.5 text-white/60">{s.appearances ?? '-'}</td>
                    <td className="py-1.5 text-[#D4AF37] font-bold">{s.goals ?? '-'}</td>
                    <td className="py-1.5 text-white/60">{s.assists ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {national_team.length > 0 && (
        <Section icon={Flag} title="הופעות בנבחרת">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {national_team.map((n, i) => (
              <div key={i} className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3 text-center">
                <p className="text-white font-bold text-xs mb-1">{n.team}</p>
                <p className="text-[#D4AF37] font-black text-lg">{n.matches}</p>
                <p className="text-white/40 text-[10px]">משחקים · {n.goals} שערים</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(transfer_history.length > 0 || injuries.length > 0) && (
        <Section icon={ArrowLeftRight} title="ציר זמן — מעברים ופציעות">
          <div className="space-y-2">
            {[...transfer_history.map(t => ({ ...t, kind: 'transfer' })), ...injuries.map(inj => ({ ...inj, kind: 'injury' }))]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className={item.kind === 'injury' ? 'text-red-400' : 'text-[#D4AF37]'}>
                    {item.kind === 'injury' ? <HeartPulse size={13} /> : <ArrowLeftRight size={13} />}
                  </span>
                  <div className="flex-1">
                    {item.kind === 'transfer' ? (
                      <p className="text-white">{item.from_club} ← {item.to_club} <span className="text-white/40">({item.fee})</span></p>
                    ) : (
                      <p className="text-white">{item.injury_type} <span className="text-white/40">({item.duration_days} ימים)</span></p>
                    )}
                    <p className="text-white/30 text-[10px]">{item.date}</p>
                  </div>
                </div>
              ))}
          </div>
        </Section>
      )}

      {social_links.length > 0 && (
        <Section icon={LinkIcon} title="רשתות חברתיות">
          <div className="flex flex-wrap gap-2">
            {social_links.map((link, i) => (
              <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] text-xs hover:text-amber-300 transition-colors underline">
                {link}
              </a>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}