import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function glideUrl(src, w, h, fit = 'crop') {
    if (!src) return null;
    return `${src}?w=${w}&h=${h}&fit=${fit}`;
}

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

const MIN_PRICE = 100000;

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
);

const Icons = {
    search:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    close:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    check:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />,
    plus:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    pencil:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    star:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    gift:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
    image:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    rocket:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />,
};

const Icon = ({ name, className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {Icons[name]}
    </svg>
);

// ─── Modal base ───────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children, size = 'md' }) {
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

    const widthClass =
        size === '5xl' ? 'max-w-6xl' :
        size === '4xl' ? 'max-w-5xl' :
        size === '3xl' ? 'max-w-4xl' :
        size === '2xl' ? 'max-w-3xl' :
        size === 'xl'  ? 'max-w-2xl' :
        size === 'lg'  ? 'max-w-lg'  : 'max-w-md';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${widthClass} rounded-2xl bg-white shadow-xl flex flex-col max-h-[92vh]`}>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                    <h3 className="text-base font-bold text-brand-text">{title}</h3>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-brand-text-muted hover:bg-gray-100 hover:text-brand-text transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
            </div>
        </div>
    );
}

function FlashBanner({ message, onDismiss }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onDismiss, 3500);
        return () => clearTimeout(t);
    }, [message, onDismiss]);

    if (!message) return null;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {Icons.check}
            </svg>
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                <Icon name="close" />
            </button>
        </div>
    );
}

// ─── Gender multi-picker ─────────────────────────────────────────────────────

function GenderMultiPicker({ genders, selectedIds, onToggle }) {
    return (
        <div className="flex flex-wrap gap-2">
            {genders.map((g) => {
                const sel = selectedIds.includes(g.id);
                return (
                    <button
                        key={g.id}
                        type="button"
                        onClick={() => onToggle(g.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            sel
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-gray-200 bg-white text-brand-text-muted hover:border-brand-primary hover:text-brand-primary'
                        }`}
                    >
                        {sel && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {Icons.check}
                            </svg>
                        )}
                        {g.name}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Product card (curador) ───────────────────────────────────────────────────

