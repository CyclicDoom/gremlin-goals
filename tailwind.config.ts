import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
        extend: {
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
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        },
                        gremlin: {
                                purple: 'hsl(var(--gremlin-purple))',
                                green: 'hsl(var(--gremlin-green))',
                                pink: 'hsl(var(--gremlin-pink))',
                                yellow: 'hsl(var(--gremlin-yellow))'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                fontFamily: {
                        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                        display: ['var(--font-fredoka)', 'var(--font-inter)', 'sans-serif'],
                },
                keyframes: {
                        'accordion-down': {
                                from: {
                                        height: '0'
                                },
                                to: {
                                        height: 'var(--radix-accordion-content-height)'
                                }
                        },
                        'accordion-up': {
                                from: {
                                        height: 'var(--radix-accordion-content-height)'
                                },
                                to: {
                                        height: '0'
                                }
                        },
                        'wiggle': {
                                '0%, 100%': { transform: 'rotate(0deg)' },
                                '25%': { transform: 'rotate(-3deg)' },
                                '75%': { transform: 'rotate(3deg)' }
                        },
                        'bounce-subtle': {
                                '0%, 100%': { transform: 'translateY(0)' },
                                '50%': { transform: 'translateY(-10px)' }
                        },
                        'pop': {
                                '0%': { transform: 'scale(0.8)', opacity: '0.5' },
                                '100%': { transform: 'scale(1)', opacity: '1' }
                        },
                        'slide-up': {
                                from: { opacity: '0', transform: 'translateY(20px)' },
                                to: { opacity: '1', transform: 'translateY(0)' }
                        },
                        'slide-in': {
                                from: { opacity: '0', transform: 'translateX(-20px)' },
                                to: { opacity: '1', transform: 'translateX(0)' }
                        },
                        'glow': {
                                from: {
                                        boxShadow: '0 0 10px hsla(var(--gremlin-purple), 0.3), 0 0 20px hsla(var(--gremlin-purple), 0.2)'
                                },
                                to: {
                                        boxShadow: '0 0 20px hsla(var(--gremlin-purple), 0.6), 0 0 40px hsla(var(--gremlin-purple), 0.4)'
                                }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'wiggle': 'wiggle 0.5s ease-in-out',
                        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
                        'pop': 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        'slide-in': 'slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        'glow': 'glow 2s ease-in-out infinite alternate'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
