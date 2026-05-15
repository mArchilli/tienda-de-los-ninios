const FALLBACK = [
    { id: 1, name: 'Buzo Frisa Nene', price: 18900 },
    { id: 2, name: 'Remera Estampada', price: 9500 },
    { id: 3, name: 'Jogger Algod\u00f3n', price: 14200 },
    { id: 4, name: 'Campera Liviana', price: 24900 },
    { id: 5, name: 'Vestido Rosa', price: 17500 },
    { id: 6, name: 'Set Body + Gorrito', price: 12300 },
    { id: 7, name: 'Pantal\u00f3n Cargo', price: 16800 },
    { id: 8, name: 'Conjunto Verano', price: 19900 },
];

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function ProductCard({ product }) {
    return (
        <article className="group">
            <div className="store-card p-3 transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_48px_rgba(61,90,128,0.12)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-brand-primary-surface">
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-brand-primary/30">
                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-text/12 via-transparent to-white/10" />

                    <button
                        type="button"
                        aria-label="Favorito"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/88 text-brand-text-muted shadow-sm backdrop-blur transition-colors hover:text-brand-cta"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
                        </svg>
                    </button>
                </div>

                <div className="px-1 pb-1 pt-4">
                    <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-brand-text">{product.name}</h3>
                    <p className="mt-2 inline-flex rounded-full bg-brand-cta-surface px-3 py-1 text-sm font-bold text-brand-cta shadow-sm">
                        {fmt(product.price)}
                    </p>
                </div>
            </div>
        </article>
    );
}

export default function FeaturedProducts({ products }) {
    const items = products?.length ? products : FALLBACK;

    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section-bottom">
                <div className="store-panel px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
                    <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-brand-primary/10 blur-3xl" />
                    <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-brand-secondary/20 blur-3xl" />

                    <div className="relative z-10 flex items-end justify-between gap-4">
                        <h2 className="text-xl font-extrabold tracking-[0.08em] text-brand-text sm:text-2xl lg:text-[1.9rem]">
                            PRODUCTOS DESTACADOS
                        </h2>
                        <a href="#productos" className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.14em] text-brand-primary hover:text-brand-primary-dark">
                            Ver todo
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                            </svg>
                        </a>
                    </div>

                    <div className="relative z-10 mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
