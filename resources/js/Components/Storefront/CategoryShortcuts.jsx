import { Link } from '@inertiajs/react';

const CATEGORIES = [
    { label: 'NENE',   href: '/catalogo?audiencia=nino', image: '/images/filtro-nene.png'   },
    { label: 'NENA',   href: '/catalogo?audiencia=nina', image: '/images/filtro-nena.png'   },
    { label: 'BEBE',   href: '/catalogo?audiencia=bebe', image: '/images/filtro-bebe.png'   },
    { label: 'BEBA',   href: '/catalogo?audiencia=beba', image: '/images/filtro-beba.png'   },
    { label: 'COMBOS', href: '/catalogo?tipo=combos',    image: '/images/filtro-combos.png' },
];

function CircleSlot({ label, image }) {
    return (
        <div className="flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <img
                src={image}
                alt={`Filtro ${label.toLowerCase()}`}
                className="h-16 w-16 object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            />
        </div>
    );
}

export default function CategoryShortcuts() {
    return (
        <section className="relative overflow-hidden bg-brand-bg">
            

            <div className="store-shell store-section-bottom relative z-10">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)] lg:gap-8 xl:gap-10">
                    <div className="px-2 py-2 sm:px-0">
                        <h2 className="home-section-title">
                            ROPA QUE LES ENCANTA
                        </h2>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {CATEGORIES.map((category) => (
                                <Link
                                    key={category.label}
                                    href={category.href}
                                    className={`group relative flex flex-col items-center rounded-[1.3rem] border border-brand-cta/40 px-3 py-4 transition duration-300 hover:-translate-y-1 hover:border-brand-cta ${
                                        category.label === 'COMBOS'
                                            ? 'col-span-2 mx-auto w-full sm:col-span-1 sm:mx-0'
                                            : ''
                                    }`}
                                >
                                    <div className="relative">
                                        <CircleSlot label={category.label} image={category.image} />
                                    </div>
                                    <span className="relative mt-3 text-center text-[11px] font-bold leading-tight tracking-[0.14em] text-brand-text transition-colors group-hover:text-brand-primary sm:text-xs sm:tracking-[0.18em]">
                                        {category.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <aside className="home-panel relative min-h-[260px] overflow-hidden border border-brand-secondary/45 shadow-[0_20px_44px_rgba(31,31,31,0.08)] lg:min-h-[320px]">
                        <img
                            src="/images/banner-filtros.png"
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/88 via-brand-primary/70 to-brand-primary/28" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/8" />

                        <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7 lg:p-8">
                            <div className="max-w-[66%]">
                                <h3 className="text-xl font-extrabold leading-tight text-brand-text sm:text-2xl lg:text-[1.95rem]">
                                    {'CALIDAD, DISE\u00d1O Y COMODIDAD'}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-brand-text/80">
                                    {'Prendas pensadas para acompa\u00f1ar cada aventura de todos los d\u00edas.'}
                                </p>
                                <a
                                    href="#about"
                                    className="home-button mt-5 inline-flex items-center gap-1.5 bg-brand-cta px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:bg-brand-cta-dark"
                                >
                                    {'Conoc\u00e9 m\u00e1s'}
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
