/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens — values come from CSS variables set at runtime from
        // BRAND-CONFIG.md / Settings. Never hardcode brand hex outside there.
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-background)',
        ink: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        line: 'var(--color-border)',
        destructive: 'var(--color-destructive)',
      },
      fontFamily: {
        sans: 'var(--font-body)',
        mono: 'var(--font-numeric)',
      },
      boxShadow: {
        // Soft UI Evolution — độ sâu tinh tế, mềm hơn shadow phẳng mặc định
        soft: 'var(--shadow-soft)',
        'soft-md': 'var(--shadow-soft-md)',
        'soft-lg': 'var(--shadow-soft-lg)',
      },
      spacing: {
        // Density 8/10 — dense dashboard scale
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
      },
    },
  },
  plugins: [],
}
