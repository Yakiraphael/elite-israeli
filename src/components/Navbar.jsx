import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'בית', href: '#hero' },
  { label: 'המשימה', href: '#mission' },
  { label: 'יעדים', href: '#goals' },
  { label: 'הצוות', href: '#team' },
  { label: 'מפת הדרכים', href: '#roadmap' },
  { label: 'צרו קשר', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-navy/95 backdrop-blur-md shadow-2xl border-b border-gold/10' : 'bg-transparent'}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => handleNav('#hero')} className="flex items-center gap-3">
          <img src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png" alt="Elite C.I.C." className="h-10 w-auto" />
        </button>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <li key={link.label}>
              <button
                onClick={() => handleNav(link.href)}
                className="font-body text-sm font-semibold text-cream/70 hover:text-gold transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleNav('#contact')}
          className="hidden md:block font-body text-sm font-bold bg-gold text-navy px-5 py-2 rounded-sm hover:bg-gold-light transition-colors duration-200 tracking-wider"
        >
          הצטרפו אלינו
        </button>

        {/* Mobile */}
        <button className="md:hidden text-gold" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-navy/98 backdrop-blur-md border-t border-gold/10 px-6 py-6 space-y-4" dir="rtl">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="block w-full text-right font-body text-base font-semibold text-cream/80 hover:text-gold transition-colors py-2"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNav('#contact')}
            className="block w-full text-center font-body text-sm font-bold bg-gold text-navy px-5 py-3 rounded-sm mt-4"
          >
            הצטרפו אלינו
          </button>
        </div>
      )}
    </nav>
  );
}