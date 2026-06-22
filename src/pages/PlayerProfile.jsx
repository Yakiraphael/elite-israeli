import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, MapPin, Trophy, Calendar, ChevronRight, CheckCircle2, ArrowRight, Star, Target, TrendingUp, Shield, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import EliteIdCard from '../components/EliteIdCard';
import PlayerRegistrationForm from '../components/registration/PlayerRegistrationForm';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const POSITIONS_INFO = {
  'שוער': { role: 'Goalkeeper', skills: ['רפלקסים', 'מיקום', 'הנחיית הגנה', 'קריאת משחק'], color: 'from-yellow-500 to-amber-600' },
  'בלם': { role: 'Centre Back', skills: ['סימון', 'כדורי ראש', 'הוצאת כדור', 'כיסוי'], color: 'from-blue-600 to-blue-800' },
  'מגן צד': { role: 'Full Back', skills: ['ריצה לעומק', 'מסירות צולבות', '1v1', 'כיסוי'], color: 'from-blue-500 to-cyan-600' },
  'קשר מגן': { role: 'Defensive Mid', skills: ['יירוט', 'לחץ', 'מסירות קצרות', 'ויסות קצב'], color: 'from-green-600 to-emerald-700' },
  'קשר': { role: 'Central Mid', skills: ['ראיית משחק', 'מסירות', 'תנועה', 'גמר'], color: 'from-green-500 to-teal-600' },
  'קשר התקפי': { role: 'Attacking Mid', skills: ['יצירתיות', 'שוט', 'פאסינג', 'מיקום'], color: 'from-orange-500 to-amber-600' },
  'חלוץ צד': { role: 'Winger', skills: ['מהירות', '1v1', 'כדורי מוח', 'גמר'], color: 'from-red-500 to-orange-500' },
  'חלוץ': { role: 'Striker', skills: ['גמר', 'מיקום', 'ראש', 'לחץ'], color: 'from-red-600 to-red-800' },
};

export default function PlayerProfile() {
  const [savedPlayer, setSavedPlayer] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ['team-events'],
    queryFn: () => base44.entities.TeamEvent.filter({ is_active: true }, 'date_start', 20),
  });

  if (savedPlayer) {
    return <PlayerProfileView player={savedPlayer} events={events} />;
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/transfer-portal" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לכניסה
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      <PlayerRegistrationForm onSuccess={setSavedPlayer} />
    </div>
  );
}

