/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			navy: 'hsl(var(--navy))',
  			'navy-light': 'hsl(var(--navy-light))',
  			gold: 'hsl(var(--gold))',
  			'gold-light': 'hsl(var(--gold-light))',
  			'gold-dark': 'hsl(var(--gold-dark))',
  			cream: 'hsl(var(--cream))',
  			action: {
  				DEFAULT: 'hsl(var(--action))',
  				light: 'hsl(var(--action-light))',
  				foreground: 'hsl(var(--action-foreground))'
  			},
  			'alert-error': { DEFAULT: 'hsl(var(--alert-error))', bg: 'hsl(var(--alert-error-bg))' },
  			'alert-warning': { DEFAULT: 'hsl(var(--alert-warning))', bg: 'hsl(var(--alert-warning-bg))' },
  			'alert-success': { DEFAULT: 'hsl(var(--alert-success))', bg: 'hsl(var(--alert-success-bg))' },
  			surface: { DEFAULT: 'var(--surface)', alt: 'var(--surface-alt)' },
  			panel: { DEFAULT: 'var(--panel)', alt: 'var(--panel-alt)' },
  			ink: { DEFAULT: 'var(--ink)', muted: 'var(--ink-muted)', faint: 'var(--ink-faint)' },
  			hairline: { DEFAULT: 'var(--hairline)', strong: 'var(--hairline-strong)' },
  			brand: { DEFAULT: 'var(--brand)', ink: 'var(--brand-ink)', soft: 'var(--brand-soft)', line: 'var(--brand-line)' },
  			live: { DEFAULT: 'var(--live)', soft: 'var(--live-soft)', line: 'var(--live-line)' },
  			pending: { DEFAULT: 'var(--pending)', soft: 'var(--pending-soft)', line: 'var(--pending-line)' },
  			disputed: { DEFAULT: 'var(--disputed)', soft: 'var(--disputed-soft)', line: 'var(--disputed-line)' },
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Assistant', 'sans-serif'],
      },
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
