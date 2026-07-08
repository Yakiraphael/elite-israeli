import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Users } from 'lucide-react';
import ChildOverviewCard from '../components/guardian/ChildOverviewCard';

const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

export default function GuardianPortal() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        setUser(null);
      }
      setLoadingUser(false);
    })();
  }, []);

  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ['guardian-children', user?.email],
    queryFn: () => base44.entities.PlayerRegistration.filter({ parent_email: user.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const { data: allOffers = [] } = useQuery({
    queryKey: ['guardian-offers', children.map(c => c.elite_id || c.id).join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        children.map(c => base44.entities.TransferProposal.filter({ player_elite_id: c.elite_id || c.id, status: 'מאושר — ממתין לאפוטרופוס' }, '-created_date', 20))
      );
      return results;
    },
    enabled: children.length > 0,
  });

  const loading = loadingUser || loadingChildren;

  return (
    <div className="min-h-screen bg-[#0D1B2A]" dir="rtl">
      <div className="border-b border-white/10 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/transfer-portal" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-300 transition-colors text-sm font-bold">
            <ArrowRight size={16} /> חזרה לפורטל
          </Link>
          <img src={LOGO_URL} alt="עילית ישראלית" className="h-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-3">
            <Users size={22} className="text-[#D4AF37]" />
          </div>
          <h1 className="text-white text-2xl font-black">פורטל האפוטרופוס / הניהול האישי</h1>
          <p className="text-white/40 text-xs mt-1">מעקב אחר השחקנים המשויכים אליך, מסמכים, חוזים והעברות</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>
        ) : children.length === 0 ? (
          <div className="text-center py-16 bg-[#1B263B] border border-white/10 rounded-lg">
            <Users size={26} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">לא נמצאו שחקנים המשויכים לכתובת המייל שלך.</p>
            <p className="text-white/25 text-xs mt-1">ודא שכתובת המייל שלך תואמת לפרטי ההורה שהוזנו בטופס הרישום של השחקן.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child, i) => (
              <ChildOverviewCard key={child.id} player={child} pendingOffers={allOffers[i] || []} guardianUser={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}