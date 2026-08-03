import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useHomeStrings } from '@/lib/i18n/homeStrings';
import LanguageSwitcher from './LanguageSwitcher';

const LOGO = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

export default function Navbar() {
  const s = useHomeStrings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = useNavigate();
  const handleNav = (href) => {
    setOpen(false);
    if (href.startsWith('/')) { navigate(href); return; }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const onDark = !scrolled;

  const navLinks = [
    { label: s.nav.home, href: '#hero' },
    { label: s.nav.mission, href: '#mission' },
    { label: s.nav.goals, href: '#goals' },
    { label: s.nav.programs, href: '#programs' },
    { label: s.nav.team, href: '#team' },
    { label: s.nav.roadmap, href: '#roadmap' },
    { label: s.nav.iefa, href: '#transfer-hub' },
    { label: s.nav.faq, href: '/faq' },
    { label: s.nav.contact, href: '#contact' },
  ];

  return (
    <nav role="navigation" aria-label={s.nav.homeBtn}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'glass-light border-b border-black/5 shadow-sm' : 'bg-transparent'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
        <button onClick={() => handleNav('#hero')} aria-label={s.nav.homeBtn} className="flex items-center gap-2.5 shrink-0">
          <img src={LOGO} alt={s.nav.home} className="h-9 md:h-10 w-auto transition-all duration-300"
            style={{ filter: onDark ? 'none' : 'invert(1) sepia(1) saturate(0) brightness(0.12)' }} />
        </button>

        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <li key={link.label}>
              <button onClick={() => handleNav(link.href)}
                className={`relative text-[13px] font-semibold tracking-wide transition-colors duration-200 group ring-focus
                  ${onDark ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
                {link.label}
                <span className="absolute -bottom-1.5 right-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <button onClick={() => handleNav('#contact')}
            className={`hidden md:inline-flex items-center text-[13px] font-bold px-4 h-9 rounded-full transition-all duration-200 ring-focus
              ${onDark ? 'bg-gold text-white hover:bg-gold-light shadow-lg shadow-gold/25' : 'bg-navy text-white hover:bg-navy-light'}`}>
            {s.nav.join}
          </button>
        </div>

        <button className={`md:hidden ${onDark ? 'text-white' : 'text-slate-900'}`} onClick={() => setOpen(!open)}
          aria-label={open ? s.nav.menuClose : s.nav.menuOpen} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {scrolled && <div className="nav-edge" />}

      {open && (
        <div className="md:hidden glass-light border-t border-black/5 px-5 py-4 space-y-1">
          {navLinks.map(link => (
            <button key={link.label} onClick={() => handleNav(link.href)}
              className="block w-full text-right text-sm font-semibold text-slate-800 hover:text-gold py-2.5 transition-colors">
              {link.label}
            </button>
          ))}
          <div className="flex items-center justify-between pt-3">
            <LanguageSwitcher />
            <button onClick={() => handleNav('#contact')}
              className="text-sm font-bold bg-navy text-white py-3 px-6 rounded-full">
              {s.nav.join}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}