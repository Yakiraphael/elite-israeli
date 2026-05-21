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
        </div>
      </div>
    </footer>
  );
}