import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// ─── Campo de título ────────────────────────────────────────────────────────

function TitleField({ id, label, hint, value, onChange, error }) {
    return (
        <div>
            <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-brand-text-muted">
                {label}
            </label>
            {hint && <p className="mt-0.5 text-[11px] text-brand-text-light">{hint}</p>}
            <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={120}
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-brand-text outline-none transition focus:ring-2 ${
                    error ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                }`}
            />
            {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

// ─── Página ─────────────────────────────────────────────────────────────────

const SECTIONS = [
    {
        heading: 'Banner principal',
        fields: [
            { field: 'hero_title_top', label: 'Título — línea 1', hint: 'Ej: COMBOS' },
            { field: 'hero_title_bottom', label: 'Título — línea 2', hint: 'Ej: PARA ARMAR.' },
        ],
    },
    {
        heading: 'Combos de la semana',
        fields: [{ field: 'combos_title', label: 'Título de la sección' }],
    },
    {
        heading: 'Combos para emprendedores',
        fields: [{ field: 'price_range_title', label: 'Título de la sección' }],
    },
    {
        heading: 'Catálogo por categoría',
        fields: [{ field: 'catalog_title', label: 'Título de la sección' }],
    },
    {
        heading: 'Sobre nosotros',
        fields: [{ field: 'about_title', label: 'Título de la sección' }],
    },
    {
        heading: 'Reseñas de clientes',
        fields: [{ field: 'reviews_title', label: 'Título de la sección' }],
    },
    {
        heading: 'Preguntas frecuentes',
        fields: [{ field: 'faq_title', label: 'Título de la sección' }],
    },
];

export default function LandingIndex({ titles }) {
    const { flash } = usePage().props;

    const [saved, setSaved] = useState(titles);
    const [form, setForm]   = useState(titles);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [flashMsg, setFlashMsg] = useState(flash?.success ?? null);

    useEffect(() => {
        if (flash?.success) setFlashMsg(flash.success);
    }, [flash]);

    useEffect(() => {
        if (!flashMsg) return;
        const t = setTimeout(() => setFlashMsg(null), 3500);
        return () => clearTimeout(t);
    }, [flashMsg]);

    const set = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
    };

    const dirty = Object.keys(form).some((k) => form[k].trim() !== saved[k]);

    const submit = (e) => {
        e.preventDefault();

        const empty = Object.entries(form).find(([, v]) => v.trim() === '');
        if (empty) {
            setErrors({ [empty[0]]: 'El título no puede estar vacío.' });
            return;
        }

        setSaving(true);
        router.post(route('admin.landing.update'), form, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
                setSaved(trimmed);
                setForm(trimmed);
            },
            onError: (errs) => setErrors(errs),
            onFinish: () => setSaving(false),
        });
    };

    const reset = () => setForm(saved);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Títulos de la landing</h1>
                        <p className="mt-0.5 text-sm text-brand-text-muted">
                            Personalizá el título de cada sección de la página de inicio.
                        </p>
                    </div>
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
                    >
                        Ver la landing
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </Link>
                </div>
            }
        >
            <Head title="Títulos de la landing" />

            <form onSubmit={submit} className="space-y-4 p-6">
                {flashMsg && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                        <span className="flex-1">{flashMsg}</span>
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                    {SECTIONS.map((section) => (
                        <div key={section.heading} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-bold text-brand-text">{section.heading}</h2>
                            {section.fields.map(({ field, label, hint }) => (
                                <TitleField
                                    key={field}
                                    id={`landing-${field}`}
                                    label={label}
                                    hint={hint}
                                    value={form[field]}
                                    onChange={(v) => set(field, v)}
                                    error={errors[field]}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-lg">
                    <span className="text-sm text-brand-text-muted">
                        {dirty ? 'Cambios sin guardar' : 'Sin cambios pendientes'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={reset}
                            disabled={!dirty || saving}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-text hover:bg-gray-50 disabled:opacity-50"
                        >
                            Deshacer
                        </button>
                        <button
                            type="submit"
                            disabled={!dirty || saving}
                            className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-cta-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
