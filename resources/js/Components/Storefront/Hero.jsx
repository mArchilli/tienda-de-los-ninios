
export default function Hero() {
    return (
        <section className="flex flex-col bg-brand-bg md:min-h-[86vh] lg:min-h-[700px] xl:min-h-[760px]">
            <div className="relative aspect-[941/1672] w-full overflow-hidden rounded-none md:hidden">
                <img
                    src="/images/banner-mobile.png"
                    alt=""
                    aria-hidden="true"
                    className="block h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/8 via-transparent to-brand-bg/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/28 via-brand-primary/10 via-[38%] to-white/8" />

                <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5">
                    <div className="flex max-w-[320px] flex-col items-start text-left">
                        <h1 className="font-extrabold leading-[0.9] drop-shadow-[0_3px_12px_rgba(0,0,0,0.28)]">
                            <span className="block text-[3.65rem] text-brand-text">COMBOS</span>
                            <span className="mt-1 block text-[3rem] text-brand-cta">
                                PARA ARMAR.
                            </span>
                        </h1>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <a
                                href="#combos"
                                className="home-button inline-flex items-center justify-center bg-brand-cta px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark sm:px-7 sm:py-3.5 sm:text-sm lg:px-10 lg:py-5 lg:text-base xl:px-12 xl:py-6 xl:text-lg"
                            >
                                Ver combos
                            </a>
                            <a
                                href="/catalogo"
                                className="home-button inline-flex items-center justify-center border border-brand-cta bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-brand-cta shadow-sm transition-colors hover:bg-brand-primary-surface sm:px-7 sm:py-3.5 sm:text-sm lg:px-10 lg:py-5 lg:text-base xl:px-12 xl:py-6 xl:text-lg"
                            >
                                Catalogo completo
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="home-panel relative hidden flex-1 flex-col overflow-hidden md:flex">
                <div className="absolute inset-0 hidden md:flex items-start justify-center">
                    <img
                        src="/images/banner.png"
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover object-[center_top]"
                    />
                </div>
                <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-brand-bg/94 via-brand-bg/76 via-[40%] to-brand-bg/18" />
                <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-brand-primary/20 via-transparent to-white/12" />

                <div className="store-shell relative z-10 flex flex-1 flex-col pb-5 pt-2 sm:py-7 lg:py-8 xl:py-10">
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-start">
                        <div className="relative hidden max-w-xl self-start pt-0 md:block md:pt-2 lg:max-w-3xl lg:pt-4 xl:max-w-4xl xl:pt-6">
                            <h1 className="font-extrabold leading-[0.9] text-brand-text">
                                <span className="block text-[3.65rem] sm:text-7xl lg:text-[7rem] xl:text-[8.5rem]">COMBOS</span>
                                <span className="mt-1.5 block text-[3rem] text-brand-cta sm:text-6xl lg:text-[6.2rem] xl:text-[7.5rem]">
                                    PARA ARMAR.
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-text-muted sm:text-lg lg:text-xl xl:text-2xl">
                                {'Elegí el combo diseñado para vos.'}
                                <br />
                                {'Vos elegís las prendas, nosotros lo armamos.'}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3 sm:mt-5 sm:gap-3.5 lg:mt-6">
                                <a
                                    href="#combos"
                                    className="home-button inline-flex items-center justify-center bg-brand-cta px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark sm:px-7 sm:py-3.5 sm:text-sm lg:px-10 lg:py-5 lg:text-base xl:px-12 xl:py-6 xl:text-lg"
                                >
                                    Ver combos
                                </a>
                                <a
                                    href="/catalogo"
                                    className="home-button inline-flex items-center justify-center border border-brand-cta bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-brand-cta shadow-sm transition-colors hover:bg-brand-primary-surface sm:px-7 sm:py-3.5 sm:text-sm lg:px-10 lg:py-5 lg:text-base xl:px-12 xl:py-6 xl:text-lg"
                                >
                                    Catalogo completo
                                </a>
                            </div>
                        </div>

                        <div className="relative hidden h-full lg:block" />
                    </div>
                </div>
            </div>
        </section>
    );
}
