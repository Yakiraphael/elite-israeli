import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy" dir="rtl">
      {/* GuideStar Banner - light style inside dark footer */}
      <div className="bg-white/5 border-b border-white/10 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="font-body text-xs text-white/50 font-semibold">שקיפות ומהימנות:</span>
          <a
            href="https://www.guidestar.org.il/organization/517165627/documents"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-xs font-bold text-gold hover:text-gold-light transition-colors border border-gold/30 hover:border-gold/70 bg-gold/5 hover:bg-gold/10 px-4 py-2 rounded-sm"
          >
            <ExternalLink size={13} />
            לצפייה במסמכי העמותה והאישורים הרשמיים בגיידסטאר
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png"
              alt="עילית ישראלית"
              className="h-12 w-auto"
            />
          </div>
          <div className="text-center">
            <p className="font-body text-xs text-white/30">
              © 2025 עילית ישראלית (חלצ) · כל הזכויות שמורות
            </p>
            <p className="font-body text-xs text-gold/40 mt-1 tracking-widest uppercase">
              שינוי · אמונה · רצון
            </p>
          </div>
          <div className="flex gap-6">
            {['מדיניות פרטיות', 'תנאי שימוש', 'צרו קשר'].map(link => (
              <button key={link} className="font-body text-xs text-white/30 hover:text-gold transition-colors">
                {link}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/25 flex items-center justify-center">
              <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.588.79c.58 1.487 2.313 4.012 3.842 5.542 1.53 1.528 4.056 3.262 5.542 3.84l.79-1.587a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
            </div>
            <div>
              <span className="font-body text-xs text-gold font-bold tracking-wide">טלפון</span>
              <p className="font-body text-sm text-white/70 mt-0.5">050-908-0518</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}