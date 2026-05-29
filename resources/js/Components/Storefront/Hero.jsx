

export default function Hero() {
    return (
        <section className="flex min-h-[86vh] flex-col bg-brand-bg lg:min-h-[700px] xl:min-h-[760px]">
            <div className="home-media relative h-[305px] overflow-hidden md:hidden">
                <img
                    src="/images/banner-mobile.png"
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-[center_top]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/12 via-transparent to-brand-bg/55" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/18 via-transparent to-white/10" />
            </div>
            <div className="home-panel relative flex flex-1 flex-col overflow-hidden">
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

                <div className="store-shell relative z-10 flex flex-1 flex-col py-5 sm:py-7 lg:py-8 xl:py-10">
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-start">
                        <div className="relative max-w-xl self-start pt-1 sm:pt-2 lg:max-w-3xl lg:pt-4 xl:max-w-4xl xl:pt-6">
                            <h1 className="font-extrabold leading-[0.9] text-brand-text">
                                <span className="block text-[3.65rem] sm:text-7xl lg:text-[7rem] xl:text-[8.5rem]">COMBOS</span>
                                <span className="mt-1.5 block text-[3rem] text-brand-cta sm:text-6xl lg:text-[6.2rem] xl:text-[7.5rem]">
                                    PARA ARMAR.
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-text-muted sm:text-lg lg:text-xl xl:text-2xl">
                                Elegi el combo diseñado para vos.
                                <br />
                                Vos elegís las prendas, nosotros lo armamos.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3 sm:mt-5 sm:gap-3.5 lg:mt-6">
                                <a
                                    href="#combos"
                                    className="home-button inline-flex items-center justify-center bg-brand-cta px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark sm:px-7 sm:py-3.5 sm:text-sm lg:px-10 lg:py-5 lg:text-base xl:px-12 xl:py-6 xl:text-lg"
                                >
                                    Ver combos
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
