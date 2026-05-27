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
};

const Icon = ({ name, className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {Icons[name]}
    </svg>
);

// ─── Size grouping ─────────────────────────────────────────────────────────────

const SIZE_GROUPS = ['Bebé', 'Niño/a', 'Otros'];

function categorizeSizeName(name) {
    const l = name.toLowerCase();
    if (l.includes('bebe') || l.includes('bebé')) return 'Bebé';
    if (l.includes('niño') || l.includes('niña') || l.includes('nino') || l.includes('nina')) return 'Niño/a';
    return 'Otros';
}

function groupSizes(sizes) {
    return SIZE_GROUPS.reduce((acc, g) => {
        const items = sizes.filter((s) => categorizeSizeName(s.name) === g);
        if (items.length) acc[g] = items;
        return acc;
    }, {});
}

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

// ─── Flash banner ─────────────────────────────────────────────────────────────

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

// ─── Size toggle picker ───────────────────────────────────────────────────────

function SizeTogglePicker({ sizes, selectedSizeIds, onToggle }) {
    const groups = groupSizes(sizes);

    return (
        <div className="space-y-3">
            {SIZE_GROUPS.filter((g) => groups[g]).map((group) => (
                <div key={group} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="inline-block h-0.5 w-5 rounded-full bg-brand-primary" />
                        {group}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {groups[group].map((s) => {
                            const sel = selectedSizeIds.includes(s.id);
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => onToggle(s.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
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
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Category pills ───────────────────────────────────────────────────────────

function CategoryPills({ categories, selectedIds, onToggle }) {
    const [query, setQuery] = useState('');

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-2">
            <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {Icons.search}
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar categoría..."
                    className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs text-brand-text placeholder-brand-text-light focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                />
                {query && (
                    <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-text">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {Icons.close}
                        </svg>
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[28px]">
                {filtered.map((cat) => {
                    const sel = selectedIds.includes(cat.id);
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onToggle(cat.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
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
                {filtered.length === 0 && (
                    <p className="text-xs text-brand-text-muted italic py-1">Sin resultados para &quot;{query}&quot;</p>
                )}
            </div>
        </div>
    );
}

// ─── Product selection card ───────────────────────────────────────────────────

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
            </div>
        </div>
    );
}

// ─── Category panel ───────────────────────────────────────────────────────────

function CategoryPanel({ category, settings, onChange, onRemove, sizes = [], selectedSizeIds = [] }) {
    const [productSearch, setProductSearch] = useState('');

    const quantity = settings?.quantity ?? 1;
    const selectedProductIds = settings?.selectedProductIds ?? [];

    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return category.products ?? [];
        const q = productSearch.toLowerCase();
        return (category.products ?? []).filter((p) => p.name.toLowerCase().includes(q));
    }, [category.products, productSearch]);

    // Productos agrupados por talle. Un producto puede aparecer en varios grupos
    // si está disponible en múltiples talles seleccionados del combo.
    const groupedBySize = useMemo(() => {
        const sizeMap = new Map(sizes.map((s) => [s.id, s]));
        return selectedSizeIds
            .map((sid) => {
                const size = sizeMap.get(sid);
                if (!size) return null;
                const items = filteredProducts.filter((p) => (p.size_ids ?? []).includes(sid));
                return { size, items };
            })
            .filter((g) => g && g.items.length > 0);
    }, [filteredProducts, selectedSizeIds, sizes]);

    const allIds = (category.products ?? []).map((p) => p.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedProductIds.includes(id));

    const toggleSelectAll = () => {
        if (allSelected) {
            onChange({ quantity, selectedProductIds: [] });
        } else {
            onChange({ quantity, selectedProductIds: allIds });
        }
    };

    const toggleProduct = (id) => {
        const next = selectedProductIds.includes(id)
            ? selectedProductIds.filter((x) => x !== id)
            : [...selectedProductIds, id];
        onChange({ quantity, selectedProductIds: next });
    };

    const setQuantity = (q) => onChange({ quantity: q, selectedProductIds });

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-brand-primary-surface border-b border-gray-100">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brand-primary truncate">{category.name}</p>
                    <p className="text-xs text-brand-text-muted">Seleccioná prendas disponibles para esta categoría</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={toggleSelectAll}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                            allSelected
                                ? 'border-red-300 text-red-500 hover:bg-red-50'
                                : 'border-brand-primary/40 text-brand-primary hover:bg-white'
                        }`}
                    >
                        {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Quitar categoría"
                        className="text-brand-text-muted hover:text-red-500 flex items-center transition-colors"
                    >
                        <Icon name="close" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-brand-text-muted font-medium">Cantidad por combo</span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((q) => (
                            <button
                                key={q}
                                type="button"
                                onClick={() => setQuantity(q)}
                                className={`h-7 w-7 rounded-full text-xs font-bold transition-colors ${
                                    quantity === q
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-gray-100 text-brand-text-muted hover:bg-brand-primary-surface hover:text-brand-primary'
                                }`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-brand-text-light">
                        {selectedProductIds.length} seleccionada{selectedProductIds.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {Icons.search}
                    </svg>
                    <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar prenda..."
                        className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-brand-text placeholder-brand-text-light focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                    />
                    {productSearch && (
                        <button type="button" onClick={() => setProductSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-text">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {Icons.close}
                            </svg>
                        </button>
                    )}
                </div>

                {filteredProducts.length === 0 ? (
                    <p className="text-xs text-brand-text-muted italic text-center py-4">Sin prendas{productSearch ? ` para "${productSearch}"` : ''}</p>
                ) : groupedBySize.length === 0 ? (
                    <p className="text-xs text-brand-text-muted italic text-center py-4">Sin prendas para los talles seleccionados</p>
                ) : (
                    <div className="max-h-80 overflow-y-auto pr-1 space-y-4">
                        {groupedBySize.map(({ size, items }) => {
                            const pickedInGroup = items.filter((p) => selectedProductIds.includes(p.id)).length;
                            return (
                                <div key={size.id}>
                                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-100 sticky top-0 bg-white z-[1]">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="inline-flex h-5 items-center justify-center rounded-full bg-brand-primary px-2 text-[10px] font-bold text-white">
                                                Talle {size.name.trim()}
                                            </span>
                                            <span className="text-[11px] text-brand-text-muted">
                                                {items.length} prenda{items.length === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        {pickedInGroup > 0 && (
                                            <span className="text-[10px] font-semibold text-brand-cta">
                                                {pickedInGroup} seleccionada{pickedInGroup === 1 ? '' : 's'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {items.map((product) => (
                                            <ProductSelectionCard
                                                key={`${size.id}-${product.id}`}
                                                product={product}
                                                selected={selectedProductIds.includes(product.id)}
                                                onToggle={() => toggleProduct(product.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
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

const EMPTY_FORM = { name: '', description: '', price: '', is_active: true, is_featured: false };

function ComboFormModal({ open, onClose, sizes, combo = null }) {
    const isEdit = combo !== null;

    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const [selectedSizeIds, setSelectedSizeIds] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [categorySettings, setCategorySettings] = useState({});
    const fetchRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        if (isEdit && combo) {
            setForm({
                name:        combo.name,
                description: combo.description ?? '',
                price:       combo.price,
                is_active:   combo.is_active,
                is_featured: combo.is_featured,
            });
            setImagePreview(combo.image ? '/' + combo.image : null);
            const sizeIds = combo.sizes.map((s) => s.id);
            setSelectedSizeIds(sizeIds);

            const catIds = [];
            const settings = {};
            for (const item of combo.items ?? []) {
                const catId = item.category_id;
                if (!catIds.includes(catId)) catIds.push(catId);
                if (!settings[catId]) settings[catId] = { quantity: item.quantity, selectedProductIds: [] };
                settings[catId].selectedProductIds.push(item.product_id);
            }
            setSelectedCategoryIds(catIds);
            setCategorySettings(settings);
        } else {
            setForm(EMPTY_FORM);
            setImageFile(null);
            setImagePreview(null);
            setSelectedSizeIds([]);
            setAvailableCategories([]);
            setSelectedCategoryIds([]);
            setCategorySettings({});
        }
        setErrors({});
    }, [open, combo]);

    useEffect(() => {
        if (!open) return;
        if (selectedSizeIds.length === 0) {
            setAvailableCategories([]);
            setSelectedCategoryIds([]);
            setCategorySettings({});
            return;
        }

        if (fetchRef.current) fetchRef.current.cancel?.();
        setCategoriesLoading(true);

        const controller = new AbortController();
        fetchRef.current = controller;

        axios.get(route('admin.combos.categories-for-sizes'), {
            params: { sizes: selectedSizeIds },
            signal: controller.signal,
        })
        .then((res) => {
            const cats = res.data;
            setAvailableCategories(cats);
            const validIds = cats.map((c) => c.id);
            setSelectedCategoryIds((prev) => prev.filter((id) => validIds.includes(id)));
            setCategorySettings((prev) => {
                const next = {};
                for (const id of Object.keys(prev)) {
                    if (validIds.includes(Number(id))) next[id] = prev[id];
                }
                return next;
            });
        })
        .catch(() => {})
        .finally(() => setCategoriesLoading(false));
    }, [selectedSizeIds, open]);

    const toggleSize = (id) => {
        setSelectedSizeIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleCategory = (id) => {
        setSelectedCategoryIds((prev) => {
            if (prev.includes(id)) {
                setCategorySettings((s) => { const n = { ...s }; delete n[id]; return n; });
                return prev.filter((x) => x !== id);
            }
            if (!categorySettings[id]) {
                const cat = availableCategories.find((c) => c.id === id);
                const allIds = (cat?.products ?? []).map((p) => p.id);
                setCategorySettings((s) => ({ ...s, [id]: { quantity: 1, selectedProductIds: allIds } }));
            }
            return [...prev, id];
        });
    };

    const updateCategorySettings = (catId, settings) => {
        setCategorySettings((prev) => ({ ...prev, [catId]: settings }));
    };

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
        fd.append('is_active',   form.is_active  ? '1' : '0');
        fd.append('is_featured', form.is_featured ? '1' : '0');

        if (imageFile) fd.append('image', imageFile);

        selectedSizeIds.forEach((id) => fd.append('sizes[]', id));

        const activeCats = selectedCategoryIds
            .map((catId) => ({ catId, settings: categorySettings[catId] }))
            .filter(({ settings }) => settings);

        activeCats.forEach(({ catId, settings }, i) => {
            fd.append(`categories[${i}][category_id]`, catId);
            fd.append(`categories[${i}][quantity]`,    settings.quantity);
            (settings.selectedProductIds ?? []).forEach((pid, j) => {
                fd.append(`categories[${i}][product_ids][${j}]`, pid);
            });
        });

        return fd;
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const fd = buildFormData();
        const routeName = isEdit ? route('admin.combos.update', combo.id) : route('admin.combos.store');

        router.post(routeName, fd, {
            onSuccess: () => { handleClose(); },
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    const selectedCategories = availableCategories.filter((c) => selectedCategoryIds.includes(c.id));

    const uncoveredSizes = useMemo(() => {
        if (selectedSizeIds.length === 0 || selectedCategoryIds.length === 0) return [];

        const coverageByCategory = {};
        for (const catId of selectedCategoryIds) {
            const cat = availableCategories.find((c) => c.id === catId);
            const picked = categorySettings[catId]?.selectedProductIds ?? [];
            const covered = new Set();
            for (const p of cat?.products ?? []) {
                if (picked.includes(p.id)) {
                    for (const sid of p.size_ids ?? []) covered.add(sid);
                }
            }
            coverageByCategory[catId] = covered;
        }

        return selectedSizeIds
            .map((sid) => {
                const size = sizes.find((s) => s.id === sid);
                const missing = selectedCategoryIds
                    .filter((catId) => !coverageByCategory[catId].has(sid))
                    .map((catId) => availableCategories.find((c) => c.id === catId)?.name)
                    .filter(Boolean);
                return missing.length ? { id: sid, name: size?.name ?? `#${sid}`, missing } : null;
            })
            .filter(Boolean);
    }, [selectedSizeIds, selectedCategoryIds, availableCategories, categorySettings, sizes]);

    const hasUncovered = uncoveredSizes.length > 0;

    const inputCls = (err) =>
        `w-full rounded-xl border px-4 py-2.5 text-sm text-brand-text outline-none transition focus:ring-2 ${
            err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
        }`;

    return (
        <Modal open={open} onClose={handleClose} title={isEdit ? 'Editar Combo' : 'Crear Nuevo Combo'} size="4xl">
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
                            placeholder="Ej: Combo Verano Bebé"
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
                            placeholder="Describí qué incluye este combo..."
                            className={inputCls(false) + ' resize-none'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text mb-1.5">
                            Precio <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm font-medium">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                placeholder="0"
                                className={inputCls(errors.price).replace('px-4', 'pl-8 pr-4')}
                            />
                        </div>
                        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
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

                {/* Talles */}
                <div className="rounded-xl border border-gray-200 bg-brand-bg/40 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">
                                Talles disponibles
                            </p>
                            <p className="text-xs text-brand-text-light mt-0.5">
                                Seleccioná en qué talles estará disponible este combo
                            </p>
                        </div>
                        {selectedSizeIds.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-surface px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {Icons.check}
                                </svg>
                                {selectedSizeIds.length} seleccionado{selectedSizeIds.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <SizeTogglePicker sizes={sizes} selectedSizeIds={selectedSizeIds} onToggle={toggleSize} />
                </div>

                {/* Categorías */}
                {selectedSizeIds.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-brand-bg/40 p-4 space-y-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted">
                                Categorías del combo
                            </p>
                            <p className="text-xs text-brand-text-light mt-0.5">
                                Seleccioná qué tipos de prendas compondrán el combo
                            </p>
                        </div>

                        {categoriesLoading ? (
                            <div className="flex items-center gap-2 py-3 text-sm text-brand-text-muted">
                                <Spinner /> Cargando categorías...
                            </div>
                        ) : availableCategories.length === 0 ? (
                            <p className="text-xs text-brand-text-muted italic">
                                No hay categorías con prendas en los talles seleccionados.
                            </p>
                        ) : (
                            <CategoryPills
                                categories={availableCategories}
                                selectedIds={selectedCategoryIds}
                                onToggle={toggleCategory}
                            />
                        )}
                    </div>
                )}

                {/* Category panels */}
                {selectedCategories.map((cat) => (
                    <CategoryPanel
                        key={cat.id}
                        category={cat}
                        settings={categorySettings[cat.id]}
                        onChange={(s) => updateCategorySettings(cat.id, s)}
                        onRemove={() => toggleCategory(cat.id)}
                        sizes={sizes}
                        selectedSizeIds={selectedSizeIds}
                    />
                ))}

                {/* Cobertura de talles */}
                {hasUncovered && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                            Talles sin cobertura completa
                        </p>
                        <p className="text-xs text-amber-800">
                            No se puede vender el combo en estos talles porque alguna categoría no tiene prendas seleccionadas con ese talle. Quitá el talle o agregá prendas en las categorías que faltan.
                        </p>
                        <ul className="text-xs text-amber-900 space-y-1 pl-1">
                            {uncoveredSizes.map((u) => (
                                <li key={u.id}>
                                    <span className="font-semibold">Talle {u.name}:</span> faltan prendas en {u.missing.join(', ')}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {errors.sizes && (
                    <p className="text-xs text-red-500">{errors.sizes}</p>
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
                        disabled={processing || hasUncovered}
                        title={hasUncovered ? 'Resolvé los talles sin cobertura antes de guardar' : ''}
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
        router.delete(route('admin.combos.destroy', combo.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Eliminar Combo">
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                    <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-700">¿Eliminar &quot;{combo?.name}&quot;?</p>
                        <p className="text-xs text-red-500 mt-1">Esta acción no se puede deshacer. Se eliminarán todas las prendas asociadas al combo.</p>
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
    const categoryCounts = useMemo(() => {
        const map = {};
        for (const item of combo.items ?? []) {
            const name = item.category?.name ?? '?';
            map[name] = (map[name] ?? 0) + 1;
        }
        return Object.entries(map);
    }, [combo.items]);

    return (
        <div className="group bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-200 hover:shadow-md hover:border-brand-primary/30 transition-all">
            {/* Image */}
            <div className="relative aspect-[3/4] bg-gray-50">
                {imgSrc ? (
                    <img src={imgSrc} alt={combo.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-text-light">
                        <svg className="h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {Icons.gift}
                        </svg>
                    </div>
                )}

                {/* Active badge */}
                <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow ${combo.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                        {combo.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                {/* Featured star */}
                {combo.is_featured && (
                    <div className="absolute top-2 right-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cta shadow">
                            <svg className="h-3.5 w-3.5 fill-white text-white" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                {Icons.star}
                            </svg>
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-brand-cta shadow-sm">
                        {fmt(combo.price)}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-brand-text text-sm leading-tight line-clamp-2">{combo.name}</h3>

                    {combo.sizes?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {combo.sizes.map((s) => (
                                <span key={s.id} className="rounded-full bg-brand-primary-surface px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {categoryCounts.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {categoryCounts.map(([name, count]) => (
                                <span key={name} className="rounded-full bg-brand-secondary-surface px-2 py-0.5 text-[10px] font-medium text-brand-primary-dark">
                                    {name} ({count})
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
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

export default function Index({ combos, sizes, categories, filters }) {
    const { flash } = usePage().props;

    const [flashMsg, setFlashMsg]         = useState(flash?.success ?? null);
    const [createOpen, setCreateOpen]     = useState(false);
    const [editTarget, setEditTarget]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [search, setSearch]                 = useState(filters?.search ?? '');
    const [activeCategory, setActiveCategory] = useState(filters?.category ?? '');
    const searchTimeout = useRef(null);

    useEffect(() => {
        if (flash?.success) setFlashMsg(flash.success);
    }, [flash]);

    const applyFilters = useCallback((newSearch, newCategory) => {
        const params = {};
        if (newSearch)   params.search   = newSearch;
        if (newCategory) params.category = newCategory;
        router.get(route('admin.combos.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    const handleSearchChange = (value) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        const currentCategory = activeCategory;
        searchTimeout.current = setTimeout(() => applyFilters(value, currentCategory), 400);
    };

    const handleCategoryToggle = (id) => {
        const next = activeCategory === String(id) ? '' : String(id);
        setActiveCategory(next);
        applyFilters(search, next);
    };

    const resetFilters = () => {
        setSearch('');
        setActiveCategory('');
        router.get(route('admin.combos.index'), {}, { replace: true });
    };

    const hasFilters = search || activeCategory;
    const total = combos.total ?? combos.data?.length ?? 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Combos</h1>
                        <p className="text-sm text-brand-text-muted mt-0.5">
                            {total} combo{total !== 1 ? 's' : ''} {hasFilters ? 'encontrado' : 'registrado'}{total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                    >
                        <Icon name="plus" />
                        Nuevo Combo
                    </button>
                </div>
            }
        >
            <Head title="Combos" />

            <div className="p-6 space-y-5">
                <FlashBanner message={flashMsg} onDismiss={() => setFlashMsg(null)} />

                {/* Search + filters */}
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

                    {categories?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-brand-text-muted">Filtrar por categoría</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => {
                                    const active = activeCategory === String(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategoryToggle(cat.id)}
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
                                            {cat.name}
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

                {/* Empty state */}
                {(combos.data?.length ?? 0) === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-surface text-brand-primary mb-4">
                            <Icon name="gift" className="h-8 w-8" />
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
                                <p className="text-lg font-semibold text-brand-text">No hay combos registrados</p>
                                <p className="text-sm mt-1">Creá el primer combo para empezar</p>
                                <button
                                    onClick={() => setCreateOpen(true)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                                >
                                    <Icon name="plus" />
                                    Nuevo Combo
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Grid */}
                {(combos.data?.length ?? 0) > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cta-surface text-brand-cta">
                                <Icon name="gift" />
                            </span>
                            <div className="flex-1">
                                <h2 className="text-base font-bold text-brand-text">Todos los combos</h2>
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

            <ComboFormModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                sizes={sizes}
            />
            <ComboFormModal
                open={editTarget !== null}
                onClose={() => setEditTarget(null)}
                sizes={sizes}
                combo={editTarget}
            />
            <DeleteModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                combo={deleteTarget}
            />
        </AuthenticatedLayout>
    );
}
