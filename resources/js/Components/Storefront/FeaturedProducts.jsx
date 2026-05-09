// ─── FeaturedProducts ─────────────────────────────────────────────────────────
// "PRODUCTOS DESTACADOS" — grid de productos individuales destacados.
// Acepta `products` por prop; si no se pasan, renderiza placeholders.

const FALLBACK = [
    { id: 1, name: 'Buzo Frisa Nene',      price: 18900 },
    { id: 2, name: 'Remera Estampada',     price: 9500  },
    { id: 3, name: 'Jogger Algodón',       price: 14200 },
    { id: 4, name: 'Campera Liviana',      price: 24900 },
    { id: 5, name: 'Vestido Rosa',         price: 17500 },
    { id: 6, name: 'Set Body + Gorrito',   price: 12300 },
    { id: 7, name: 'Pantalón Cargo',       price: 16800 },
    { id: 8, name: 'Conjunto Verano',      price: 19900 },
];

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR');
}

function ProductCard({ product }) {
    return (
        <article className="group">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-primary-surface">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-brand-primary/30">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <button
                    type="button"
                    aria-label="Favorito"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-brand-text-muted hover:text-brand-cta transition-colors shadow"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
                    </svg>
                </button>
            </div>
            <div className="mt-3 px-1">
                <h3 className="text-sm font-semibold text-brand-text leading-tight truncate">{product.name}</h3>
                <p className="text-sm font-bold text-brand-cta mt-0.5">{fmt(product.price)}</p>
            </div>
        </article>
    );
}

export default function FeaturedProducts({ products }) {
    const items = products?.length ? products : FALLBACK;

    return (
        <section className="bg-brand-bg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-brand-text">
                        PRODUCTOS DESTACADOS
                    </h2>
                    <a href="#productos" className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark inline-flex items-center gap-1">
                        Ver todo
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                        </svg>
                    </a>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    {items.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        </section>
    );
}
