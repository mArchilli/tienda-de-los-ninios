import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

// ─── Catálogo ─────────────────────────────────────────────────────────────────
// Listado completo de combos + prendas. Diseño limpio: grilla compacta de
// imágenes con nombre y precio debajo. Combos llevan tag "COMBO" para diferenciar.

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR');
}

function ProductCard({ item }) {
    const inner = (
        <>
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-primary-surface">
                        <svg className="h-12 w-12 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {item.is_featured && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold tracking-[0.2em] text-brand-text bg-white/0">
                        NEW IN
                    </span>
                )}

                {item.type === 'combo' && (
                    <span className="absolute top-3 right-3 text-[11px] font-extrabold tracking-wider text-brand-cta">
                        COMBO
                    </span>
                )}
            </div>

            <div className="mt-2 px-1">
                <h3 className="text-[13px] font-medium text-brand-text leading-tight truncate">
                    {item.name}
                </h3>
                <p className="text-[13px] font-bold text-brand-text mt-0.5">
                    {fmt(item.price)}
                </p>
            </div>
        </>
    );

    const href = item.type === 'combo' ? `/combo/${item.id}` : `/producto/${item.id}`;
    return (
        <Link href={href} className="group block">
            {inner}
        </Link>
    );
}

const SORTERS = {
    relevancia: (a, b) => Number(b.is_featured) - Number(a.is_featured),
    'precio-asc':  (a, b) => Number(a.price) - Number(b.price),
    'precio-desc': (a, b) => Number(b.price) - Number(a.price),
    nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
};

const SORT_LABELS = {
    relevancia:    'Relevancia',
    'precio-asc':  'Precio: menor a mayor',
    'precio-desc': 'Precio: mayor a menor',
    nombre:        'Nombre (A → Z)',
};

export default function Catalog({ combos = [], products = [], cartCount }) {
    const [sort, setSort] = useState('relevancia');
    const [sortOpen, setSortOpen] = useState(false);

    const items = useMemo(() => {
        const merged = [
            ...combos.map((c) => ({ ...c, type: 'combo' })),
            ...products.map((p) => ({ ...p, type: 'product' })),
        ];
        return merged.sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [combos, products, sort]);

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title="Catálogo · Mimos" />

            {/* Banner colección */}
            <section className="bg-brand-text text-white">
                <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-3 text-center text-sm sm:text-base tracking-[0.2em] uppercase font-light">
                    Nueva colección <span className="mx-2 text-white/40">|</span>
                    <span className="font-semibold">otoño / invierno 2026</span>
                </div>
            </section>

            {/* Toolbar: orden + filtros */}
            <section className="bg-brand-bg border-b border-brand-secondary/20">
                <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-end gap-6 h-12 text-[11px] uppercase tracking-[0.18em] text-brand-text-muted">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setSortOpen((v) => !v)}
                                className="inline-flex items-center gap-2 hover:text-brand-text transition-colors"
                            >
                                Ordenar por:
                                <span className="text-brand-text font-semibold">{SORT_LABELS[sort]}</span>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {sortOpen && (
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-brand-secondary/30 shadow-lg z-20">
                                    {Object.entries(SORT_LABELS).map(([key, label]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { setSort(key); setSortOpen(false); }}
                                            className={`block w-full text-left px-4 py-2 text-xs normal-case tracking-normal hover:bg-brand-primary-surface ${
                                                key === sort ? 'text-brand-primary font-semibold' : 'text-brand-text'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="button" className="inline-flex items-center gap-2 text-brand-text font-semibold hover:text-brand-primary transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M6 12h12M10 19h4" />
                            </svg>
                            Filtros
                        </button>
                    </div>
                </div>
            </section>

            {/* Grid de productos */}
            <section className="bg-brand-bg">
                <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                    {items.length === 0 ? (
                        <div className="py-24 text-center text-brand-text-muted">
                            <p className="text-sm">No hay prendas ni combos disponibles por el momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                            {items.map((item) => (
                                <ProductCard key={`${item.type}-${item.id}`} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </StorefrontLayout>
    );
}
