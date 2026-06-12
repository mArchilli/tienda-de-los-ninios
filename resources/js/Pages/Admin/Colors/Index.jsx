import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Map common Spanish color names to actual CSS colors so the swatch visually
// represents the color. Falls back to a deterministic hash-based pastel.
const COLOR_MAP = {
    'blanco': '#FFFFFF',     'negro': '#1F1F1F',      'gris': '#9CA3AF',
    'gris claro': '#D1D5DB', 'gris oscuro': '#4B5563','plata': '#C0C0C0',
    'rojo': '#EF4444',       'bordó': '#7F1D1D',      'bordo': '#7F1D1D',
    'rosa': '#F472B6',       'rosa palo': '#FBCFE8',  'fucsia': '#D946EF',
    'naranja': '#F97316',    'amarillo': '#FACC15',   'mostaza': '#CA8A04',
    'verde': '#22C55E',      'verde claro': '#86EFAC','verde oscuro': '#15803D',
    'verde manzana': '#84CC16','verde agua': '#5EEAD4',
    'azul': '#3B82F6',       'azul marino': '#1E3A8A','celeste': '#60A5FA',
    'turquesa': '#06B6D4',   'violeta': '#8B5CF6',    'lila': '#C4B5FD',
    'morado': '#7C3AED',     'marrón': '#92400E',     'marron': '#92400E',
    'beige': '#E7D7B1',      'crema': '#FFF8E1',      'camel': '#C19A6B',
    'dorado': '#D4AF37',     'cobre': '#B87333',
};

function hashColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    const hue = Math.abs(h) % 360;
    return `hsl(${hue}, 55%, 70%)`;
}

function swatchColor(name) {
    if (!name) return '#E5E7EB';
    const key = name.trim().toLowerCase();
    return COLOR_MAP[key] ?? hashColor(key);
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
);

const PaletteIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

// ─── Modal base ───────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
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
                <div className="px-6 py-5">{children}</div>
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

// ─── Color card ───────────────────────────────────────────────────────────────

