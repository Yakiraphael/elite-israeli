import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ClubOnboardingPanel from '@/components/admin/ClubOnboardingPanel';
import DangerZonePanel from '@/components/admin/DangerZonePanel';

// פורטל Super Admin — נקודת כניסה יחידה לקליטת מועדונים חדשים וניהול רב-מועדוני.
// גישה אך ורק ל-role: admin. שאר התפקידים רואים מסך נעילה. (גם אם המשתמש אינו admin, ה-RLS של ישות Club חוסם קריאה/כתיבה בצד שרת).
const LOGO_URL = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

export default function SuperAdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (alive) setUser(me);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <Loader2 className="animate-spin text-brand" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <div className="w-full max-w-sm px-6 text-center">
          <img src={LOGO_URL} alt="" className="h-14 mx-auto mb-5" />
          <div className="w-14 h-14 rounded-full bg-brand-soft border border-brand-line flex items-center justify-center mx-auto mb-4">
            <Crown size={22} className="text-brand" />
          </div>
          <h1 className="text-ink font-black text-xl mb-1">פורטל מנהל על</h1>
          <p className="text-ink-muted text-sm mb-6">קליטת מועדונים וניהול רב-מועדוני</p>
          <div className="bg-panel border border-hairline rounded-sm px-4 py-3 text-ink-muted text-xs">
            נדרשת הרשאת <span className="text-brand font-bold">admin</span> לכניסה לפורטל זה.
          </div>
          <Link to="/" className="text-ink-faint hover:text-ink-muted text-xs mt-4 inline-block">חזרה לאתר</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <header className="bg-panel border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="" className="h-7 w-auto" />
            <div>
              <h1 className="text-ink font-black text-base">פורטל Super Admin</h1>
              <p className="text-ink-faint text-[11px]">קליטת מועדונים · אימות מסמכים · הפעלת פעילות</p>
            </div>
          </div>
          <Link to="/" className="text-ink-muted hover:text-brand text-xs font-bold">אתר ←</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ClubOnboardingPanel user={user} />
        <DangerZonePanel user={user} />
      </main>
    </div>
  );
}