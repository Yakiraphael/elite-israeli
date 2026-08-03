import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const LOGO = 'https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png';

const navLinks = [
  { label: 'בית', href: '#hero' },
  { label: 'המשימה', href: '#mission' },
  { label: 'יעדים', href: '#goals' },
  { label: 'התוכניות שלנו', href: '#programs' },
  { label: 'הצוות', href: '#team' },
  { label: 'מפת הדרכים', href: '#roadmap' },
  { label: 'IEFA', href: '#transfer-hub' },
  { label: 'שאלות נפוצות', href: '/faq' },
  { label: 'צרו קשר', href: '#contact' },
];

// נאב-בר ציבורי — זכוכית שקופה בפתיחה (מעל HERO כהה), זכוכית בהירה בגלילה.
// שפה פרימיום: לוגו + קישורים עם קו-זהב-תחתון בריחוף, CTA כפתור זהב מלא בפיל.
export default function Navbar() {
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

  return (
    <nav role="navigation" aria-label="ניווט ראשי" dir="rtl"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'glass-light border-b border-black/5 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
        <button onClick={() => handleNav('#hero')} aria-label="חזרה לדף הבית" className="flex items-center gap-2.5 shrink-0">
          <img src={LOGO} alt="עילית ישראלית — לוגו" className="h-9 md:h-10 w-auto transition-all duration-300"
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

        <button onClick={() => handleNav('#contact')}
          className={`hidden md:inline-flex items-center text-[13px] font-bold px-4 h-9 rounded-full transition-all duration-200 ring-focus
            ${onDark ? 'bg-gold text-white hover:bg-gold-light shadow-lg shadow-gold/25' : 'bg-navy text-white hover:bg-navy-light'}`}>
          הצטרפו אלינו
        </button>

        <button className={`md:hidden ${onDark ? 'text-white' : 'text-slate-900'}`} onClick={() => setOpen(!open)}
          aria-label={open ? 'סגירת תפריט' : 'פתיחת תפריט'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {scrolled && <div className="nav-edge" />}

      {open && (
        <div className="md:hidden glass-light border-t border-black/5 px-5 py-4 space-y-1" dir="rtl">
          {navLinks.map(link => (
            <button key={link.label} onClick={() => handleNav(link.href)}
              className="block w-full text-right text-sm font-semibold text-slate-800 hover:text-gold py-2.5 transition-colors">
              {link.label}
            </button>
          ))}
          <button onClick={() => handleNav('#contact')}
            className="block w-full text-center text-sm font-bold bg-navy text-white py-3 rounded-full mt-3">
            הצטרפו אלינו
          </button>
        </div>
      )}
    </nav>
  );
}