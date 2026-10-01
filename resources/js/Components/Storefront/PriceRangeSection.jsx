import { Link } from '@inertiajs/react';

const GIFT_COMBO = {
    href: '/catalogo?tipo=regalo',
    mobileImage: '/images/combo-emprendedor-mobile.png',
    image: '/images/combo-emprendedor.png',
};

const RAINBOW_COLORS = ['#E63954', '#D97916', '#B88900', '#46A343', '#148CC4', '#72B829'];

const STEPS = [
    {
        number: '01',
        icon: 'shirt',
        title: 'Elegí las prendas',
        body: 'Armá un combo a su medida, con la ropa que más te guste.',
    },
    {
        number: '02',
        icon: 'message',
        title: 'Dejá tu mensaje',
        body: 'Sumá una tarjeta con esas palabras que querés dedicarle.',
    },
    {
        number: '03',
        icon: 'bag',
        title: 'Listo para regalar',
        body: 'Recibí tu selección preparada para ese momento especial.',
    },
];

function RainbowTitle({ title }) {
    return title.split(/(REGALO)/i).map((part, index) => (
        /^REGALO$/i.test(part) ? (
            <span key={index} className="inline-block whitespace-nowrap" aria-hidden="true">
                {part.split('').map((letter, letterIndex) => (
                    <span key={letterIndex} style={{ color: RAINBOW_COLORS[letterIndex] }}>{letter}</span>
                ))}
            </span>
        ) : part
    ));
}

function StepIcon({ icon }) {
    const paths = {
        shirt: <path d="m8 3 4 2 4-2 4 3-2 4-2-1v11H8V9l-2 1-2-4 4-3Z" />,
        message: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="m7 18-1 3 5-3m-3-9h8m-8 4h5" /></>,
        bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3m-6 4c.5 1 1.5 2 3 2s2.5-1 3-2" /></>,
    };

    return (
        <svg className="h-5 w-5 text-[#c46a59]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[icon]}
        </svg>
    );
}

export default function PriceRangeSection({ title = 'COMBOS PARA REGALO' }) {
    return (
        <section id="combos-regalo" className="scroll-mt-28 bg-brand-bg">
            <div className="store-shell py-12 sm:py-16 lg:py-20">
                <div className="w-full">
                    <div className="grid items-center gap-10 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-10 lg:gap-16">
                        <div className="max-w-xl md:py-5">
                            <p className="mb-6 flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#b73630] sm:text-xs" aria-label={title}>
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 9h18v12H3zM2 6h20v3H2zM12 6v15M12 6C9 6 7 5 7 3.5 7 2.1 8 1.5 9.2 2c1.5.6 2.8 2.8 2.8 4Zm0 0c3 0 5-1 5-2.5 0-1.4-1-2-2.2-1.5C13.3 2.6 12 4.8 12 6Z" />
                                </svg>
                                <RainbowTitle title={title} />
                            </p>

                            <h2 className="text-[clamp(3rem,5.4vw,5.8rem)] font-extrabold leading-[0.94] tracking-[-0.045em] text-[#202020]">
                                <span className="block">Un regalo</span>
                                <span className="block">pensado para</span>
                                <span className="block text-[#e54b42]">alguien</span>
                                <span className="block text-[#e54b42]">especial.</span>
                            </h2>

                            <p className="mt-6 max-w-md text-base leading-relaxed text-[#574a43] sm:text-lg">
                                Vos elegís las prendas y las palabras.<br className="hidden sm:block" /> Nosotros lo preparamos para regalar.
                            </p>

                            <Link
                                href={GIFT_COMBO.href}
                                className="home-button mt-7 inline-flex min-h-12 items-center justify-center bg-[#e54b42] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(229,75,66,0.18)] transition-colors hover:bg-[#ca3e36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e54b42] sm:text-base"
                            >
                                Armar combo de regalo
                            </Link>
                            <p className="mt-4 text-xs text-[#806f65] sm:text-sm">Su ropa favorita. Tu toque personal.</p>
                        </div>

                        <div className="relative w-full pb-10 md:ml-auto md:w-[85%] md:max-w-[680px] md:pb-9">
                            <div className="aspect-square overflow-hidden rounded-[2.5rem] bg-[#f7e7d9] sm:rounded-[4rem]">
                                <picture>
                                    <source media="(max-width: 767px)" srcSet={GIFT_COMBO.mobileImage} />
                                    <img
                                        src={GIFT_COMBO.image}
                                        alt="Bolsa de regalo con tarjeta personalizada de La Tienda de los Niños"
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </picture>
                            </div>

                            <div className="absolute -right-2 top-3 flex h-[5.5rem] w-[5.5rem] rotate-12 flex-col items-center justify-center rounded-full bg-[#ffe184] text-center text-[10px] font-bold leading-tight text-[#523d2b] shadow-md sm:-right-4 sm:top-5 sm:h-28 sm:w-28 sm:text-xs">
                                Preparado<br />con cariño
                                <svg className="mt-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                                </svg>
                            </div>

                            <div className="absolute -bottom-1 left-2 w-[77%] max-w-[400px] -rotate-3 border border-[#e9ded3] bg-white px-4 py-3 shadow-[0_15px_28px_rgba(53,39,28,0.15)] sm:-bottom-3 sm:-left-4 sm:px-6 sm:py-5" aria-hidden="true">
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#ac6a55] sm:text-[10px]">Un mensaje que lo hace único</p>
                                <p className="mt-1 font-serif text-xl italic leading-tight text-[#26354a] sm:mt-2 sm:text-3xl">¡Feliz cumple, Mateo!</p>
                                <p className="mt-1 text-[10px] leading-snug text-[#64554c] sm:text-xs">Para seguir creciendo y jugando.<br />Con mucho amor, tía Vero.</p>
                                <div className="mt-2 flex justify-end gap-1" aria-hidden="true">
                                    {['#ef675d', '#efba4d', '#8fbf67', '#67b9d5'].map((color) => (
                                        <span key={color} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 overflow-hidden rounded-[1.5rem] bg-[#f8e8df] sm:mt-16">
                        <div className="grid sm:grid-cols-3">
                            {STEPS.map((step, index) => (
                                <div key={step.number} className={`px-6 py-6 sm:px-5 sm:py-7 lg:px-8 ${index > 0 ? 'border-t border-[#e9cfc2] sm:border-l sm:border-t-0' : ''}`}>
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="font-serif text-2xl italic text-[#b93f37]">{step.number}</span>
                                        <StepIcon icon={step.icon} />
                                    </div>
                                    <h3 className="text-base font-bold text-[#201d1c] lg:text-lg">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#604f47]">{step.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
