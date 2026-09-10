import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Banners del hero ─────────────────────────────────────────────────────────
// Cada banner necesita 2 imágenes: `desktop` (horizontal, se muestra desde md:)
// y `mobile` (vertical). Subí ambas a public/images/ y actualizá las rutas.
//
// `text` es opcional:
//   • con `text`  → se superpone el título + párrafo + botones sobre la imagen
//     (útil cuando la imagen es sólo un fondo).
//   • `text: null` → se muestra sólo la imagen y todo el banner enlaza a `href`
//     (útil cuando la imagen ya trae el texto y el botón «horneados»).
//
// `text.ctas` es la lista de botones. El primero va sólido; los que tengan
// `variant: 'outline'` van con borde. Podés poner uno o varios por banner.
//
// Hoy los tres banners usan la imagen actual. Reemplazá `desktop`/`mobile` (y
// opcionalmente `text`) de cada uno cuando tengas los nuevos.

const BANNER_IMAGE = {
    desktop: '/images/banner.png',
    mobile: '/images/banner-mobile.png',
    alt: 'Combos para armar',
    href: '/catalogo',
};

const BANNER_TEXT = {
    titleTop: 'COMBOS',
    titleBottom: 'PARA ARMAR.',
    paragraph: [
        'Elegí el combo diseñado para vos.',
        'Vos elegís las prendas, nosotros lo armamos.',
    ],
};

const BANNERS = [
    {
        id: 'banner-1',
        ...BANNER_IMAGE,
        text: {
            ...BANNER_TEXT,
            ctas: [
                { label: 'Ver combos', href: '/catalogo' },
                { label: 'Ver catálogo', href: '/catalogo?tipo=productos', variant: 'outline' },
            ],
        },
    },
    {
        id: 'banner-2',
        ...BANNER_IMAGE,
        text: { ...BANNER_TEXT, ctas: [{ label: 'Ver combos', href: '/catalogo' }] },
    },
    {
        id: 'banner-3',
        ...BANNER_IMAGE,
        text: { ...BANNER_TEXT, ctas: [{ label: 'Ver combos', href: '/catalogo' }] },
    },
];

// Estilos de los botones. El tamaño/padding cambia entre mobile y desktop; la
// «piel» (sólido u outline) según `variant`.
const CTA_BASE =
    'home-button inline-flex items-center justify-center px-7 py-3.5 text-sm font-bold uppercase tracking-wide shadow-md transition-colors sm:px-8 sm:py-4 sm:text-base';
const CTA_SIZE = {
    mobile: 'lg:px-10 lg:py-5 lg:text-base xl:px-12 xl:py-6 xl:text-lg',
    desktop: 'lg:px-11 lg:py-[1.35rem] lg:text-lg xl:px-[3.25rem] xl:py-[1.65rem] xl:text-xl',
};
const CTA_SKIN = {
    primary: 'bg-brand-cta text-white hover:bg-brand-cta-dark',
    outline: 'bg-white/85 text-brand-cta ring-2 ring-inset ring-brand-cta hover:bg-brand-cta hover:text-white',
};

function ctaClass(variant, ctx) {
    return `${CTA_BASE} ${CTA_SIZE[ctx]} ${CTA_SKIN[variant === 'outline' ? 'outline' : 'primary']}`;
}

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 60; // px mínimos para pasar de banner

// ─── Contenido superpuesto (título + párrafo + CTA) ───────────────────────────