function ProductSelectionCard({ product, selected, onToggle }) {
    const thumb = glideUrl(product.images?.[0], 200, 267);
    return (
        <div
            onClick={onToggle}
            className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all select-none ${
                selected
                    ? 'border-brand-primary shadow-md shadow-brand-primary/20'
                    : 'border-gray-200 hover:border-brand-primary/40'
            }`}
        >
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                {thumb ? (
                    <img src={thumb} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon name="image" className="h-8 w-8 text-gray-300" />
                    </div>
                )}
            </div>

            {selected && (
                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-brand-primary flex items-center justify-center shadow">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {Icons.check}
                    </svg>
                </div>
            )}

            <div className="p-2 bg-white">
                <p className="text-[11px] font-semibold text-brand-text leading-tight line-clamp-2">{product.name}</p>
                <p className="text-[11px] text-brand-cta font-bold mt-0.5">{fmt(product.price)}</p>
                {product.category_name && (
                    <p className="text-[9px] text-brand-text-light mt-0.5 truncate uppercase tracking-wide">
                        {product.category_name}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Productos curados agrupados por talle ────────────────────────────────────

function ProductsBySizePanel({ sizeGroups, selectedProductIds, onToggleProduct, categories = [] }) {
    const [search, setSearch] = useState('');
    const [categoryFilterIds, setCategoryFilterIds] = useState([]);

    const allProductIds = useMemo(() => {
        const ids = new Set();
        sizeGroups.forEach((g) => g.products.forEach((p) => ids.add(p.id)));
        return Array.from(ids);
    }, [sizeGroups]);

    // Sólo las categorías que efectivamente tienen prendas en el set actual.
    const availableCategories = useMemo(() => {
        const present = new Set();
        sizeGroups.forEach((g) => g.products.forEach((p) => {
            if (p.category_id) present.add(p.category_id);
        }));
        return categories.filter((c) => present.has(c.id));
    }, [sizeGroups, categories]);

    const toggleCategory = (id) => {
        setCategoryFilterIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const clearCategories = () => setCategoryFilterIds([]);

    const filteredGroups = useMemo(() => {
        const q = search.trim().toLowerCase();
        return sizeGroups
            .map((g) => ({
                ...g,
                products: g.products.filter((p) => {
                    if (q && !p.name.toLowerCase().includes(q)) return false;
                    if (categoryFilterIds.length > 0 && !categoryFilterIds.includes(p.category_id)) return false;
                    return true;
                }),
            }))
            .filter((g) => g.products.length > 0);
    }, [sizeGroups, search, categoryFilterIds]);

    const visibleProductIds = useMemo(() => {
        const ids = new Set();
        filteredGroups.forEach((g) => g.products.forEach((p) => ids.add(p.id)));
        return Array.from(ids);
    }, [filteredGroups]);

    const allVisibleSelected = visibleProductIds.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id));

    const toggleAllVisible = () => {
        if (allVisibleSelected) {
            // Quitar todos los visibles
            visibleProductIds.forEach((id) => {
                if (selectedProductIds.includes(id)) onToggleProduct(id);
            });
        } else {
            visibleProductIds.forEach((id) => {
                if (!selectedProductIds.includes(id)) onToggleProduct(id);
            });
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {Icons.search}
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar prenda..."
                        className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-brand-text placeholder-brand-text-light focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-text">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {Icons.close}
                            </svg>
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={toggleAllVisible}
                    disabled={visibleProductIds.length === 0}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        allVisibleSelected
                            ? 'border-red-300 text-red-500 hover:bg-red-50'
                            : 'border-brand-primary/40 text-brand-primary hover:bg-brand-primary-surface'
                    }`}
                >
                    {allVisibleSelected ? 'Deseleccionar visibles' : 'Seleccionar visibles'}
                </button>
            </div>

            {availableCategories.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">
                            Categorías {categoryFilterIds.length > 0 && (
                                <span className="ml-1 text-brand-primary normal-case tracking-normal font-semibold">
                                    ({categoryFilterIds.length} seleccionada{categoryFilterIds.length === 1 ? '' : 's'})
                                </span>
                            )}
                        </p>
                        {categoryFilterIds.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCategories}
                                className="text-[10px] font-semibold text-brand-text-muted hover:text-brand-cta transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={clearCategories}
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                                categoryFilterIds.length === 0
                                    ? 'border-brand-primary bg-brand-primary text-white'
                                    : 'border-gray-200 bg-white text-brand-text-muted hover:border-brand-primary hover:text-brand-primary'
                            }`}
                        >
                            Todas
                        </button>
                        {availableCategories.map((cat) => {
                            const sel = categoryFilterIds.includes(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                                        sel
                                            ? 'border-brand-primary bg-brand-primary text-white'
                                            : 'border-gray-200 bg-white text-brand-text-muted hover:border-brand-primary hover:text-brand-primary'
                                    }`}
                                >
                                    {sel && (
                                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            {Icons.check}
                                        </svg>
                                    )}
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-brand-text-muted border-y border-gray-100 py-2">
                <span>
                    {selectedProductIds.length} de {allProductIds.length} prendas curadas
                </span>
                <span className="text-brand-text-light">
                    {visibleProductIds.length} visible{visibleProductIds.length === 1 ? '' : 's'}
                </span>
            </div>

            {filteredGroups.length === 0 ? (
                <p className="text-xs text-brand-text-muted italic text-center py-6">
                    Sin prendas que coincidan con los filtros.
                </p>
            ) : (
                <div className="max-h-[480px] overflow-y-auto pr-1 space-y-5">
                    {filteredGroups.map((group) => {
                        const groupSelected = group.products.filter((p) => selectedProductIds.includes(p.id)).length;
                        return (
                            <div key={group.id}>
                                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-100 sticky top-0 bg-white z-[1]">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="inline-flex h-5 items-center justify-center rounded-full bg-brand-primary px-2 text-[10px] font-bold text-white">
                                            Talle {group.name.trim()}
                                        </span>
                                        <span className="text-[11px] text-brand-text-muted">
                                            {group.products.length} prenda{group.products.length === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                    {groupSelected > 0 && (
                                        <span className="text-[10px] font-semibold text-brand-cta">
                                            {groupSelected} curada{groupSelected === 1 ? '' : 's'}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {group.products.map((product) => (
                                        <ProductSelectionCard
                                            key={`${group.id}-${product.id}`}
                                            product={product}
                                            selected={selectedProductIds.includes(product.id)}
                                            onToggle={() => onToggleProduct(product.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Image upload zone ────────────────────────────────────────────────────────

function ImageZone({ preview, onChange, onRemove }) {
    const inputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) onChange(file);
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (file) onChange(file);
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !preview && inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-colors ${
                preview ? 'border-brand-primary/40 cursor-default' : 'border-gray-300 hover:border-brand-primary cursor-pointer'
            } bg-brand-bg/40`}
        >
            {preview ? (
                <div className="relative flex items-center justify-center p-3">
                    <img src={preview} alt="" className="max-h-40 rounded-lg object-contain" />
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white shadow"
                    >
                        <Icon name="close" className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Icon name="image" className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-xs text-brand-text-muted">Hacer click para subir imagen</p>
                    <p className="text-[10px] text-brand-text-light mt-1">JPG, PNG, WEBP — máx. 5MB</p>
                </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </div>
    );
}

// ─── Combo form modal ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
    name: '',
    description: '',
    price: '',
    max_items: 50,
    is_active: true,
    is_featured: false,
};

function ComboEmprendedorFormModal({ open, onClose, genders, categories = [], combo = null }) {
    const isEdit = combo !== null;

    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const [selectedGenderIds, setSelectedGenderIds] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [sizeGroups, setSizeGroups] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [categoryLimitsMap, setCategoryLimitsMap] = useState({});
    const fetchRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        if (isEdit && combo) {
            setForm({
                name:        combo.name,
                description: combo.description ?? '',
                price:       combo.price,
                max_items:   combo.max_items ?? 50,
                is_active:   combo.is_active,
                is_featured: combo.is_featured,
            });
            setImagePreview(combo.image ? '/' + combo.image : null);
            setSelectedGenderIds((combo.genders ?? []).map((g) => g.id));
            setSelectedProductIds((combo.items ?? []).map((i) => i.product_id));
            setSelectedCategoryIds((combo.category_limits ?? []).map((cl) => cl.category_id));
            const limitsObj = {};
            (combo.category_limits ?? []).forEach((cl) => {
                limitsObj[cl.category_id] = cl.max_items;
            });
            setCategoryLimitsMap(limitsObj);
        } else {
            setForm(EMPTY_FORM);
            setImageFile(null);
            setImagePreview(null);
            setSelectedGenderIds([]);
            setSelectedCategoryIds([]);
            setSelectedProductIds([]);
            setSizeGroups([]);
            setCategoryLimitsMap({});
        }
        setErrors({});
    }, [open, combo]);

    useEffect(() => {
        if (!open) return;
        if (selectedGenderIds.length === 0) {
            setSizeGroups([]);
            return;
        }

        if (fetchRef.current) fetchRef.current.abort?.();
        setProductsLoading(true);

        const controller = new AbortController();
        fetchRef.current = controller;

        axios.get(route('admin.combos-emprendedor.products-for-genders'), {
            params: { genders: selectedGenderIds },
            signal: controller.signal,
        })
        .then((res) => {
            setSizeGroups(res.data);
            // Limpiar selecciones que ya no son válidas
            const validIds = new Set();
            res.data.forEach((g) => g.products.forEach((p) => validIds.add(p.id)));
            setSelectedProductIds((prev) => prev.filter((id) => validIds.has(id)));
        })
        .catch(() => {})
        .finally(() => setProductsLoading(false));
    }, [selectedGenderIds]);

    const toggleGender = (id) => {
        setSelectedGenderIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleProduct = (id) => {
        setSelectedProductIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleCategory = (id) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Categorías disponibles según las prendas que el AJAX trajo para los géneros elegidos.
    const availableCategoriesForGenders = useMemo(() => {
        const presentIds = new Set();
        sizeGroups.forEach((g) => g.products.forEach((p) => {
            if (p.category_id != null) presentIds.add(p.category_id);
        }));
        return categories.filter((c) => presentIds.has(c.id));
    }, [sizeGroups, categories]);

    // Sólo mostramos al admin las prendas cuya categoría principal está en selectedCategoryIds.
    const visibleSizeGroups = useMemo(() => {
        if (selectedCategoryIds.length === 0) return [];
        return sizeGroups
            .map((g) => ({
                ...g,
                products: g.products.filter((p) => selectedCategoryIds.includes(p.category_id)),
            }))
            .filter((g) => g.products.length > 0);
    }, [sizeGroups, selectedCategoryIds]);

    // Si se quita una categoría, también deseleccionamos productos que ya no aplican.
    const visibleProductIdsKey = useMemo(() => {
        const ids = [];
        visibleSizeGroups.forEach((g) => g.products.forEach((p) => ids.push(p.id)));
        return ids.sort((a, b) => a - b).join(',');
    }, [visibleSizeGroups]);

    useEffect(() => {
        const visibleIds = new Set(visibleProductIdsKey ? visibleProductIdsKey.split(',').map(Number) : []);
        setSelectedProductIds((prev) => prev.filter((id) => visibleIds.has(id)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleProductIdsKey]);

    // Sincronizar el mapa de límites con las categorías elegidas.
    const selectedCategoryIdsKey = useMemo(
        () => [...selectedCategoryIds].sort((a, b) => a - b).join(','),
        [selectedCategoryIds]
    );

    useEffect(() => {
        setCategoryLimitsMap((prev) => {
            const next = {};
            selectedCategoryIds.forEach((catId) => {
                next[catId] = prev[catId] ?? 0;
            });
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryIdsKey]);

    // Rows ordenadas para la sección de máximos.
    const selectedCategoryRows = useMemo(() => {
        const byId = new Map(categories.map((c) => [c.id, c]));
        return selectedCategoryIds
            .map((id) => ({ id, name: byId.get(id)?.name ?? `#${id}` }))
            .sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }, [selectedCategoryIds, categories]);

    const sumLimits = useMemo(
        () => Object.values(categoryLimitsMap).reduce((s, v) => s + (Number(v) || 0), 0),
        [categoryLimitsMap]
    );

    const maxItemsNum = Number(form.max_items) || 0;
    const limitsSumOk = sumLimits === maxItemsNum && selectedCategoryIds.length > 0;

    const handleImage = (file) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => { setImageFile(null); setImagePreview(null); };

    const handleClose = () => {
        if (!processing) onClose();
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.append('name',        form.name);
        fd.append('description', form.description ?? '');
        fd.append('price',       form.price);
        fd.append('max_items',   form.max_items);
        fd.append('is_active',   form.is_active  ? '1' : '0');
        fd.append('is_featured', form.is_featured ? '1' : '0');

        if (imageFile) fd.append('image', imageFile);

        selectedGenderIds.forEach((id) => fd.append('genders[]', id));
        selectedProductIds.forEach((id) => fd.append('product_ids[]', id));

        Object.entries(categoryLimitsMap).forEach(([catId, max], idx) => {
            fd.append(`category_limits[${idx}][category_id]`, catId);
            fd.append(`category_limits[${idx}][max_items]`, String(max ?? 0));
        });

        return fd;
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const fd = buildFormData();
        const routeName = isEdit
            ? route('admin.combos-emprendedor.update', combo.id)
            : route('admin.combos-emprendedor.store');

        router.post(routeName, fd, {
            onSuccess: () => { handleClose(); },
            onError:   (errs) => { setErrors(errs); setProcessing(false); },
            onFinish:  () => setProcessing(false),
        });
    };

    const inputCls = (err) =>
        `w-full rounded-xl border px-4 py-2.5 text-sm text-brand-text outline-none transition focus:ring-2 ${
            err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
        }`;

    const priceNum = Number(form.price);
    const priceLow = !!form.price && priceNum < MIN_PRICE;

    return (
        <Modal open={open} onClose={handleClose} title={isEdit ? 'Editar Combo Emprendedor' : 'Crear Combo Emprendedor'} size="4xl">
            <form onSubmit={submit} className="space-y-6">

                {/* Datos del combo */}
                <div className="rounded-xl border border-gray-200 bg-brand-bg/40 p-4 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">Datos del combo</p>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">
                            Nombre <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Ej: Combo Emprendedor Verano"
                            className={inputCls(errors.name)}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">
                            Descripción <span className="text-brand-text-light text-xs">(Opcional)</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            rows={3}
                            placeholder="Describí este combo emprendedor..."
                            className={inputCls(false) + ' resize-none'}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1.5">
                                Precio <span className="text-red-400">*</span>
                                <span className="ml-2 text-[11px] font-normal text-brand-text-light">(Mínimo $100.000)</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm font-medium">$</span>
                                <input
                                    type="number"
                                    min={MIN_PRICE}
                                    step="0.01"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                    placeholder="100000"
                                    className={inputCls(errors.price || priceLow).replace('px-4', 'pl-8 pr-4')}
                                />
                            </div>
                            {(errors.price || priceLow) && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.price ?? 'El precio mínimo es de $100.000.'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1.5">
                                Máximo de prendas <span className="text-red-400">*</span>
                                <span className="ml-2 text-[11px] font-normal text-brand-text-light">(1 - 50)</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={form.max_items}
                                onChange={(e) => setForm((f) => ({ ...f, max_items: e.target.value }))}
                                className={inputCls(errors.max_items)}
                            />
                            {errors.max_items && <p className="mt-1 text-xs text-red-500">{errors.max_items}</p>}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <div
                                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                                className={`relative h-5 w-9 rounded-full transition-colors ${form.is_active ? 'bg-brand-primary' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </div>
                            <span className="text-sm text-brand-text">Combo activo</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <div
                                onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
                                className={`relative h-5 w-9 rounded-full transition-colors ${form.is_featured ? 'bg-brand-cta' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </div>
                            <span className="text-sm text-brand-text flex items-center gap-1.5">
                                <svg className="h-3.5 w-3.5 text-brand-cta" viewBox="0 0 24 24" stroke="currentColor" fill="currentColor">
                                    {Icons.star}
                                </svg>
                                Destacar en la tienda
                            </span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">
                            Imagen de portada <span className="text-brand-text-light text-xs">(Opcional)</span>
                        </label>
                        <ImageZone preview={imagePreview} onChange={handleImage} onRemove={removeImage} />
                    </div>
                </div>

                {/* Géneros */}
                <div className="rounded-xl border border-gray-200 bg-brand-bg/40 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">
                                Géneros del combo <span className="text-red-400">*</span>
                            </p>
                            <p className="text-xs text-brand-text-light mt-0.5">
                                Podés mezclar Nene y Nena, o Bebé y Beba. Filtra las prendas disponibles.
                            </p>
                        </div>
                        {selectedGenderIds.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-surface px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {Icons.check}
                                </svg>
                                {selectedGenderIds.length} seleccionado{selectedGenderIds.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <GenderMultiPicker
                        genders={genders}
                        selectedIds={selectedGenderIds}
                        onToggle={toggleGender}
                    />
                    {errors.genders && <p className="text-xs text-red-500">{errors.genders}</p>}
                </div>

                {/* Categorías del combo */}
                {selectedGenderIds.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-brand-bg/40 p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">
                                    Categorías del combo <span className="text-red-400">*</span>
                                </p>
                                <p className="text-xs text-brand-text-light mt-0.5">
                                    Elegí qué categorías va a tener el combo. Solo vas a poder curar prendas de estas categorías.
                                </p>
                            </div>
                            {selectedCategoryIds.length > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-surface px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {Icons.check}
                                    </svg>
                                    {selectedCategoryIds.length} seleccionada{selectedCategoryIds.length === 1 ? '' : 's'}
                                </span>
                            )}
                        </div>

                        {productsLoading ? (
                            <div className="flex items-center gap-2 py-2 text-sm text-brand-text-muted">
                                <Spinner /> Cargando categorías disponibles...
                            </div>
                        ) : availableCategoriesForGenders.length === 0 ? (
                            <p className="text-xs text-brand-text-muted italic">
                                No hay categorías con prendas en stock para los géneros seleccionados.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {availableCategoriesForGenders.map((cat) => {
                                    const sel = selectedCategoryIds.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                sel
                                                    ? 'border-brand-primary bg-brand-primary text-white'
                                                    : 'border-gray-200 bg-white text-brand-text-muted hover:border-brand-primary hover:text-brand-primary'
                                            }`}
                                        >
                                            {sel && (
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    {Icons.check}
                                                </svg>
                                            )}
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Curaduría de productos por talle */}
                {selectedGenderIds.length > 0 && selectedCategoryIds.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-brand-bg/40 p-4 space-y-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">
                                Prendas curadas <span className="text-red-400">*</span>
                            </p>
                            <p className="text-xs text-brand-text-light mt-0.5">
                                Elegí qué prendas estarán disponibles, filtradas por las categorías elegidas.
                            </p>
                        </div>

                        {productsLoading ? (
                            <div className="flex items-center gap-2 py-3 text-sm text-brand-text-muted">
                                <Spinner /> Cargando prendas...
                            </div>
                        ) : visibleSizeGroups.length === 0 ? (
                            <p className="text-xs text-brand-text-muted italic">
                                No hay prendas en stock para los géneros y categorías seleccionados.
                            </p>
                        ) : (
                            <ProductsBySizePanel
                                sizeGroups={visibleSizeGroups}
                                selectedProductIds={selectedProductIds}
                                onToggleProduct={toggleProduct}
                                categories={categories}
                            />
                        )}
                        {errors.product_ids && <p className="text-xs text-red-500">{errors.product_ids}</p>}
                    </div>
                )}

                {/* Máximos por categoría */}
                {selectedCategoryIds.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-brand-bg/40 p-4 space-y-3">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">
                                    Máximo de prendas por categoría <span className="text-red-400">*</span>
                                </p>
                                <p className="text-xs text-brand-text-light mt-0.5">
                                    Cuántas prendas puede elegir el cliente de cada categoría. La suma debe ser igual al máximo total del combo.
                                </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                sumLimits === maxItemsNum
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700'
                            }`}>
                                Suma {sumLimits} / {maxItemsNum}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedCategoryRows.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                    <span className="text-sm font-semibold text-brand-text truncate">{cat.name}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        max={maxItemsNum}
                                        value={categoryLimitsMap[cat.id] ?? 0}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            const val = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                                            setCategoryLimitsMap((prev) => ({ ...prev, [cat.id]: val }));
                                        }}
                                        className="w-20 rounded-lg border border-gray-200 px-2 py-1 text-sm text-brand-text text-right outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                    />
                                </div>
                            ))}
                        </div>
                        {errors.category_limits && <p className="text-xs text-red-500">{errors.category_limits}</p>}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={processing}
                        className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={
                            processing
                            || priceLow
                            || selectedGenderIds.length === 0
                            || selectedCategoryIds.length === 0
                            || selectedProductIds.length === 0
                            || !limitsSumOk
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-cta px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {processing ? <Spinner /> : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {Icons.check}
                            </svg>
                        )}
                        {isEdit ? 'Guardar cambios' : 'Guardar combo'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({ open, onClose, combo }) {
    const [processing, setProcessing] = useState(false);

    const submit = () => {
        setProcessing(true);
        router.delete(route('admin.combos-emprendedor.destroy', combo.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Eliminar Combo Emprendedor">
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                    <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-700">¿Eliminar &quot;{combo?.name}&quot;?</p>
                        <p className="text-xs text-red-500 mt-1">Esta acción no se puede deshacer.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={submit} disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors disabled:opacity-60">
                        {processing ? <Spinner /> : <Icon name="trash" />}
                        Eliminar
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Combo card ───────────────────────────────────────────────────────────────

function ComboCard({ combo, onEdit, onDelete }) {
    const imgSrc = combo.image ? glideUrl('/' + combo.image, 400, 533) : null;
    const itemCount = combo.items?.length ?? 0;

    return (
        <div className="group bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-200 hover:shadow-md hover:border-brand-primary/30 transition-all">
            <div className="relative aspect-[3/4] bg-gray-50">
                {imgSrc ? (
                    <img src={imgSrc} alt={combo.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-text-light">
                        <svg className="h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {Icons.rocket}
                        </svg>
                    </div>
                )}

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow ${combo.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                        {combo.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-text px-2.5 py-0.5 text-[10px] font-bold text-white shadow uppercase tracking-wide">
                        Emprendedor
                    </span>
                </div>

                {combo.is_featured && (
                    <div className="absolute top-2 right-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cta shadow">
                            <svg className="h-3.5 w-3.5 fill-white text-white" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                {Icons.star}
                            </svg>
                        </span>
                    </div>
                )}

                <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-brand-cta shadow-sm">
                        {fmt(combo.price)}
                    </span>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-brand-text text-sm leading-tight line-clamp-2">{combo.name}</h3>

                    {combo.genders?.length > 0 && (
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-cta">
                            {combo.genders.map((g) => g.name).join(' · ')}
                        </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-medium">
                        <span className="rounded-full bg-brand-primary-surface px-2 py-0.5 text-brand-primary">
                            Hasta {combo.max_items} prendas
                        </span>
                        <span className="rounded-full bg-brand-secondary-surface px-2 py-0.5 text-brand-primary-dark">
                            {itemCount} prenda{itemCount !== 1 ? 's' : ''} curada{itemCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onEdit(combo)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-primary py-2 text-xs font-semibold text-white hover:bg-brand-primary-dark transition-colors"
                    >
                        <Icon name="pencil" className="h-3.5 w-3.5" />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(combo)}
                        title="Eliminar"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-brand-text-muted hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index({ combos, genders = [], categories = [], filters }) {
    const { flash } = usePage().props;

    const [flashMsg, setFlashMsg]         = useState(flash?.success ?? null);
    const [createOpen, setCreateOpen]     = useState(false);
    const [editTarget, setEditTarget]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [search, setSearch]             = useState(filters?.search ?? '');
    const [activeGender, setActiveGender] = useState(filters?.gender ?? '');
    const searchTimeout = useRef(null);

    useEffect(() => {
        if (flash?.success) setFlashMsg(flash.success);
    }, [flash]);

    const applyFilters = useCallback((newSearch, newGender) => {
        const params = {};
        if (newSearch) params.search = newSearch;
        if (newGender) params.gender = newGender;
        router.get(route('admin.combos-emprendedor.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        const currentGender = activeGender;
        searchTimeout.current = setTimeout(() => applyFilters(value, currentGender), 400);
    };

    const handleGenderToggle = (id) => {
        const next = activeGender === String(id) ? '' : String(id);
        setActiveGender(next);
        applyFilters(search, next);
    };

    const resetFilters = () => {
        setSearch('');
        setActiveGender('');
        router.get(route('admin.combos-emprendedor.index'), {}, { replace: true });
    };

    const hasFilters = search || activeGender;
    const total = combos.total ?? combos.data?.length ?? 0;

    // Combo data preparation for edit modal
    const editComboShape = editTarget ? {
        ...editTarget,
        // items: ya viene normalizado por el backend con relations
    } : null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Combos Emprendedor</h1>
                        <p className="text-sm text-brand-text-muted mt-0.5">
                            {total} combo{total !== 1 ? 's' : ''} {hasFilters ? 'encontrado' : 'registrado'}{total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                    >
                        <Icon name="plus" />
                        Nuevo Combo Emprendedor
                    </button>
                </div>
            }
        >
            <Head title="Combos Emprendedor" />

            <div className="p-6 space-y-5">
                <FlashBanner message={flashMsg} onDismiss={() => setFlashMsg(null)} />

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {Icons.search}
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Buscar combo por nombre..."
                            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm text-brand-text placeholder-brand-text-light outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-text transition-colors"
                            >
                                <Icon name="close" />
                            </button>
                        )}
                    </div>

                    {genders?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-brand-text-muted">Filtrar por género</p>
                            <div className="flex flex-wrap gap-2">
                                {genders.map((g) => {
                                    const active = activeGender === String(g.id);
                                    return (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => handleGenderToggle(g.id)}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                active
                                                    ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                                                    : 'border-gray-200 bg-white text-brand-text-muted hover:border-brand-primary hover:text-brand-primary'
                                            }`}
                                        >
                                            {active && (
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    {Icons.check}
                                                </svg>
                                            )}
                                            {g.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {hasFilters && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="text-xs text-brand-text-muted">
                                {total} resultado{total !== 1 ? 's' : ''}
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                {(combos.data?.length ?? 0) === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-surface text-brand-primary mb-4">
                            <Icon name="rocket" className="h-8 w-8" />
                        </span>
                        {hasFilters ? (
                            <>
                                <p className="text-lg font-semibold text-brand-text">No se encontraron combos</p>
                                <p className="text-sm mt-1">Intentá cambiar los filtros de búsqueda</p>
                                <button
                                    onClick={resetFilters}
                                    className="mt-4 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
                                >
                                    Limpiar filtros
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-lg font-semibold text-brand-text">No hay combos emprendedor</p>
                                <p className="text-sm mt-1">Creá el primero para que aparezca en el catálogo</p>
                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                                >
                                    <Icon name="plus" />
                                    Nuevo Combo Emprendedor
                                </button>
                            </>
                        )}
                    </div>
                )}

                {(combos.data?.length ?? 0) > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cta-surface text-brand-cta">
                                <Icon name="rocket" />
                            </span>
                            <div className="flex-1">
                                <h2 className="text-base font-bold text-brand-text">Combos Emprendedor</h2>
                                <p className="text-xs text-brand-text-muted">
                                    {combos.data.length} combo{combos.data.length !== 1 ? 's' : ''} en esta página
                                </p>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {combos.data.map((combo) => (
                                    <ComboCard
                                        key={combo.id}
                                        combo={combo}
                                        onEdit={setEditTarget}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                            </div>
                        </div>

                        {combos.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 px-5 py-4">
                                {combos.links?.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`min-w-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-brand-primary text-white shadow-sm'
                                                : link.url
                                                ? 'bg-white text-brand-text hover:bg-brand-primary-surface border border-gray-200'
                                                : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ComboEmprendedorFormModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                genders={genders}
                categories={categories}
            />
            <ComboEmprendedorFormModal
                open={editTarget !== null}
                onClose={() => setEditTarget(null)}
                genders={genders}
                categories={categories}
                combo={editComboShape}
            />
            <DeleteModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                combo={deleteTarget}
            />
        </AuthenticatedLayout>
    );
}