// ---- Player Profile View (after registration) ----
function PlayerProfileView({ player, events }) {
  const [tab, setTab] = useState('profile');
  const posInfo = POSITIONS_INFO[player.position] || { role: '', skills: [], color: 'from-gray-600 to-gray-800' };
  const playerEvent = events.find(e => e.id === player.event_id);

  const analysisData = [
    { icon: Zap, label: 'מהירות', desc: 'ניתוח ספרינטים, זמן תגובה ומהירות ריצה על המגרש' },
    { icon: Target, label: 'דיוק', desc: 'אחוזי הצלחה במסירות, שוטים ואינסויים' },
    { icon: Shield, label: 'הגנה', desc: 'יירוטים, נגיעות בכדור, כיסויים ומשחק 1v1' },
    { icon: TrendingUp, label: 'פרודוקטיביות', desc: 'תרומה למשחק לפי עמדה, KPI אישי' },
    { icon: Activity, label: 'כושר גופני', desc: 'ניטור עומסי אימון, התאוששות ומניעת פציעות' },
    { icon: Star, label: 'מנטל', desc: 'ביצועים תחת לחץ, מנהיגות ותרומה לקבוצה' },
  ];

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לאתר
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className={`bg-gradient-to-l ${posInfo.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[#0D1B2A]/60" />
        <div className="relative max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-[#D4AF37]/20 border-4 border-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <User size={40} className="text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase mb-1">שחקן עילית ישראלית</div>
            <h1 className="text-white text-3xl md:text-4xl font-black">{player.full_name}</h1>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="bg-[#D4AF37] text-[#0D1B2A] text-xs font-black px-3 py-1 rounded-full">{player.position}</span>
              <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{posInfo.role}</span>
              {player.team_name && <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{player.team_name}</span>}
              {player.city && <span className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full flex items-center gap-1"><MapPin size={10} />{player.city}</span>}
            </div>
          </div>
          <div className="md:mr-auto">
            <div className="bg-green-500/20 border border-green-500/40 rounded-lg px-4 py-2 text-center">
              <div className="text-green-400 text-xs font-bold">{player.ifa_ready ? '✓ IFA Ready' : '✓ נרשמת בהצלחה'}</div>
              <div className="text-white/50 text-xs mt-0.5">הפרופיל שלך פעיל</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 sticky top-0 bg-[#0D1B2A] z-10">
        <div className="max-w-5xl mx-auto px-6 flex gap-0">
          {[{ id: 'profile', label: 'פרופיל' }, { id: 'events', label: 'אירועים' }, { id: 'analysis', label: 'ניתוח שחקן' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 ${tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-4">נתוני שחקן</h3>
                <div className="space-y-3">
                  {[
                    { label: 'גובה', value: player.height_cm ? `${player.height_cm} ס״מ` : null },
                    { label: 'משקל', value: player.weight_kg ? `${player.weight_kg} ק״ג` : null },
                    { label: 'ניסיון', value: player.experience_years ? `${player.experience_years} שנים` : null },
                    { label: 'רגל', value: player.dominant_foot },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-white/40">{item.label}</span>
                      <span className="text-white font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`bg-gradient-to-br ${posInfo.color} rounded-lg p-6`}>
                <div className="text-white text-xs font-bold uppercase tracking-widest mb-3">כישורי עמדה</div>
                <div className="space-y-2">
                  {posInfo.skills.map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span className="text-white/90 text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              {(player.elite_id || player.stats) && (
                <div className="bg-[#1B263B] border border-[#D4AF37]/20 rounded-lg p-4">
                  <EliteIdCard
                    name={player.full_name}
                    eliteId={player.elite_id || 'ELITE-2026-----'}
                    position={player.position}
                    stats={player.stats || {}}
                    avatarUrl={player.avatar_url}
                    age={player.birth_date ? (new Date().getFullYear() - new Date(player.birth_date).getFullYear()) : undefined}
                    city={player.city}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              {player.ifa_id && (
                <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                  <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3">כרטיס IFA</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">מספר כרטיס שחקן</span>
                    <span className="text-white font-semibold">{player.ifa_id}</span>
                  </div>
                </div>
              )}
              {player.previous_clubs && (
                <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                  <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3">קבוצות קודמות</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{player.previous_clubs}</p>
                </div>
              )}
              {player.achievements && (
                <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                  <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2"><Trophy size={14} /> הישגים</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{player.achievements}</p>
                </div>
              )}
              {playerEvent && (
                <div className="bg-[#1B263B] border border-[#D4AF37]/30 rounded-lg p-6">
                  <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2"><Calendar size={14} /> האירוע שלי</h3>
                  <div className="text-white font-bold">{playerEvent.name}</div>
                  <div className="text-[#D4AF37] text-sm mt-1">{playerEvent.type} · {playerEvent.city}</div>
                  <div className="text-white/40 text-xs mt-1">{playerEvent.date_start}{playerEvent.date_end ? ` — ${playerEvent.date_end}` : ''}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-white font-black text-xl mb-6">אירועים וטורנירים</h2>
            {events.length === 0 ? (
              <div className="text-center py-16 text-white/30">אין אירועים פעילים כרגע</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(ev => (
                  <div key={ev.id} className={`bg-[#1B263B] border rounded-lg p-6 ${ev.id === player.event_id ? 'border-[#D4AF37]/50' : 'border-white/10'}`}>
                    {ev.id === player.event_id && (
                      <div className="text-[#D4AF37] text-xs font-bold mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> האירוע שלי</div>
                    )}
                    <div className="text-white font-black text-base">{ev.name}</div>
                    <div className="text-[#D4AF37] text-xs mt-1">{ev.type}</div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/50">
                      <span className="flex items-center gap-1"><MapPin size={10} />{ev.city || ev.location}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} />{ev.date_start}</span>
                      {ev.age_group && <span>{ev.age_group}</span>}
                    </div>
                    {ev.description && <p className="text-white/40 text-xs mt-3 leading-relaxed">{ev.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'analysis' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8">
              <h2 className="text-white font-black text-xl">ניתוח שחקן כדורגל</h2>
              <p className="text-white/40 text-sm mt-1">מדדים ותחומי ניתוח מקצועיים לשחקן עמדת {player.position || 'שדה'}</p>
            </div>

            {posInfo && (
              <div className={`bg-gradient-to-l ${posInfo.color} rounded-lg p-6 mb-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[#0D1B2A]/50" />
                <div className="relative">
                  <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-2">פרופיל עמדה</div>
                  <h3 className="text-white text-2xl font-black">{player.position} · {posInfo.role}</h3>
                  <p className="text-white/60 text-sm mt-2">כישורי הליבה לעמדה זו: {posInfo.skills.join(' · ')}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisData.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-[#1B263B] border border-white/10 hover:border-[#D4AF37]/40 rounded-lg p-6 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors">
                    <item.icon size={18} className="text-[#D4AF37]" />
                  </div>
                  <div className="text-white font-black text-base mb-2">{item.label}</div>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                  <div className="mt-4 text-[#D4AF37] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    בקרוב <ChevronRight size={12} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 bg-[#1B263B] border border-[#D4AF37]/20 rounded-lg p-6 text-center">
              <div className="text-[#D4AF37] font-black text-lg mb-2">מערכת ניתוח מתקדמת בפיתוח</div>
              <p className="text-white/50 text-sm max-w-lg mx-auto">בקרוב תוכל לצפות בסטטיסטיקות אישיות, וידאו ניתוח, השוואת ביצועים וחוות דעת מאמן — הכל במקום אחד.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}