function SlideText({ text }) {
    if (!text) return null;

    const lines = Array.isArray(text.paragraph) ? text.paragraph : [text.paragraph];
    const ctas = text.ctas ?? [];

    return (
        <>
            {/* Mobile: anclado abajo */}
            <div className="absolute inset-0 md:hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/8 via-transparent to-brand-bg/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/28 via-brand-primary/10 via-[38%] to-white/8" />

                <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5">
                    <div className="flex max-w-[352px] flex-col items-start text-left">
                        <h1 className="font-extrabold leading-[0.9] drop-shadow-[0_3px_12px_rgba(0,0,0,0.28)]">
                            <span className="block text-[4.1rem] text-brand-text">{text.titleTop}</span>
                            <span className="mt-1 block whitespace-nowrap text-[3.35rem] text-brand-cta">
                                {text.titleBottom}
                            </span>
                        </h1>

                        <p className="mt-3 max-w-[19rem] text-sm leading-relaxed text-brand-text-muted drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)]">
                            {lines.join(' ')}
                        </p>

                        {ctas.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {ctas.map((cta) => (
                                    <a key={cta.href} href={cta.href} className={ctaClass(cta.variant, 'mobile')}>
                                        {cta.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop: a la izquierda */}
            <div className="absolute inset-0 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/94 via-brand-bg/76 via-[40%] to-brand-bg/18" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 via-transparent to-white/12" />

                <div className="store-shell relative z-10 flex h-full flex-col pb-5 pt-2 sm:py-7 lg:py-8 xl:py-10">
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-start">
                        <div className="relative max-w-xl self-start pt-0 md:pt-2 lg:max-w-3xl lg:pt-4 xl:max-w-4xl xl:pt-6">
                            <h1 className="font-extrabold leading-[0.9] text-brand-text">
                                <span className="block text-[4rem] sm:text-[5rem] lg:text-[7.6rem] xl:text-[9.1rem]">
                                    {text.titleTop}
                                </span>
                                <span className="mt-1.5 block text-[3.2rem] text-brand-cta sm:text-[4.2rem] lg:text-[6.7rem] xl:text-[8rem]">
                                    {text.titleBottom}
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-text-muted sm:text-lg lg:text-xl xl:text-2xl">
                                {lines.map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i < lines.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>

                            {ctas.length > 0 && (
                                <div className="mt-6 flex flex-wrap gap-3 sm:mt-5 sm:gap-3.5 lg:mt-6">
                                    {ctas.map((cta) => (
                                        <a key={cta.href} href={cta.href} className={ctaClass(cta.variant, 'desktop')}>
                                            {cta.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative hidden h-full lg:block" />
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Un banner (imagen mobile + desktop + texto opcional) ──────────────────────

function HeroSlide({ banner }) {
    // <picture> => sólo se descarga la imagen del breakpoint actual (mobile o desktop).
    const media = (
        <picture>
            <source media="(min-width: 768px)" srcSet={banner.desktop} />
            <img
                src={banner.mobile}
                alt={banner.alt}
                className="absolute inset-0 h-full w-full object-cover object-center md:object-top"
                draggable="false"
            />
        </picture>
    );

    return (
        <div className="relative h-full w-full overflow-hidden">
            {banner.text ? (
                media
            ) : (
                <a href={banner.href ?? '/catalogo'} className="absolute inset-0 block" aria-label={banner.alt}>
                    {media}
                </a>
            )}
            <SlideText text={banner.text} />
        </div>
    );
}

// ─── Hero (carrusel) ──────────────────────────────────────────────────────────

export default function Hero() {
    const slides = BANNERS;
    const count = slides.length;

    const [active, setActive] = useState(0);
    const [drag, setDrag] = useState(0);       // desplazamiento en px durante el swipe
    const [dragging, setDragging] = useState(false);

    const touch = useRef(null);
    const trackRef = useRef(null);

    const go = useCallback(
        (i) => setActive(((i % count) + count) % count),
        [count],
    );
    const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
    const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

    // Cambio automático de banner. Se reinicia en cada cambio (manual o auto) y se
    // frena sólo mientras el usuario está arrastrando, o si el sistema pide
    // reducir el movimiento.
    useEffect(() => {
        if (count <= 1 || dragging) return undefined;
        if (typeof window !== 'undefined'
            && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            return undefined;
        }
        const t = window.setTimeout(next, AUTOPLAY_MS);
        return () => window.clearTimeout(t);
    }, [active, dragging, count, next]);

    // ─── Swipe táctil ─────────────────────────────────────────────────────────
    const onTouchStart = (e) => {
        const p = e.touches[0];
        touch.current = {
            x: p.clientX,
            y: p.clientY,
            dx: 0,
            axis: null,
            w: trackRef.current?.offsetWidth || window.innerWidth || 1,
        };
        setDragging(true);
    };

    const onTouchMove = (e) => {
        const t = touch.current;
        if (!t) return;
        const p = e.touches[0];
        const dx = p.clientX - t.x;
        const dy = p.clientY - t.y;

        if (t.axis === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
            t.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
        if (t.axis === 'x') {
            t.dx = dx;
            setDrag(dx);
        }
    };

    const onTouchEnd = () => {
        const t = touch.current;
        touch.current = null;
        setDrag(0);
        setDragging(false);
        if (!t || t.axis !== 'x') return;

        const threshold = Math.min(SWIPE_THRESHOLD, t.w * 0.18);
        if (t.dx <= -threshold) next();
        else if (t.dx >= threshold) prev();
    };

    return (
        <section
            className="relative isolate overflow-hidden bg-brand-bg aspect-[941/1672] md:aspect-auto md:min-h-[86vh] md:rounded-2xl lg:min-h-[700px] xl:min-h-[760px]"
            aria-roledescription="carrusel"
            aria-label="Banners destacados"
        >
            <div
                ref={trackRef}
                className="absolute inset-0 flex"
                style={{
                    transform: `translateX(calc(${-active * 100}% + ${drag}px))`,
                    transition: dragging ? 'none' : 'transform 500ms ease-out',
                    touchAction: 'pan-y',
                }}
                onTouchStart={count > 1 ? onTouchStart : undefined}
                onTouchMove={count > 1 ? onTouchMove : undefined}
                onTouchEnd={count > 1 ? onTouchEnd : undefined}
            >
                {slides.map((banner) => (
                    <div key={banner.id} className="relative h-full w-full shrink-0">
                        <HeroSlide banner={banner} />
                    </div>
                ))}
            </div>

            {count > 1 && (
                <>
                    {/* Flechas (desktop) */}
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Banner anterior"
                        className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-brand-text shadow-md backdrop-blur-sm transition-colors hover:bg-white md:flex"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Banner siguiente"
                        className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-brand-text shadow-md backdrop-blur-sm transition-colors hover:bg-white md:flex"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Puntos */}
                    <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 md:top-auto md:bottom-6">
                        <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
                            {slides.map((banner, i) => (
                                <button
                                    key={banner.id}
                                    type="button"
                                    onClick={() => go(i)}
                                    aria-label={`Ir al banner ${i + 1}`}
                                    aria-current={i === active}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        i === active ? 'w-6 bg-brand-cta' : 'w-2 bg-white/70 hover:bg-white'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
