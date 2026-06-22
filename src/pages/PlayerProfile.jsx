import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PlayerRegistrationForm from '../components/registration/PlayerRegistrationForm';
import PlayerProfileView from '../components/player/PlayerProfileView';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

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