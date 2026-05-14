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
                    '0%':   { opacity: '0', transform: 'translateY(6px)' },
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
                    bg: '#FAF8F5',            // fondo blanco roto / crema suave

                    primary: {
                        DEFAULT: '#3D5A80',   // azul petróleo suave
                        light:   '#5271A0',   // hover / íconos activos
                        dark:    '#2C4260',   // active / pressed
                        surface: '#EBF0F7',   // fondo tint muy suave (tarjetas, badges)
                    },

                    secondary: {
                        DEFAULT: '#98C1D9',   // celeste grisáceo
                        light:   '#B5D5E8',
                        dark:    '#7AAEC8',
                        surface: '#EBF5FB',   // fondo tint muy suave
                    },

                    cta: {
                        DEFAULT: '#EE6C4D',   // coral suave — botones de compra y ofertas
                        dark:    '#E8552E',   // hover
                        surface: '#FDF2EE',   // fondo tint muy suave
                    },

                    text: {
                        DEFAULT: '#293241',   // gris oscuro principal
                        muted:   '#6B7A8F',   // texto secundario / etiquetas
                        light:   '#9BA8B8',   // placeholder / deshabilitado
                    },
                },
            },
        },
    },

    plugins: [forms],
};