function ColorCard({ color, onEdit, onDelete, selectionMode = false, selected = false, onToggleSelect }) {
    return (
        <div
            onClick={selectionMode ? () => onToggleSelect(color.id) : undefined}
            className={`group flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all ${
                selectionMode
                    ? `cursor-pointer select-none ${selected ? 'border-brand-primary shadow-md shadow-brand-primary/20' : 'border-gray-200 hover:border-brand-primary/50'}`
                    : 'border-gray-200 hover:shadow-md hover:border-brand-primary/30'
            }`}
        >
            <span
                className="h-12 w-12 shrink-0 rounded-xl border border-gray-200 shadow-inner"
                style={{ backgroundColor: swatchColor(color.name) }}
                aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-brand-text">{color.name}</p>
                <p className="text-xs text-brand-text-muted">Color</p>
            </div>

            {selectionMode ? (
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300'
                }`}>
                    {selected && (
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(color)}
                        title="Editar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-muted hover:bg-brand-primary-surface hover:text-brand-primary transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(color)}
                        title="Eliminar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Bulk delete modal ────────────────────────────────────────────────────────

function BulkDeleteModal({ open, onClose, selectedIds, onSuccess }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const count = selectedIds.size;

    useEffect(() => { if (open) setError(null); }, [open]);

    const submit = () => {
        setProcessing(true);
        setError(null);
        router.delete(route('admin.colors.bulk-destroy'), {
            data: { ids: [...selectedIds] },
            preserveScroll: true,
            onSuccess: () => { onSuccess(); onClose(); },
            onError: (errs) => setError(errs.bulk ?? 'No se pudieron eliminar los colores.'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Eliminar colores">
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                    <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-700">
                            ¿Eliminar {count} color{count !== 1 ? 'es' : ''}?
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                            Esta acción no se puede deshacer. Los colores se desvincularán de todas las prendas asociadas.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-700">
                    <svg className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Antes de borrar, corroborá que no haya prendas que usen estos colores.</span>
                </div>
                {error && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {error}
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={submit} disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors disabled:opacity-60">
                        {processing ? <Spinner /> : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                        Eliminar {count} color{count !== 1 ? 'es' : ''}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CreateModal({ open, onClose }) {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleClose = () => { setName(''); setErrors({}); onClose(); };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.colors.store'), { name }, {
            onSuccess: handleClose,
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={handleClose} title="Nuevo Color">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Nombre del color
                    </label>
                    <div className="flex items-center gap-3">
                        <span
                            className="h-10 w-10 shrink-0 rounded-xl border border-gray-200 shadow-inner"
                            style={{ backgroundColor: swatchColor(name) }}
                            aria-hidden="true"
                        />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Rojo, Azul marino, Rosa palo…"
                            autoFocus
                            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm text-brand-text outline-none transition focus:ring-2 ${
                                errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                            }`}
                        />
                    </div>
                    {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={handleClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-brand-cta px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors disabled:opacity-60">
                        {processing ? <Spinner /> : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        )}
                        Crear color
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function EditModal({ open, onClose, color }) {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => { if (color) setName(color.name); }, [color]);

    const handleClose = () => { setErrors({}); onClose(); };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(route('admin.colors.update', color.id), { name }, {
            onSuccess: handleClose,
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={handleClose} title="Editar Color">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Nombre del color
                    </label>
                    <div className="flex items-center gap-3">
                        <span
                            className="h-10 w-10 shrink-0 rounded-xl border border-gray-200 shadow-inner"
                            style={{ backgroundColor: swatchColor(name) }}
                            aria-hidden="true"
                        />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm text-brand-text outline-none transition focus:ring-2 ${
                                errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                            }`}
                        />
                    </div>
                    {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={handleClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-dark transition-colors disabled:opacity-60">
                        {processing ? <Spinner /> : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        Guardar cambios
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function DeleteModal({ open, onClose, color }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { if (open) setError(null); }, [open]);

    const submit = () => {
        setProcessing(true);
        setError(null);
        router.delete(route('admin.colors.destroy', color.id), {
            preserveScroll: true,
            onSuccess: onClose,
            onError: (errs) => setError(errs.delete ?? 'No se pudo eliminar el color.'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Eliminar Color">
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                    <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-700">¿Eliminar &quot;{color?.name}&quot;?</p>
                        <p className="text-xs text-red-500 mt-1">
                            Esta acción no se puede deshacer. El color se desvinculará de todas las prendas asociadas.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-700">
                    <svg className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Antes de borrar, corroborá que no haya prendas que usen este color.</span>
                </div>
                {error && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {error}
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={submit} disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors disabled:opacity-60">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index({ colors }) {
    const { flash } = usePage().props;

    const [flashMsg, setFlashMsg] = useState(flash?.success ?? null);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) setFlashMsg(flash.success);
    }, [flash]);

    const filtered = useMemo(() => {
        if (!search.trim()) return colors;
        const q = search.toLowerCase();
        return colors.filter((c) => c.name.toLowerCase().includes(q));
    }, [colors, search]);

    const toggleSelect = (id) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const selectAll = () => setSelectedIds(new Set(filtered.map((c) => c.id)));
    const clearSelection = () => setSelectedIds(new Set());

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">
                            {selectionMode ? 'Selección' : 'Colores'}
                        </h1>
                        <p className="text-sm text-brand-text-muted mt-0.5">
                            {selectionMode
                                ? `${selectedIds.size} color${selectedIds.size !== 1 ? 'es' : ''} seleccionado${selectedIds.size !== 1 ? 's' : ''}`
                                : `${colors.length} color${colors.length !== 1 ? 'es' : ''} registrado${colors.length !== 1 ? 's' : ''}`
                            }
                        </p>
                    </div>
                    {selectionMode ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={selectedIds.size < filtered.length ? selectAll : clearSelection}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors"
                            >
                                {selectedIds.size < filtered.length ? 'Seleccionar todos' : 'Deseleccionar'}
                            </button>
                            <button
                                onClick={() => setBulkDeleteOpen(true)}
                                disabled={selectedIds.size === 0}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
                            </button>
                            <button
                                onClick={exitSelectionMode}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-brand-text-muted hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectionMode(true)}
                                disabled={colors.length === 0}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-brand-text-muted hover:border-brand-primary hover:text-brand-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Seleccionar
                            </button>
                            <button
                                onClick={() => setCreateOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Color
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Colores" />

            <div className="p-6 space-y-5">
                <FlashBanner message={flashMsg} onDismiss={() => setFlashMsg(null)} />

                {selectionMode && (
                    <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                        <svg className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Antes de borrar, corroborá que no haya prendas que usen los colores que querés eliminar.</span>
                    </div>
                )}

                {/* Search */}
                {colors.length > 0 && (
                    <div className="relative max-w-sm">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar color…"
                            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-9 py-2.5 text-sm text-brand-text placeholder-brand-text-light outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition shadow-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-text transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {colors.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-surface text-brand-primary mb-4">
                            <PaletteIcon className="h-8 w-8" />
                        </span>
                        <p className="text-lg font-semibold text-brand-text">No hay colores registrados</p>
                        <p className="text-sm mt-1">Creá el primer color para empezar</p>
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Color
                        </button>
                    </div>
                )}

                {/* No search results */}
                {colors.length > 0 && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-brand-text-muted">
                        <svg className="h-12 w-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="font-semibold">Sin resultados para &quot;{search}&quot;</p>
                        <button onClick={() => setSearch('')} className="mt-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors">
                            Limpiar búsqueda
                        </button>
                    </div>
                )}

                {/* Grid */}
                {filtered.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-surface text-brand-primary">
                                <PaletteIcon />
                            </span>
                            <div className="flex-1">
                                <h2 className="text-base font-bold text-brand-text">Todos los colores</h2>
                                <p className="text-xs text-brand-text-muted">
                                    {filtered.length} color{filtered.length !== 1 ? 'es' : ''}{search ? ` · búsqueda: "${search}"` : ' · ordenados A–Z'}
                                </p>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filtered.map((color) => (
                                    <ColorCard
                                        key={color.id}
                                        color={color}
                                        onEdit={setEditTarget}
                                        onDelete={setDeleteTarget}
                                        selectionMode={selectionMode}
                                        selected={selectedIds.has(color.id)}
                                        onToggleSelect={toggleSelect}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <EditModal open={editTarget !== null} onClose={() => setEditTarget(null)} color={editTarget} />
            <DeleteModal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} color={deleteTarget} />
            <BulkDeleteModal
                open={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                selectedIds={selectedIds}
                onSuccess={exitSelectionMode}
            />
        </AuthenticatedLayout>
    );
}
