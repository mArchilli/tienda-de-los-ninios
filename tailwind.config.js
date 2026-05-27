import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(6px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out both',
            },
            colors: {
                  // ─── Paleta del panel admin ───────────────────────────────────────────
                // Modificar estos valores cambia los colores en todo el panel de una vez.
                //
                //   brand.bg            → fondo general de las páginas
                //   brand.primary       → color dominante (azul petróleo)
                //   brand.secondary     → color de apoyo (celeste grisáceo)
                //   brand.cta           → llamadas a la acción, botones de compra, ofertas
                //   brand.text          → texto principal y variantes
                // ─────────────────────────────────────────────────────────────────────
                brand: {
                    bg: 'rgb(var(--brand-bg) / <alpha-value>)',
                    card: 'rgb(var(--brand-card) / <alpha-value>)',

                    primary: {
                        DEFAULT: 'rgb(var(--brand-primary) / <alpha-value>)',
                        light: 'rgb(var(--brand-primary-light) / <alpha-value>)',
                        dark: 'rgb(var(--brand-primary-dark) / <alpha-value>)',
                        surface: 'rgb(var(--brand-primary-surface) / <alpha-value>)',
                    },

                    secondary: {
                        DEFAULT: 'rgb(var(--brand-secondary) / <alpha-value>)',
                        light: 'rgb(var(--brand-secondary-light) / <alpha-value>)',
                        dark: 'rgb(var(--brand-secondary-dark) / <alpha-value>)',
                        surface: 'rgb(var(--brand-secondary-surface) / <alpha-value>)',
                    },

                    cta: {
                        DEFAULT: 'rgb(var(--brand-cta) / <alpha-value>)',
                        dark: 'rgb(var(--brand-cta-dark) / <alpha-value>)',
                        surface: 'rgb(var(--brand-cta-surface) / <alpha-value>)',
                    },

                    text: {
                        DEFAULT: 'rgb(var(--brand-text) / <alpha-value>)',
                        muted: 'rgb(var(--brand-text-muted) / <alpha-value>)',
                        light: 'rgb(var(--brand-text-light) / <alpha-value>)',
                    },

                    footer: 'rgb(var(--brand-footer) / <alpha-value>)',
                },
            },
        },
    },

    plugins: [forms],
};
