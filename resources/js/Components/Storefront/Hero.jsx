import { useCallback, useEffect, useRef, useState } from 'react';

// Cada slide muestra las imágenes del banner para desktop y mobile.
const BANNER_IMAGE = {
    desktop: '/images/banner.png',
    mobile: '/images/banner-mobile.png',
    alt: 'Combos para armar',
};

const BANNERS = [
    { id: 'banner-1', ...BANNER_IMAGE },
    {
        id: 'banner-2',
        desktop: '/images/banner-2-desktop.png',
        mobile: '/images/banner-2-mobile.png',
        alt: 'Combo de ropa para armar',
        content: 'build',
    },
    {
        id: 'banner-3',
        desktop: '/images/banner-3-desktop.png',
        mobile: '/images/banner-3-mobile.png',
        alt: 'Combo para regalar con bolsa y tarjeta',
        content: 'gift',
    },
];

const BANNER_CTAS = [
    { label: 'Ver combos', href: '/catalogo' },
    { label: 'Ver catálogo', href: '/catalogo?tipo=productos', variant: 'outline' },
];
const GIFT_CTAS = [
    { label: 'Ver combos', href: '/catalogo?tipo=combos' },
    { label: 'Ver catálogo', href: '/catalogo?tipo=productos', variant: 'outline' },
];
const GIFT_LETTER_COLORS = ['#E63954', '#D97916', '#B88900', '#46A343', '#148CC4', '#72B829', '#E56638'];

const CTA_BASE =
    'home-button pointer-events-auto inline-flex items-center justify-center font-bold uppercase tracking-wide shadow-md transition-colors';
const CTA_SIZE = {
    standard: 'px-5 py-2.5 text-base sm:px-8 sm:py-4 lg:px-11 lg:py-[1.35rem] lg:text-lg',
    largeMobile: 'px-5 py-3.5 text-[clamp(1rem,4.5vw,1.125rem)] sm:px-8 sm:py-4 md:text-base lg:px-11 lg:py-[1.35rem] lg:text-lg',
};
const CTA_SKIN = {
    primary: 'bg-brand-cta text-white hover:bg-brand-cta-dark',
    outline: 'bg-white/85 text-brand-cta ring-2 ring-inset ring-brand-cta hover:bg-brand-cta hover:text-white',
};

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 60;

function BannerButtons({ className = '', ctas = BANNER_CTAS, largeMobile = false }) {
    return (
        <div className={`pointer-events-none flex items-center gap-2 ${className}`}>
            {ctas.map((cta) => (
                <a
                    key={cta.href}
                    href={cta.href}
                    className={`${CTA_BASE} ${CTA_SIZE[largeMobile ? 'largeMobile' : 'standard']} ${CTA_SKIN[cta.variant === 'outline' ? 'outline' : 'primary']}`}
                >
                    {cta.label}
                </a>
            ))}
        </div>
    );
}

function BuildSlideContent() {
    return (
        <div className="pointer-events-none absolute inset-0 z-10">
            <div className="store-shell flex h-full flex-col items-start pt-[calc(3%+20px)] text-left md:justify-center md:pt-0">
                <div className="w-full translate-x-3 -translate-y-1 md:max-w-[55%] md:translate-x-16 md:-translate-y-8">
                    <h1 className="font-extrabold leading-[0.9]">
                        <span className="block text-[clamp(2.75rem,14.5vw,4.8rem)] text-[#536B4E] md:text-[clamp(4.4rem,6.3vw,7.6rem)]">
                            COMBOS
                        </span>
                        <span className="mt-1 block whitespace-nowrap text-[clamp(2.2rem,12.2vw,4rem)] text-brand-cta md:mt-2 md:text-[clamp(3.3rem,5.5vw,6.6rem)]">
                            PARA ARMAR.
                        </span>
                    </h1>
                    <p className="mt-2 text-[clamp(0.875rem,4vw,1rem)] leading-tight text-brand-text-muted md:mt-6 md:text-lg md:leading-relaxed lg:text-xl xl:text-2xl">
                        <span className="block">Hace tu pedido y te mostramos por video como quedó, y coordinamos el envío con vos.</span>
                    </p>
                    <BannerButtons largeMobile className="mt-2 sm:mt-4 md:mt-7 md:gap-3" />
                </div>
            </div>
        </div>
    );
}

