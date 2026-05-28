

export default function Hero() {
    

    return (
        <section className="bg-brand-bg min-h-screen flex flex-col">
            <div className="home-media relative h-[350px] overflow-hidden md:hidden">
                <img
                    src="/images/banner-mobile.png"
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/12 via-transparent to-brand-bg/55" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/18 via-transparent to-white/10" />
            </div>
            <div className="home-panel relative flex-1 overflow-hidden flex flex-col">
                <div className="absolute inset-0 hidden md:flex items-center justify-center">
                    <img
                        src="/images/banner.png"
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover object-center"
                    />
                </div>
                <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-brand-bg/94 via-brand-bg/76 via-[40%] to-brand-bg/18" />
                <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-brand-primary/20 via-transparent to-white/12" />

                <div className="store-shell relative z-10 flex-1 flex flex-col py-6 sm:py-8 lg:py-10 xl:py-12">
                    <div className="grid flex-1 min-h-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-center">
                        <div className="relative max-w-xl lg:max-w-3xl xl:max-w-4xl">
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

                            <div className="mt-8 flex flex-wrap gap-3 sm:mt-6 sm:gap-3.5">
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
