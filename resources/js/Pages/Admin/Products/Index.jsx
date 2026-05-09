import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function glideUrl(src, w, h, fit = 'crop') {
    if (!src) return null;
    return `${src}?w=${w}&h=${h}&fit=${fit}`;
}

function totalStock(product) {
    return product.sizes.reduce((sum, s) => sum + (s.pivot?.stock ?? 0), 0);
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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

    const widthClass = size === '3xl' ? 'max-w-5xl' : size === '2xl' ? 'max-w-7xl' : size === 'xl' ? 'max-w-2xl' : size === 'lg' ? 'max-w-lg' : 'max-w-md';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${widthClass} rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]`}>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                    <h3 className="text-base font-bold text-brand-text">{title}</h3>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-brand-text-muted hover:bg-gray-100 hover:text-brand-text transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
    return (
        <p className="text-xs font-bold uppercase tracking-wide text-brand-text-muted mb-2">{children}</p>
    );
}

function SectionPanel({ accent, icon, label, children }) {
    const styles = {
        purple: { wrap: 'border-purple-200 bg-purple-50/70',  text: 'text-purple-700'  },
        emerald: { wrap: 'border-emerald-200 bg-emerald-50/70', text: 'text-emerald-700' },
        rose:    { wrap: 'border-rose-200   bg-rose-50/70',    text: 'text-rose-700'    },
        amber:   { wrap: 'border-amber-200  bg-amber-50/70',   text: 'text-amber-700'   },
        cyan:    { wrap: 'border-cyan-200   bg-cyan-50/70',    text: 'text-cyan-700'    },
    };
    const s = styles[accent] ?? styles.purple;
    return (
        <div className={`rounded-xl border ${s.wrap} p-3.5 space-y-2.5`}>
            <p className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${s.text}`}>
                <span>{icon}</span>{label}
            </p>
            {children}
        </div>
    );
}

// ─── Checkbox pill ────────────────────────────────────────────────────────────

