import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

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

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ category, onEdit, onDelete }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-brand-secondary/40 bg-brand-secondary-surface p-4 shadow-sm hover:border-brand-secondary transition-colors">
            {/* Icon */}
            <div className="flex justify-center">
                <span className="text-4xl select-none">🏷️</span>
            </div>

            {/* Name */}
            <p className="text-center text-base font-bold text-brand-primary leading-snug">
                {category.name}
            </p>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={() => onEdit(category)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-cyan-400 bg-white py-1.5 text-xs font-semibold text-cyan-500 hover:bg-cyan-50 transition-colors"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                </button>
                <button
                    onClick={() => onDelete(category)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-red-400 bg-white py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                </button>
            </div>
        </div>
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
        router.post(route('admin.categories.store'), { name }, {
            onSuccess: handleClose,
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={handleClose} title="Nueva Categoría">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Nombre de la categoría
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Ropa, Calzado, Accesorios…"
                        autoFocus
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-brand-text outline-none transition focus:ring-2 focus:ring-brand-secondary ${
                            errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-secondary'
                        }`}
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={handleClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-brand-cta px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors disabled:opacity-60">
                        {processing
                            ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                            : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        }
                        Crear categoría
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function EditModal({ open, onClose, category }) {
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => { if (category) setName(category.name); }, [category]);

    const handleClose = () => { setErrors({}); onClose(); };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(route('admin.categories.update', category.id), { name }, {
            onSuccess: handleClose,
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={handleClose} title="Editar Categoría">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                        Nombre de la categoría
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-brand-text outline-none transition focus:ring-2 focus:ring-brand-secondary ${
                            errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-secondary'
                        }`}
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={handleClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-dark transition-colors disabled:opacity-60">
                        {processing
                            ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                            : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        }
                        Guardar cambios
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function DeleteModal({ open, onClose, category }) {
    const [processing, setProcessing] = useState(false);

    const submit = () => {
        setProcessing(true);
        router.delete(route('admin.categories.destroy', category.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Eliminar Categoría">
            <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                    <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-700">¿Eliminar &quot;{category?.name}&quot;?</p>
                        <p className="text-xs text-red-500 mt-1">
                            Esta acción no se puede deshacer. La categoría se desvinculará de todas las prendas asociadas.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={submit} disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors disabled:opacity-60">
                        {processing
                            ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                            : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        }
                        Eliminar
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Index({ categories }) {
    const { flash } = usePage().props;

    const [flashMsg, setFlashMsg] = useState(flash?.success ?? null);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (flash?.success) setFlashMsg(flash.success);
    }, [flash]);

    const filtered = useMemo(() => {
        if (!search.trim()) return categories;
        const q = search.toLowerCase();
        return categories.filter((c) => c.name.toLowerCase().includes(q));
    }, [categories, search]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-brand-text">Categorías</h2>
                        <p className="text-sm text-brand-text-muted mt-0.5">
                            {categories.length} categoría{categories.length !== 1 ? 's' : ''} registrada{categories.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Categoría
                    </button>
                </div>
            }
        >
            <Head title="Categorías" />

            <div className="p-6 space-y-5">
                {/* Flash */}
                <FlashBanner message={flashMsg} onDismiss={() => setFlashMsg(null)} />

                {/* Search bar */}
                {categories.length > 0 && (
                    <div className="relative max-w-sm">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar categoría…"
                            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-9 py-2.5 text-sm text-brand-text placeholder-brand-text-light outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/30 transition shadow-sm"
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
                {categories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-brand-text-muted">
                        <svg className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="text-lg font-semibold">No hay categorías registradas</p>
                        <p className="text-sm mt-1">Creá la primera categoría para empezar</p>
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Categoría
                        </button>
                    </div>
                )}

                {/* No search results */}
                {categories.length > 0 && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-brand-text-muted">
                        <svg className="h-12 w-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="font-semibold">Sin resultados para &quot;{search}&quot;</p>
                        <button onClick={() => setSearch('')} className="mt-2 text-sm text-brand-primary hover:underline">
                            Limpiar búsqueda
                        </button>
                    </div>
                )}

                {/* Grid A-Z */}
                {filtered.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 bg-brand-primary-surface border-l-4 border-brand-secondary">
                            <span className="text-xl">🏷️</span>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-brand-primary">Todas las categorías</h3>
                                <p className="text-xs text-brand-text-light mt-0.5">
                                    {filtered.length} categoría{filtered.length !== 1 ? 's' : ''}{search ? ` — búsqueda: "${search}"` : ', ordenadas A–Z'}
                                </p>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filtered.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        category={category}
                                        onEdit={setEditTarget}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <EditModal open={editTarget !== null} onClose={() => setEditTarget(null)} category={editTarget} />
            <DeleteModal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} category={deleteTarget} />
        </AuthenticatedLayout>
    );
}
