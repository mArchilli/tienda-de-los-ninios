import { useEffect, useState } from 'react';

const SearchIcon = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CloseIcon = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FilterIcon = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
    </svg>
);

function Pill({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                    ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                    : 'border-gray-200 bg-white text-brand-text-muted hover:border-brand-primary hover:text-brand-primary'
            }`}
        >
            {active && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )}
            {label}
        </button>
    );
}

// Pills con buscador: muestra sólo algunas y el resto aparece al buscar o con «Ver N más».
// La opción seleccionada siempre queda visible aunque no esté entre las primeras.
function SearchablePills({ items, selectedId, onSelect, placeholder, initialCount = 8 }) {
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(false);

    const needle = query.trim().toLowerCase();
    const isFiltering = needle !== '';
    const filtered = items.filter((item) => item.name.toLowerCase().includes(needle));

    let shown = filtered;
    if (!isFiltering && !expanded) {
        shown = filtered.slice(0, initialCount);
        const selected = filtered.find((item) => String(item.id) === String(selectedId));
        if (selected && !shown.includes(selected)) shown = [...shown, selected];
    }
    const hiddenCount = filtered.length - shown.length;

    return (
        <div className="space-y-2">
            <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-text-light" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-8 text-xs text-brand-text placeholder-brand-text-light outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-light transition-colors hover:text-brand-text"
                    >
                        <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            <div className="flex min-h-[28px] flex-wrap gap-2">
                {shown.map((item) => (
                    <Pill
                        key={item.id}
                        label={item.name}
                        active={String(item.id) === String(selectedId)}
                        onClick={() => onSelect(item.id)}
                    />
                ))}
                {shown.length === 0 && (
                    <p className="py-1 text-xs italic text-brand-text-muted">Sin resultados para &quot;{query}&quot;</p>
                )}
            </div>

            {!isFiltering && filtered.length > initialCount && (
                <button
                    type="button"
                    onClick={() => setExpanded((x) => !x)}
                    className="text-xs font-medium text-brand-primary transition-colors hover:text-brand-primary-dark"
                >
                    {expanded ? 'Mostrar menos' : `Ver ${hiddenCount} más`}
                </button>
            )}
        </div>
    );
}

function Panel({ label, children }) {
    return (
        <div className="space-y-2.5 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-text-muted">{label}</p>
            {children}
        </div>
    );
}

function FilterContent({
    search,
    onSearch,
    categories,
    activeCategory,
    onCategory,
    genders,
    activeGender,
    onGender,
    hasFilters,
    onReset,
    showHeader = true,
}) {
    return (
        <div className="space-y-3">
            {showHeader && (
                <div className="flex items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-text">
                        <FilterIcon className="h-4 w-4 text-brand-primary" />
                        Filtros
                    </div>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="text-xs font-semibold text-brand-text-muted transition-colors hover:text-red-500"
                        >
                            Eliminar todos
                        </button>
                    )}
                </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-light" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Buscar combo por nombre..."
                        className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-8 text-sm text-brand-text placeholder-brand-text-light outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-light transition-colors hover:text-brand-text"
                        >
                            <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {genders.length > 0 && (
                <Panel label="Género">
                    <div className="flex flex-wrap gap-2">
                        {genders.map((gender) => (
                            <Pill
                                key={gender.id}
                                label={gender.name}
                                active={String(gender.id) === String(activeGender)}
                                onClick={() => onGender(gender.id)}
                            />
                        ))}
                    </div>
                </Panel>
            )}

            {categories.length > 0 && (
                <Panel label="Categoría">
                    <SearchablePills
                        items={categories}
                        selectedId={activeCategory}
                        onSelect={onCategory}
                        placeholder="Buscar categoría..."
                    />
                </Panel>
            )}
        </div>
    );
}

function MobileFilterModal({ open, onClose, total, ...filterProps }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="text-base font-bold text-brand-text">Filtros</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-gray-100 hover:text-brand-text"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <FilterContent {...filterProps} showHeader={false} />
                </div>
                <div className="flex shrink-0 gap-3 border-t border-gray-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={filterProps.onReset}
                        disabled={!filterProps.hasFilters}
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-brand-text-muted transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Eliminar todos
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-brand-cta px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-cta-dark"
                    >
                        Ver {total} resultado{total !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Panel lateral (escritorio) + botón flotante con modal (celular), igual que en Prendas.
export default function ComboFilters({ hideFloating = false, total = 0, ...filterProps }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const activeCount = [filterProps.search, filterProps.activeCategory, filterProps.activeGender]
        .filter((value) => value !== '' && value != null).length;

    return (
        <>
            <aside className="hidden w-72 shrink-0 border-l border-gray-200 bg-brand-bg lg:block">
                <div className="sticky top-0 max-h-screen overflow-y-auto p-4">
                    <FilterContent {...filterProps} />
                </div>
            </aside>

            {!hideFloating && (
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition-colors hover:bg-brand-primary-dark lg:hidden"
                >
                    <FilterIcon className="h-5 w-5" />
                    Filtros
                    {activeCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-brand-primary">
                            {activeCount}
                        </span>
                    )}
                </button>
            )}

            <MobileFilterModal
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                total={total}
                {...filterProps}
            />
        </>
    );
}