function CheckPill({ label, checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                checked
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-gray-200 bg-white text-brand-text-muted hover:border-brand-primary hover:text-brand-primary'
            }`}
        >
            {checked && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
            {label}
        </button>
    );
}

// ─── Searchable pills with expand/collapse ────────────────────────────────────

function SearchablePills({ items, selected, onToggle, placeholder = 'Buscar...', initialCount = 6 }) {
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(false);

    const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );
    const isFiltering = query.trim() !== '';
    const shown = expanded || isFiltering ? filtered : filtered.slice(0, initialCount);
    const hiddenCount = filtered.length - initialCount;

    return (
        <div className="space-y-2">
            <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-brand-text placeholder-brand-text-light focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-text transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[28px]">
                {shown.map((item) => (
                    <CheckPill
                        key={item.id}
                        label={item.name}
                        checked={selected.includes(item.id)}
                        onChange={() => onToggle(item.id)}
                    />
                ))}
                {shown.length === 0 && (
                    <p className="text-xs text-brand-text-muted py-1 italic">Sin resultados para &quot;{query}&quot;</p>
                )}
            </div>
            {!isFiltering && hiddenCount > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded((x) => !x)}
                    className="flex items-center gap-1 text-xs font-medium text-brand-secondary hover:text-brand-primary transition-colors"
                >
                    {expanded ? (
                        <>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                            </svg>
                            Mostrar menos
                        </>
                    ) : (
                        <>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                            Ver {hiddenCount} más
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

// ─── Size picker ──────────────────────────────────────────────────────────────

const SIZE_GROUPS = ['Bebé', 'Niño/a', 'Otros'];

function categorizeSizeName(name) {
    const l = name.toLowerCase();
    if (l.includes('bebe') || l.includes('bebé')) return 'Bebé';
    if (l.includes('niño') || l.includes('niña') || l.includes('nino') || l.includes('nina')) return 'Niño/a';
    return 'Otros';
}

function SizePicker({ sizes, selectedSizes, onToggle, onSetStock }) {
    const [query, setQuery] = useState('');
    const pendingFocusId = useRef(null);

    // After each render: if we just selected a size, focus its stock input
    useEffect(() => {
        if (pendingFocusId.current === null) return;
        const el = document.getElementById(`size-stock-${pendingFocusId.current}`);
        pendingFocusId.current = null;
        if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    const handleCardClick = (id) => {
        const wasSelected = id in selectedSizes;
        onToggle(id);
        if (!wasSelected) pendingFocusId.current = id;
    };

    const filtered = sizes.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
    );

    const groups = SIZE_GROUPS.reduce((acc, g) => {
        const items = filtered.filter((s) => categorizeSizeName(s.name) === g);
        if (items.length) acc[g] = items;
        return acc;
    }, {});

    const selectedList = sizes.filter((s) => s.id in selectedSizes);

    return (
        <div className="space-y-3">
            {/* Search */}
            <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar talle..."
                    className="w-full rounded-lg border border-amber-200 bg-white pl-8 pr-3 py-1.5 text-xs text-brand-text placeholder-amber-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none"
                />
                {query && (
                    <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Grouped grids */}
            {SIZE_GROUPS.filter((g) => groups[g]).map((group) => (
                <div key={group} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                        <span className="inline-block h-0.5 w-5 rounded-full bg-amber-400" />
                        {group}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {groups[group].map((s) => {
                            const selected = s.id in selectedSizes;
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => handleCardClick(s.id)}
                                    onMouseDown={(e) => { if (e.target.tagName !== 'INPUT') e.preventDefault(); }}
                                    className={`cursor-pointer rounded-xl border p-2.5 transition-all select-none ${
                                        selected
                                            ? 'border-amber-400 bg-white shadow-md shadow-amber-100'
                                            : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-1 mb-1.5">
                                        <span className={`text-xs font-bold leading-tight ${selected ? 'text-amber-600' : 'text-brand-text'}`}>
                                            {s.name}
                                        </span>
                                        <div className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                            selected ? 'border-amber-400 bg-amber-400' : 'border-gray-300 bg-white'
                                        }`}>
                                            {selected && (
                                                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    {selected ? (
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-medium text-amber-600 flex items-center gap-0.5">
                                                <svg className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Disponible
                                            </p>
                                            <p className="text-[10px] text-brand-text-muted flex items-center gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
                                                Stock disponible
                                            </p>
                                            <input
                                                id={`size-stock-${s.id}`}
                                                type="number"
                                                min="0"
                                                value={selectedSizes[s.id]}
                                                onChange={(e) => onSetStock(s.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-center font-medium outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-brand-secondary">Click para activar</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {filtered.length === 0 && (
                <p className="text-xs text-amber-500 italic py-1">Sin resultados para &quot;{query}&quot;</p>
            )}

            {/* Summary */}
            {selectedList.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                        <svg className="h-3.5 w-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-semibold text-emerald-700">
                            Resumen: {selectedList.length} talle{selectedList.length !== 1 ? 's' : ''} seleccionado{selectedList.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {selectedList.map((s) => (
                            <span key={s.id} className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                                {s.name}: {selectedSizes[s.id]} u.
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Image upload zone ────────────────────────────────────────────────────────

function ImageUploadZone({ existingImages, newImages, onAddNew, onRemoveExisting, onRemoveNew }) {
    const fileInputRef = useRef(null);

    const newPreviews = useMemo(() => newImages.map((f) => URL.createObjectURL(f)), [newImages]);
    useEffect(() => () => newPreviews.forEach((u) => URL.revokeObjectURL(u)), [newPreviews]);

    const handleFiles = (files) => {
        const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (valid.length) onAddNew(valid);
    };

    const onDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            {/* Existing thumbnails */}
            {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {existingImages.map((url) => (
                        <div key={url} className="relative group h-20 w-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={url} className="h-full w-full object-cover" alt="" />
                            <button
                                type="button"
                                onClick={() => onRemoveExisting(url)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* New image previews */}
            {newPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {newPreviews.map((url, i) => (
                        <div key={i} className="relative group h-20 w-20 rounded-xl overflow-hidden border-2 border-brand-primary/40 bg-gray-50">
                            <img src={url} className="h-full w-full object-cover" alt="" />
                            <button
                                type="button"
                                onClick={() => onRemoveNew(i)}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <span className="absolute bottom-1 right-1 rounded bg-brand-primary px-1 text-[10px] text-white font-bold">nuevo</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Drop zone */}
            <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-6 text-brand-text-muted hover:border-brand-primary hover:bg-brand-primary/5 transition-colors"
            >
                <svg className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Hacé clic o arrastrá imágenes aquí</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>
        </div>
    );
}

// ─── Product modal (create + edit) ────────────────────────────────────────────

const EMPTY_FORM = {
    name: '', description: '', price: '', is_featured: false,
    categories: [], colors: [], genders: [],
    selectedSizes: {},    // { [sizeId]: stock }
    existingImages: [],   // URL strings (edit only)
    newImages: [],        // File objects
};

function ProductModal({ open, onClose, product, allCategories, allColors, allSizes, allGenders }) {
    const isEditing = product !== null;
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (product) {
            setForm({
                name:           product.name ?? '',
                description:    product.description ?? '',
                price:          product.price ?? '',
                is_featured:    product.is_featured ?? false,
                categories:     (product.categories ?? []).map((c) => c.id),
                colors:         (product.colors ?? []).map((c) => c.id),
                genders:        (product.genders ?? []).map((g) => g.id),
                selectedSizes:  Object.fromEntries(
                    (product.sizes ?? []).map((s) => [s.id, s.pivot?.stock ?? 0])
                ),
                existingImages: product.images ?? [],
                newImages:      [],
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [open, product]);

    const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

    const toggleMulti = (field, id) =>
        set(field, form[field].includes(id)
            ? form[field].filter((x) => x !== id)
            : [...form[field], id]
        );

    const toggleSize = (id) => {
        const next = { ...form.selectedSizes };
        if (id in next) { delete next[id]; } else { next[id] = 0; }
        set('selectedSizes', next);
    };

    const setSizeStock = (id, stock) =>
        set('selectedSizes', { ...form.selectedSizes, [id]: Math.max(0, parseInt(stock) || 0) });

    const removeExistingImage = (url) =>
        set('existingImages', form.existingImages.filter((u) => u !== url));

    const addNewImages = (files) => set('newImages', [...form.newImages, ...files]);
    const removeNewImage = (i) => set('newImages', form.newImages.filter((_, idx) => idx !== i));

    const handleClose = () => { setErrors({}); onClose(); };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const sizes = Object.entries(form.selectedSizes).map(([id, stock]) => ({ id: parseInt(id), stock }));

        const payload = {
            name:         form.name,
            description:  form.description,
            price:        form.price,
            is_featured:  form.is_featured,
            categories:   form.categories,
            colors:       form.colors,
            genders:      form.genders,
            sizes,
            images:       form.newImages,
        };

        const options = {
            forceFormData: true,
            onSuccess: handleClose,
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        };

        if (isEditing) {
            router.post(route('admin.products.update', product.id), {
                ...payload,
                existing_images: form.existingImages,
            }, options);
        } else {
            router.post(route('admin.products.store'), payload, options);
        }
    };

    const Field = ({ label, error, children }) => (
        <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
    );

    const inputCls = (err) =>
        `w-full rounded-xl border px-4 py-2.5 text-sm text-brand-text outline-none transition focus:ring-2 ${
            err ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-secondary focus:ring-brand-secondary/30'
        }`;

    return (
        <Modal open={open} onClose={handleClose} title={isEditing ? 'Editar Prenda' : 'Nueva Prenda'} size="2xl">
            <form onSubmit={submit} className="space-y-5">

                {/* ── Información básica ────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Field label="Nombre" error={errors.name}>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="Nombre de la prenda"
                                autoFocus
                                className={inputCls(errors.name)}
                            />
                        </Field>
                    </div>

                    <Field label="Precio ($)" error={errors.price}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => set('price', e.target.value)}
                            placeholder="0.00"
                            className={inputCls(errors.price)}
                        />
                    </Field>

                    <div className="flex flex-col justify-end">
                        <button
                            type="button"
                            onClick={() => set('is_featured', !form.is_featured)}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                                form.is_featured
                                    ? 'border-amber-400 bg-amber-50 text-amber-600'
                                    : 'border-gray-200 bg-white text-brand-text-muted hover:border-amber-300'
                            }`}
                        >
                            <svg className={`h-4 w-4 ${form.is_featured ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Destacado
                        </button>
                    </div>

                    <div className="col-span-2">
                        <Field label="Descripción (opcional)" error={errors.description}>
                            <textarea
                                value={form.description}
                                onChange={(e) => set('description', e.target.value)}
                                rows={3}
                                placeholder="Descripción de la prenda..."
                                className={inputCls(errors.description) + ' resize-none'}
                            />
                        </Field>
                    </div>
                </div>

                {/* ── Imágenes ──────────────────────────────────────── */}
                <div>
                    <SectionLabel>Imágenes</SectionLabel>
                    <ImageUploadZone
                        existingImages={form.existingImages}
                        newImages={form.newImages}
                        onAddNew={addNewImages}
                        onRemoveExisting={removeExistingImage}
                        onRemoveNew={removeNewImage}
                    />
                    {errors['images.0'] && <p className="mt-1.5 text-xs text-red-500">{errors['images.0']}</p>}
                </div>

                {/* ── Género ────────────────────────────────────────── */}
                {allGenders.length > 0 && (
                    <SectionPanel accent="purple" icon="👤" label="Género">
                        <div className="flex flex-wrap gap-2">
                            {allGenders.map((g) => (
                                <CheckPill
                                    key={g.id}
                                    label={g.name}
                                    checked={form.genders.includes(g.id)}
                                    onChange={() => toggleMulti('genders', g.id)}
                                />
                            ))}
                        </div>
                    </SectionPanel>
                )}

                {/* ── Categorías ────────────────────────────────────── */}
                {allCategories.length > 0 && (
                    <SectionPanel accent="emerald" icon="📁" label="Categorías">
                        <SearchablePills
                            items={allCategories}
                            selected={form.categories}
                            onToggle={(id) => toggleMulti('categories', id)}
                            placeholder="Buscar categoría..."
                            initialCount={6}
                        />
                    </SectionPanel>
                )}

                {/* ── Colores ───────────────────────────────────────── */}
                {allColors.length > 0 && (
                    <SectionPanel accent="rose" icon="🎨" label="Colores">
                        <SearchablePills
                            items={allColors}
                            selected={form.colors}
                            onToggle={(id) => toggleMulti('colors', id)}
                            placeholder="Buscar color..."
                            initialCount={6}
                        />
                    </SectionPanel>
                )}

                {/* ── Talles y stock ────────────────────────────────── */}
                {allSizes.length > 0 && (
                    <SectionPanel accent="amber" icon="📏" label="Talles y stock">
                        <SizePicker
                            sizes={allSizes}
                            selectedSizes={form.selectedSizes}
                            onToggle={toggleSize}
                            onSetStock={setSizeStock}
                        />
                    </SectionPanel>
                )}

                {/* ── Actions ───────────────────────────────────────── */}
                <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-cta px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors disabled:opacity-60"
                    >
                        {processing ? <Spinner /> : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {isEditing ? 'Guardar cambios' : 'Crear prenda'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({ open, onClose, product }) {
    const [processing, setProcessing] = useState(false);

    const submit = () => {
        setProcessing(true);
        router.delete(route('admin.products.destroy', product.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Eliminar Prenda">
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                    <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-700">¿Eliminar &quot;{product?.name}&quot;?</p>
                        <p className="text-xs text-red-500 mt-1">
                            Esta acción no se puede deshacer. Se eliminarán también las imágenes del servidor.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={submit}
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                        {processing ? <Spinner /> : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                        Eliminar
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockBadge({ stock }) {
    if (stock === 0)
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-500 px-2.5 py-1 text-xs font-bold text-white shadow">
                Stock: 0
            </span>
        );
    if (stock <= 3)
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cta px-2.5 py-1 text-xs font-bold text-white shadow">
                ⚠ BAJO STOCK
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            Stock: {stock}
        </span>
    );
}

function MetaItem({ icon, text }) {
    return (
        <span className="flex items-center gap-0.5 shrink-0">
            <span>{icon}</span>
            <span>{text}</span>
        </span>
    );
}

function ProductCard({ product, onEdit, onDelete }) {
    const stock = totalStock(product);
    const image = product.images?.[0] ?? null;

    const metaItems = [
        product.genders?.length > 0  && { key: 'g', icon: '👤', text: product.genders.map(g => g.name).join(', ') },
        product.categories?.length > 0 && { key: 'c', icon: '📁', text: product.categories.map(c => c.name).join(', ') },
        product.sizes?.length > 0    && { key: 's', icon: '📏', text: product.sizes.map(s => `${s.name}(${s.pivot?.stock ?? 0})`).join(' ') },
        product.colors?.length > 0   && { key: 'col', icon: '🎨', text: product.colors.map(c => c.name).join(', ') },
    ].filter(Boolean);

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="relative aspect-[3/4] bg-gray-50">
                {image ? (
                    <img src={glideUrl(image, 400, 533)} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-text-light">
                        <svg className="h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                <div className="absolute top-2 left-2">
                    <StockBadge stock={stock} />
                </div>

                <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-white shadow">
                        ${Number(product.price).toLocaleString('es-AR')}
                    </span>
                </div>

                <div className="absolute top-2 right-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shadow ${product.is_featured ? 'bg-amber-400' : 'bg-white/80'}`}>
                        <svg className={`h-3.5 w-3.5 ${product.is_featured ? 'text-white fill-white' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Card body */}
            <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-brand-text text-sm leading-tight truncate">{product.name}</h3>

                    {metaItems.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-brand-text-muted">
                            {metaItems.map((item, idx) => (
                                <span key={item.key} className="flex items-center gap-x-2.5">
                                    {idx > 0 && <span className="text-gray-300 -ml-1.5">·</span>}
                                    <MetaItem icon={item.icon} text={item.text} />
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                    <button className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary py-2 text-xs font-semibold text-white hover:bg-brand-primary-dark transition-colors">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Prenda
                    </button>
                    <button
                        onClick={() => onEdit(product)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 py-2 text-xs font-semibold text-white hover:bg-cyan-600 transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(product)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                    </button>
                    <button
                        className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)' }}
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Crear Oferta
                    </button>
                </div>
            </div>
        </div>
    );
}

function FilterSelect({ label, icon, value, onChange, options, placeholder, accentClass }) {
    return (
        <div className={`rounded-xl border-l-4 ${accentClass} bg-white p-3 shadow-sm`}>
            <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span>{icon}</span> {label}
            </p>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-brand-text focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none bg-white"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function FilterSidebar({ localFilters, onChange, onReset, categories, colors, sizes, genders }) {
    return (
        <aside className="w-72 shrink-0 border-l border-gray-200 bg-brand-bg">
            <div className="sticky top-0 max-h-screen overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2 text-brand-primary font-bold text-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        Filtros
                    </div>
                    <button
                        onClick={onReset}
                        className="text-xs text-brand-text-muted hover:text-brand-cta transition-colors underline-offset-2 hover:underline"
                    >
                        Limpiar todo
                    </button>
                </div>

                <div className="rounded-xl border-l-4 border-brand-primary bg-white p-3 shadow-sm">
                    <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={localFilters.search}
                            onChange={(e) => onChange('search', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-sm text-brand-text placeholder-brand-text-light focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none"
                        />
                    </div>
                </div>

                <div className="rounded-xl border-l-4 border-brand-secondary bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-2">Ordenar</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {[{ value: 'asc', label: 'A → Z' }, { value: 'desc', label: 'Z → A' }].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => onChange('sort', opt.value)}
                                className={`rounded-lg border py-1.5 text-sm font-medium transition-colors ${
                                    localFilters.sort === opt.value
                                        ? 'bg-brand-primary border-brand-primary text-white'
                                        : 'bg-white border-gray-200 text-brand-text hover:border-brand-primary hover:text-brand-primary'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border-l-4 border-amber-400 bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-2">Especiales</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={() => onChange('featured', localFilters.featured === '1' ? '' : '1')}
                            className={`rounded-lg border py-1.5 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                                localFilters.featured === '1'
                                    ? 'bg-amber-400 border-amber-400 text-white'
                                    : 'bg-white border-gray-200 text-brand-text hover:border-amber-400 hover:text-amber-600'
                            }`}
                        >
                            ⭐ Destacados
                        </button>
                        <button className="rounded-lg border border-gray-200 bg-white py-1.5 text-sm font-medium flex items-center justify-center gap-1 text-brand-text hover:border-brand-cta hover:text-brand-cta transition-colors">
                            🏷️ Ofertas
                        </button>
                    </div>
                </div>

                <FilterSelect label="Categoría" icon="📁" accentClass="border-emerald-400" value={localFilters.category} onChange={(v) => onChange('category', v)} options={categories} placeholder="Todas" />
                <FilterSelect label="Color" icon="🎨" accentClass="border-pink-400" value={localFilters.color} onChange={(v) => onChange('color', v)} options={colors} placeholder="Todos" />
                <FilterSelect label="Talle" icon="📏" accentClass="border-yellow-400" value={localFilters.size} onChange={(v) => onChange('size', v)} options={sizes} placeholder="Todos" />
                <FilterSelect label="Género" icon="👤" accentClass="border-purple-400" value={localFilters.gender} onChange={(v) => onChange('gender', v)} options={genders} placeholder="Todos" />

                <div className="rounded-xl border-l-4 border-brand-cta bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <span>💰</span> Precio
                    </p>
                    <div className="space-y-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-light text-sm pointer-events-none">$</span>
                            <input type="number" placeholder="Mínimo" value={localFilters.min_price} onChange={(e) => onChange('min_price', e.target.value)} className="w-full rounded-lg border border-gray-200 pl-7 pr-3 py-1.5 text-sm text-brand-text focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none" />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-light text-sm pointer-events-none">$</span>
                            <input type="number" placeholder="Máximo" value={localFilters.max_price} onChange={(e) => onChange('max_price', e.target.value)} className="w-full rounded-lg border border-gray-200 pl-7 pr-3 py-1.5 text-sm text-brand-text focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index({ products, filters, categories, colors, sizes, genders }) {
    const { flash } = usePage().props;

    const [flashMsg, setFlashMsg] = useState(flash?.success ?? null);
    const [localFilters, setLocalFilters] = useState({
        search:    filters.search    ?? '',
        category:  filters.category  ?? '',
        color:     filters.color     ?? '',
        size:      filters.size      ?? '',
        gender:    filters.gender    ?? '',
        featured:  filters.featured  ?? '',
        min_price: filters.min_price ?? '',
        max_price: filters.max_price ?? '',
        sort:      filters.sort      ?? 'asc',
    });

    const [createOpen, setCreateOpen]   = useState(false);
    const [editTarget, setEditTarget]   = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { if (flash?.success) setFlashMsg(flash.success); }, [flash]);

    const applyFilters = useCallback((updated) => {
        const params = {};
        Object.entries(updated).forEach(([k, v]) => { if (v !== '' && v != null) params[k] = v; });
        router.get(route('admin.products.index'), params, { preserveState: true, preserveScroll: true, replace: true });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => applyFilters(localFilters), 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localFilters.search, localFilters.min_price, localFilters.max_price]);

    const handleChange = (key, value) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        if (!['search', 'min_price', 'max_price'].includes(key)) applyFilters(updated);
    };

    const resetFilters = () => {
        const empty = { search: '', category: '', color: '', size: '', gender: '', featured: '', min_price: '', max_price: '', sort: 'asc' };
        setLocalFilters(empty);
        applyFilters(empty);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-brand-text">Prendas</h2>
                        <p className="text-sm text-brand-text-muted mt-0.5">
                            {products.total} prenda{products.total !== 1 ? 's' : ''} encontradas
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Prenda
                    </button>
                </div>
            }
        >
            <Head title="Prendas" />

            <div className="flex min-h-full">
                {/* ── Grid ───────────────────────────────────────────── */}
                <div className="flex-1 min-w-0 p-6 space-y-5">
                    <FlashBanner message={flashMsg} onDismiss={() => setFlashMsg(null)} />

                    {products.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted">
                            <svg className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="text-lg font-semibold">No se encontraron prendas</p>
                            <p className="text-sm mt-1">Intentá cambiar los filtros de búsqueda</p>
                            <button onClick={resetFilters} className="mt-4 text-sm font-medium text-brand-primary hover:text-brand-primary-dark underline underline-offset-2 transition-colors">
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onEdit={setEditTarget}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                            </div>

                            {products.last_page > 1 && (
                                <div className="flex flex-wrap justify-center gap-1.5 mt-8">
                                    {products.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            disabled={!link.url}
                                            className={`min-w-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-brand-primary text-white shadow-sm'
                                                    : link.url
                                                    ? 'bg-white text-brand-text hover:bg-brand-primary-surface border border-gray-200'
                                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Sidebar ────────────────────────────────────────── */}
                <FilterSidebar
                    localFilters={localFilters}
                    onChange={handleChange}
                    onReset={resetFilters}
                    categories={categories}
                    colors={colors}
                    sizes={sizes}
                    genders={genders}
                />
            </div>

            {/* ── Modals ─────────────────────────────────────────────── */}
            <ProductModal
                open={createOpen || editTarget !== null}
                onClose={() => { setCreateOpen(false); setEditTarget(null); }}
                product={editTarget}
                allCategories={categories}
                allColors={colors}
                allSizes={sizes}
                allGenders={genders}
            />

            <DeleteModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                product={deleteTarget}
            />
        </AuthenticatedLayout>
    );
}
