import { ExternalLink } from 'lucide-react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';

const LOGO = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

export default function Footer() {
  const s = useHomeStrings();

  return (
    <footer className="relative overflow-hidden bg-surface border-t border-hairline">
      <div className="border-b border-hairline py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="text-xs text-ink-muted font-semibold">{s.footer.transparency}</span>
          <a href="https://www.guidestar.org.il/organization/517165627/documents" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand border border-brand-line bg-brand-soft hover:bg-brand hover:text-brand-ink transition-colors px-4 py-2 rounded-full">
            <ExternalLink size={13} /> {s.footer.guidestar}
          </a>
        </div>
      </div>

      <div className="py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <img src={LOGO} alt={s.nav.home} className="h-11 w-auto" />
          <div className="text-center">
            <p className="text-xs text-ink-faint">{s.footer.copyright}</p>
            <p className="text-[10px] text-brand/70 mt-1 tracking-[0.3em] uppercase">{s.footer.motto}</p>
          </div>
          <div className="flex gap-5">
            {s.footer.links.map(link => (
              <button key={link} className="text-xs text-ink-faint hover:text-brand transition-colors">{link}</button>
            ))}
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-soft border border-brand-line flex items-center justify-center">
              <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.588.79c.58 1.487 2.313 4.012 3.842 5.542 1.53 1.528 4.056 3.262 5.542 3.84l.79-1.587a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
            </div>
            <div className="text-right">
              <span className="text-xs text-brand font-bold block">{s.footer.phoneLabel}</span>
              <p dir="ltr" className="text-sm text-ink-muted mt-0.5 tabnum">050-908-0518</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}