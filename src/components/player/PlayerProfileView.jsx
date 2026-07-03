import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Trophy, Calendar, ChevronRight, CheckCircle2, ArrowRight, Star,
  Target, TrendingUp, Shield, Zap, Activity, Baby, Globe, FileText, Download,
  Video, Link as LinkIcon, AlertTriangle, Vault, Briefcase, RefreshCw, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RoleToolbar from '../RoleToolbar';
import EliteIdCard from '../EliteIdCard';
import MentalJourneyChart from './MentalJourneyChart';
import TransferTrackerPanel from './TransferTrackerPanel';
import RequestHub from './RequestHub';
import { Lock } from 'lucide-react';

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

const TABS = [
  { id: 'showcase', label: '📋 Showcase', labelHe: 'הפרופיל הציבורי' },
  { id: 'vault', label: '🔐 Vault', labelHe: 'הכספת' },
  { id: 'cv', label: '💼 CV Engine', labelHe: 'קורות חיים' },
  { id: 'transfers', label: '🔄 Transfer Hub', labelHe: 'העברות' },
  { id: 'requests', label: '🎯 בקשות', labelHe: 'מרכז בקשות' },
];

const RESTRICTED_TABS = ['vault', 'transfers', 'requests'];

export default function PlayerProfileView({ player, events }) {
  const [tab, setTab] = useState('showcase');
  const posInfo = POSITIONS_INFO[player.position] || { role: '', skills: [], color: 'from-gray-600 to-gray-800' };
  const playerEvent = events.find(e => e.id === player.event_id);
  const isMedicalExpired = player.medical_expiry_date && new Date(player.medical_expiry_date) < new Date();
  const isMedicalSoon = !isMedicalExpired && player.medical_expiry_date && (new Date(player.medical_expiry_date) - new Date()) < 30 * 24 * 60 * 60 * 1000;
  const isApproved = player.account_status === 'מאושר';

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <RoleToolbar activeLabel="הפרופיל שלי" activeIcon={User} />

      {/* Header */}
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לאתר
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      {/* Pending approval banner */}
      {!isApproved && (
        <div className="flex items-center gap-3 px-6 py-3 text-sm font-bold bg-amber-500/15 border-b border-amber-500/30 text-amber-400">
          <Lock size={16} />
          {player.account_status === 'מושעה'
            ? '⛔ החשבון שלך מושעה — פנה לצוות המקצועי לבירור.'
            : 'החשבון שלך בבדיקה. אנו מאמתים את פרטיך מול הפרופיל שסופק — האישור יתקבל תוך 24 שעות.'}
        </div>
      )}

      {/* Alert bar */}
      {isApproved && (isMedicalExpired || isMedicalSoon) && (
        <div className={`flex items-center gap-3 px-6 py-3 text-sm font-bold ${isMedicalExpired ? 'bg-red-500/20 border-b border-red-500/30 text-red-400' : 'bg-amber-500/20 border-b border-amber-500/30 text-amber-400'}`}>
          <AlertTriangle size={16} />
          {isMedicalExpired
            ? '⛔ תוקף הבדיקה הרפואית פג — הפרופיל חסום להצעות. העלה אישור חדש.'
            : `⚠️ תוקף הבדיקה הרפואית יפוג בעוד פחות מ-30 יום. לחץ להעדכן.`}
        </div>
      )}

      {/* Hero */}
      <div className={`bg-gradient-to-l ${posInfo.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[#0D1B2A]/65" />
        <div className="relative max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border-4 border-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <User size={36} className="text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <div className="text-[#D4AF37] text-xs tracking-[0.3em] font-bold uppercase mb-1">
              {player.is_adult ? 'שחקן בוגר' : 'שחקן נוער'} · עילית ישראלית
            </div>
            <h1 className="text-white text-2xl md:text-4xl font-black">{player.full_name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-[#D4AF37] text-[#0D1B2A] text-xs font-black px-3 py-1 rounded-full">{player.position}</span>
              <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{posInfo.role}</span>
              {player.team_name && <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{player.team_name}</span>}
              {player.city && <span className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full flex items-center gap-1"><MapPin size={10} />{player.city}</span>}
              <span className={`text-xs font-black px-3 py-1 rounded-full ${player.is_free_agent ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/50'}`}>
                {player.is_free_agent ? '🟢 Free Agent' : '⚪ Under Contract'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {player.ifa_ready && (
              <div className="bg-green-500/20 border border-green-500/40 rounded-lg px-4 py-2 text-center">
                <div className="text-green-400 text-xs font-bold">✓ IFA Ready</div>
                <div className="text-white/50 text-xs">מוכן להעברה</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 sticky top-0 bg-[#0D1B2A] z-10 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-6 flex gap-0">
          {TABS.map(t => {
            const locked = !isApproved && RESTRICTED_TABS.includes(t.id);
            return (
              <button key={t.id} onClick={() => !locked && setTab(t.id)} disabled={locked}
                className={`px-4 py-4 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${locked ? 'text-white/20 border-transparent cursor-not-allowed' : tab === t.id ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-white/40 border-transparent hover:text-white/70'}`}>
                {t.label} {locked && <Lock size={10} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* 1. SHOWCASE */}
          {tab === 'showcase' && (
            <motion.div key="showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
                  <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-4">נתוני שחקן</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: '⚡ גובה', value: player.height_cm ? `${player.height_cm} ס״מ` : null },
                      { label: '💪 משקל', value: player.weight_kg ? `${player.weight_kg} ק״ג` : null },
                      { label: '📅 ניסיון', value: player.experience_years ? `${player.experience_years} שנים` : null },
                      { label: '👟 רגל', value: player.dominant_foot },
                      { label: '🎯 עמדה ב', value: player.secondary_position },
                    ].filter(i => i.value).map(item => (
                      <div key={item.label} className="flex justify-between text-xs">
                        <span className="text-white/40">{item.label}</span>
                        <span className="text-white font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(player.elite_id || player.stats) && (
                  <EliteIdCard
                    name={player.full_name} eliteId={player.elite_id || 'ELITE-2026-----'}
                    position={player.position} stats={player.stats || {}}
                    avatarUrl={player.avatar_url}
                    age={player.birth_date ? (new Date().getFullYear() - new Date(player.birth_date).getFullYear()) : undefined}
                    city={player.city}
                  />
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                {/* Video highlights */}
                {player.media_links?.length > 0 && (
                  <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
                    <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2"><Video size={12} /> Highlights</h3>
                    <div className="space-y-2">
                      {player.media_links.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-white/60 hover:text-[#D4AF37] transition-colors">
                          <LinkIcon size={12} /> {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elite Journey timeline */}
                {player.elite_journey?.length > 0 && (
                  <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
                    <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-4">Career Timeline</h3>
                    <div className="space-y-3">
                      {player.elite_journey.map((ev, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1 flex-shrink-0" />
                            {i < player.elite_journey.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                          </div>
                          <div className="pb-3">
                            <div className="text-white font-bold text-sm">{ev.title}</div>
                            <div className="text-[#D4AF37] text-[10px]">{ev.date} · {ev.category}</div>
                            {ev.description && <p className="text-white/50 text-xs mt-1">{ev.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mental chart */}
                <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
                  <MentalJourneyChart
                    playerId={player.id}
                    isEliteOrg={!!player.elite_id}
                    isPro={player.subscription_tier === 'Elite Pro'}
                  />
                </div>

                {player.achievements && (
                  <div className="bg-[#1B263B] border border-white/10 rounded-lg p-5">
                    <h3 className="text-[#D4AF37] text-xs tracking-widest font-bold uppercase mb-3 flex items-center gap-2"><Trophy size={12} /> הישגים</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{player.achievements}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. VAULT */}
          {tab === 'vault' && isApproved && (
            <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-4">
              <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-black text-base mb-1">🔐 הכספת המשפטית</h3>
                <p className="text-white/40 text-xs mb-5">כל המסמכים הרגולטוריים שלך במקום אחד מאובטח</p>
                <div className="space-y-3">
                  {[
                    { label: '🪪 תעודת זהות', url: player.id_document_url, status: !!player.id_document_url },
                    { label: '📎 ספח תעודת זהות', url: player.id_suffix_url, status: !!player.id_suffix_url, youthOnly: true },
                    { label: '🩺 אישור רפואי', url: player.medical_certificate_url, status: !!player.medical_certificate_url, expiry: player.medical_expiry_date },
                  ].filter(d => !d.youthOnly || !player.is_adult).map((doc, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${doc.status ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                      <div className="flex items-center gap-2">
                        <span className={doc.status ? 'text-green-400 text-xs font-bold' : 'text-red-400 text-xs font-bold'}>
                          {doc.status ? '✓' : '✗'}
                        </span>
                        <span className="text-white text-sm">{doc.label}</span>
                        {doc.expiry && (
                          <span className={`text-[10px] ${isMedicalExpired ? 'text-red-400' : isMedicalSoon ? 'text-amber-400' : 'text-green-400'}`}>
                            · {doc.expiry}
                          </span>
                        )}
                      </div>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] text-xs hover:text-amber-300">
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {player.is_adult && (
                <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-black text-base mb-1">💳 פרטים פיננסיים</h3>
                  <p className="text-white/40 text-xs mb-3">שמורים מוצפנים — מוצגות 4 ספרות אחרונות בלבד</p>
                  <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-3">
                    <span className="text-white/60 text-sm">{player.bank_token ? `•••• •••• •••• ${player.bank_token.slice(-4)}` : 'לא הוזן אמצעי תשלום'}</span>
                  </div>
                </div>
              )}

              <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-black text-base mb-3">📋 אישורים משפטיים</h3>
                <div className="space-y-2">
                  {Object.entries(player.legal_terms_accepted || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 size={14} className={val ? 'text-green-400' : 'text-red-400'} />
                      <span className="text-white/60 capitalize">{key.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. CV ENGINE */}
          {tab === 'cv' && (
            <motion.div key="cv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-black text-base">💼 The CV Engine</h3>
                    <p className="text-white/40 text-xs">מחולל קורות חיים דינמי — דו-לשוני</p>
                  </div>
                  <button className="flex items-center gap-2 bg-[#D4AF37] text-[#0D1B2A] font-black text-xs px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors">
                    <Download size={14} /> ייצוא PDF
                  </button>
                </div>

                <div className="bg-[#0D1B2A] border border-white/10 rounded-lg p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center flex-shrink-0">
                      <User size={28} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-xl">{player.full_name}</h4>
                      <p className="text-[#D4AF37] text-sm font-bold">{player.position} {posInfo.role && `· ${posInfo.role}`}</p>
                      <p className="text-white/50 text-xs">{player.city} {player.phone && `· ${player.phone}`}</p>
                    </div>
                  </div>

                  <div className="section-divider" />

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[#D4AF37] font-bold mb-1">Physical Profile</p>
                      {player.height_cm && <p className="text-white/60">Height: {player.height_cm} cm</p>}
                      {player.weight_kg && <p className="text-white/60">Weight: {player.weight_kg} kg</p>}
                      {player.dominant_foot && <p className="text-white/60">Dominant Foot: {player.dominant_foot}</p>}
                    </div>
                    <div>
                      <p className="text-[#D4AF37] font-bold mb-1">Professional</p>
                      {player.team_name && <p className="text-white/60">Current Club: {player.team_name}</p>}
                      {player.experience_years && <p className="text-white/60">Experience: {player.experience_years} yrs</p>}
                      {player.ifa_id && <p className="text-white/60">IFA ID: {player.ifa_id}</p>}
                    </div>
                  </div>

                  {player.previous_clubs && (
                    <div>
                      <p className="text-[#D4AF37] font-bold text-xs mb-1">Career History</p>
                      <p className="text-white/60 text-xs">{player.previous_clubs}</p>
                    </div>
                  )}

                  {player.achievements && (
                    <div>
                      <p className="text-[#D4AF37] font-bold text-xs mb-1">🏆 Achievements</p>
                      <p className="text-white/60 text-xs">{player.achievements}</p>
                    </div>
                  )}

                  {player.transfermarkt_url && (
                    <a href={player.transfermarkt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#D4AF37] text-xs hover:text-amber-300">
                      <Globe size={12} /> Transfermarkt Profile
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-[#1B263B] border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-black text-sm mb-3">🏅 Trophy Room — תעודות והישגים</h3>
                <p className="text-white/40 text-xs mb-4">העלה תעודות מצטיין, אישורי נבחרת, קורסים ואישורי השתתפות</p>
                <button className="flex items-center gap-2 border border-dashed border-white/20 text-white/40 text-xs px-4 py-3 rounded-lg hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors w-full justify-center">
                  + הוסף תעודה / קובץ
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. TRANSFER HUB */}
          {tab === 'transfers' && isApproved && (
            <motion.div key="transfers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TransferTrackerPanel playerId={player.id} playerName={player.full_name} />
            </motion.div>
          )}

          {/* 5. REQUESTS */}
          {tab === 'requests' && isApproved && (
            <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RequestHub playerId={player.id} playerName={player.full_name} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}