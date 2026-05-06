export default function Footer() {
  return (
    <footer className="relative py-10 overflow-hidden" style={{ background: 'hsl(220, 35%, 4%)' }}>
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/user_699769932baa8921e5e16ee9/d4c51af10_OfficialLogo-noBG.png"
            alt="Elite C.I.C."
            className="h-10 w-auto"
          />
        </div>
        <div className="text-center">
          <p className="font-body text-xs text-cream/30">
            © 2024 Elite Israeli (C.I.C.) · All Rights Reserved
          </p>
          <p className="font-body text-xs text-gold/40 mt-1">
            שינוי · אמונה · רצון — Change · Belief · Will
          </p>
        </div>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <button key={link} className="font-body text-xs text-cream/30 hover:text-gold transition-colors uppercase tracking-wide">
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}