import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import StarRating from '@/Components/Storefront/StarRating';

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
);

function initials(name) {
    if (!name) return '★';
    const parts = name.trim().split(/\s+/);
    const raw = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
    return raw.toUpperCase();
}

function formatDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return '';
    }
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

// ─── Delete modal ─────────────────────────────────────────────────────────────

function DeleteModal({ review, onClose }) {
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!review) return;
        const handler = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [review, onClose]);

    if (!review) return null;

    const submit = () => {
        setProcessing(true);
        router.delete(route('admin.reviews.destroy', review.id), {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-base font-bold text-brand-text">Eliminar reseña</h3>
                </div>
                <div className="space-y-4 px-6 py-5">
                    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                        <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-red-700">¿Eliminar esta reseña?</p>
                            <p className="mt-1 text-xs text-red-500">
                                Se borra definitivamente. Si sólo querés que no se vea en la web, usá el interruptor de visibilidad.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-brand-text-muted transition-colors hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:opacity-60"
                        >
                            {processing ? <Spinner /> : null}
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Visibility toggle ────────────────────────────────────────────────────────

function VisibilityToggle({ review }) {
    const [busy, setBusy] = useState(false);

    const toggle = () => {
        setBusy(true);
        router.patch(
            route('admin.reviews.update-visibility', review.id),
            { is_visible: !review.is_visible },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setBusy(false),
            },
        );
    };

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={busy}
            aria-pressed={review.is_visible}
            title={review.is_visible ? 'Visible en la web — tocá para ocultar' : 'Oculta — tocá para mostrar'}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                review.is_visible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-gray-200 bg-gray-50 text-brand-text-muted hover:bg-gray-100'
            }`}
        >
            <span
                className={`relative h-4 w-7 rounded-full transition-colors ${
                    review.is_visible ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
            >
                <span
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${
                        review.is_visible ? 'left-3.5' : 'left-0.5'
                    }`}
                />
            </span>
            {review.is_visible ? 'Visible' : 'Oculta'}
        </button>
    );
}

// ─── Review row ───────────────────────────────────────────────────────────────

function ReviewRow({ review, onDelete }) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary-surface text-sm font-bold text-brand-primary">
                {initials(review.author_name)}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm font-bold text-brand-text">{review.author_name || 'Cliente'}</p>
                    <StarRating value={review.rating} size="xs" />
                    <span className="text-xs text-brand-text-light">{formatDate(review.created_at)}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-brand-text-muted">
                    {review.body}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                <VisibilityToggle review={review} />
                <button
                    type="button"
                    onClick={() => onDelete(review)}
                    title="Eliminar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-brand-text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
    { key: 'all', label: 'Todas' },
    { key: 'visible', label: 'Visibles' },
    { key: 'hidden', label: 'Ocultas' },
];

export default function Index({ reviews, filters, counts }) {
    const { flash } = usePage().props;
    const [flashMsg, setFlashMsg] = useState(flash?.success ?? null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const searchTimeout = useRef(null);

    useEffect(() => {
        if (flash?.success) setFlashMsg(flash.success);
    }, [flash]);

    const applyFilters = (next) => {
        const params = {};
        if (next.visibility && next.visibility !== 'all') params.visibility = next.visibility;
        if (next.search) params.search = next.search;
        router.get(route('admin.reviews.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const onSearch = (value) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(
            () => applyFilters({ visibility: filters.visibility, search: value }),
            400,
        );
    };

    const list = reviews.data ?? [];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-brand-text">Reseñas</h1>
                    <p className="mt-0.5 text-sm text-brand-text-muted">
                        {counts.all} en total · {counts.visible} visible{counts.visible !== 1 ? 's' : ''} · {counts.hidden} oculta{counts.hidden !== 1 ? 's' : ''}
                    </p>
                </div>
            }
        >
            <Head title="Reseñas" />

            <div className="space-y-5 p-6">
                <FlashBanner message={flashMsg} onDismiss={() => setFlashMsg(null)} />

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                        {TABS.map((tab) => {
                            const active = (filters.visibility ?? 'all') === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => applyFilters({ visibility: tab.key, search })}
                                    className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                                        active
                                            ? 'bg-brand-primary text-white shadow-sm'
                                            : 'text-brand-text-muted hover:text-brand-primary'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`ml-1.5 text-xs ${active ? 'text-white/70' : 'text-brand-text-light'}`}>
                                        {counts[tab.key]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Buscar por texto o nombre…"
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm text-brand-text placeholder-brand-text-light shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                        />
                        {search && (
                            <button
                                onClick={() => onSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-light transition-colors hover:text-brand-text"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-brand-text-muted">
                        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-surface text-brand-primary">
                            <StarRating value={0} size="md" />
                        </span>
                        <p className="text-lg font-semibold text-brand-text">
                            {filters.search || (filters.visibility && filters.visibility !== 'all')
                                ? 'No hay reseñas con ese filtro'
                                : 'Todavía no hay reseñas'}
                        </p>
                        <p className="mt-1 text-sm">Las reseñas que dejen los clientes aparecen acá.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {list.map((review) => (
                            <ReviewRow key={review.id} review={review} onDelete={setDeleteTarget} />
                        ))}
                    </div>
                )}

                {reviews.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {reviews.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    link.active
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : link.url
                                        ? 'border border-gray-200 bg-white text-brand-text hover:bg-brand-primary-surface'
                                        : 'cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DeleteModal review={deleteTarget} onClose={() => setDeleteTarget(null)} />
        </AuthenticatedLayout>
    );
}