function GiftSlideContent() {
    return (
        <div className="pointer-events-none absolute inset-0 z-10">
            <div className="store-shell flex h-full flex-col items-center pt-[calc(2%+40px)] text-center md:items-start md:justify-center md:pt-0 md:text-left">
                <div className="w-full md:ml-auto md:w-[45%] md:-translate-y-8">
                    <h1 aria-label="COMBOS PARA REGALAR" className="font-extrabold leading-[0.9] text-[#26354A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] md:drop-shadow-none">
                        <span className="block text-[clamp(2.5rem,13.5vw,4.5rem)] md:text-[clamp(4rem,5.8vw,7rem)]">
                            COMBOS
                        </span>
                        <span className="mt-1 block whitespace-nowrap text-[clamp(1.8rem,9.8vw,3.5rem)] md:mt-2 md:text-[clamp(3rem,4.5vw,5.6rem)]">
                            PARA{' '}
                            <span className="inline-block" aria-hidden="true">
                                {'REGALAR'.split('').map((letter, index) => (
                                    <span key={index} style={{ color: GIFT_LETTER_COLORS[index] }}>{letter}</span>
                                ))}
                            </span>
                        </span>
                    </h1>
                    <p className="mx-auto mt-2 max-w-xl text-[clamp(0.875rem,4vw,1rem)] leading-tight text-[#26354A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] md:mx-0 md:mt-6 md:text-lg md:leading-relaxed md:drop-shadow-none lg:text-xl xl:text-2xl">
                        Armá un combo para tu hijo, sobrino, nieto o alguien especial. Elegí las prendas y regalá algo único.
                    </p>
                    <BannerButtons ctas={GIFT_CTAS} largeMobile className="mt-2 justify-center sm:mt-4 md:mt-7 md:justify-start md:gap-3" />
                </div>
            </div>
        </div>
    );
}

function HeroSlide({ banner }) {
    return (
        <div className="relative h-full w-full overflow-hidden">
            <picture>
                <source media="(min-width: 768px)" srcSet={banner.desktop} />
                <img
                    src={banner.mobile}
                    alt={banner.alt}
                    className="absolute inset-0 h-full w-full object-cover object-center md:object-top"
                    draggable="false"
                />
            </picture>
            {banner.content === 'build' && <BuildSlideContent />}
            {banner.content === 'gift' && <GiftSlideContent />}
            {!banner.content && (
                <BannerButtons className="absolute inset-x-0 top-[39%] z-10 justify-center px-2 md:inset-x-auto md:left-[10%] md:top-[calc(75%+10px)] md:-translate-x-10 md:justify-start md:gap-3 md:px-0 xl:left-[12%] 2xl:left-[18%]" />
            )}
        </div>
    );
}

export default function Hero() {
    const slides = BANNERS;
    const count = slides.length;

    const [active, setActive] = useState(0);
    const [drag, setDrag] = useState(0);       // desplazamiento en px durante el swipe
    const [dragging, setDragging] = useState(false);
    const [paused, setPaused] = useState(false);

    const touch = useRef(null);
    const trackRef = useRef(null);

    const go = useCallback(
        (i) => setActive(((i % count) + count) % count),
        [count],
    );
    const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
    const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

    // Cambio automático de banner. Se reinicia en cada cambio (manual o auto) y se
    // frena mientras el usuario arrastra, pausa el carrusel o el sistema pide
    // reducir el movimiento.
    useEffect(() => {
        if (count <= 1 || dragging || paused) return undefined;
        if (typeof window !== 'undefined'
            && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            return undefined;
        }
        const t = window.setTimeout(next, AUTOPLAY_MS);
        return () => window.clearTimeout(t);
    }, [active, dragging, paused, count, next]);

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
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Banner anterior"
                        className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-brand-text shadow-md backdrop-blur-sm transition-colors hover:bg-white md:left-3 md:h-10 md:w-10"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Banner siguiente"
                        className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-brand-text shadow-md backdrop-blur-sm transition-colors hover:bg-white md:right-3 md:h-10 md:w-10"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Indicadores y control de reproducción */}
                    <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 md:bottom-6">
                        <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
                            {slides.map((banner, i) => (
                                <button
                                    key={banner.id}
                                    type="button"
                                    onClick={() => go(i)}
                                    aria-label={`Ir al banner ${i + 1}`}
                                    aria-current={i === active}
                                    className="group flex h-8 w-8 items-center justify-center"
                                >
                                    <span className={`h-2 rounded-full transition-all duration-300 ${
                                        i === active ? 'w-6 bg-brand-cta' : 'w-2 bg-white/70 group-hover:bg-white'
                                    }`} />
                                </button>
                            ))}
                            <span className="mx-1 h-5 w-px bg-white/50" aria-hidden="true" />
                            <button
                                type="button"
                                onClick={() => setPaused((value) => !value)}
                                aria-label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'}
                                title={paused ? 'Reanudar carrusel' : 'Pausar carrusel'}
                                aria-pressed={paused}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
                            >
                                {paused ? (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M8 5v14l11-7L8 5Z" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
