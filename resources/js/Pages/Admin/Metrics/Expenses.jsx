import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n) {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function digitsToArs(digits) {
    if (!digits) return '';
    return Number(digits).toLocaleString('es-AR');
}

// Ganancia (verde) si el neto es positivo, pérdida (rojo) si todavía no
// cubrimos los gastos, y neutro (amarillo) si los cubrimos justo (neto = 0).
function netProfitState(net) {
    const n = Number(net) || 0;
    if (n > 0.005) return 'positive';
    if (n < -0.005) return 'negative';
    return 'neutral';
}

const NET_STATE = {
    positive: { text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Ganancia' },
    negative: { text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Pérdida' },
    neutral:  { text: 'text-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Neutro' },
};

function PesoInput({ value, onChange, id, autoFocus }) {
    const digits = value === '' || value === null || value === undefined ? '' : String(Math.trunc(Number(value) || 0));

    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand-text-light">$</span>
            <input
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoFocus={autoFocus}
                value={digitsToArs(digits)}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-6 pr-3 text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
        </div>
    );
}

const EMPTY_FORM = { title: '', amount: '', type: 'variable' };

// ─── Formulario (alta / edición) ────────────────────────────────────────────────

function ExpenseForm({ month, editing, onDone }) {
    const [form, setForm] = useState(editing ?? EMPTY_FORM);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const formRef = useRef(null);

    useEffect(() => {
        if (editing) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [editing]);

    const set = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const payload = { title: form.title, amount: parseInt(form.amount, 10) || 0, type: form.type };
        const options = {
            preserveScroll: true,
            onSuccess: () => { setForm(EMPTY_FORM); onDone?.(); },
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        };

        if (editing) {
            router.put(route('admin.metrics.expenses.update', editing.id), payload, options);
        } else {
            router.post(route('admin.metrics.expenses.store'), { ...payload, month }, options);
        }
    };

    return (
        <form ref={formRef} onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm scroll-mt-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-brand-text">{editing ? 'Editar gasto' : 'Nuevo gasto'}</h2>
                {editing && (
                    <button type="button" onClick={onDone} className="text-xs font-semibold text-brand-text-muted hover:text-brand-text">
                        Cancelar
                    </button>
                )}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                <div>
                    <label htmlFor="expense-title" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-text-muted">
                        Título
                    </label>
                    <input
                        id="expense-title"
                        type="text"
                        value={form.title}
                        onChange={(e) => set('title', e.target.value)}
                        placeholder="Ej: Alquiler del local"
                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-brand-text outline-none transition focus:ring-2 ${
                            errors.title ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'
                        }`}
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                </div>

                <div>
                    <label htmlFor="expense-amount" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-text-muted">
                        Monto
                    </label>
                    <PesoInput id="expense-amount" value={form.amount} onChange={(v) => set('amount', v)} />
                    {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-brand-text-muted">Tipo</label>
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
                        {[{ value: 'variable', label: 'Variable' }, { value: 'fixed', label: 'Fijo' }].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => set('type', opt.value)}
                                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                                    form.type === opt.value ? 'bg-brand-primary text-white' : 'text-brand-text-muted hover:text-brand-text'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {form.type === 'fixed' && (
                <p className="mt-2 text-xs text-brand-text-muted">
                    Los gastos fijos quedan marcados como recurrentes; usá &quot;Copiar gastos fijos del mes anterior&quot; para no tener que volver a cargarlos cada mes.
                </p>
            )}

            <div className="mt-3 flex justify-end">
                <button
                    type="submit"
                    disabled={processing || !form.title || !form.amount}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar gasto'}
                </button>
            </div>
        </form>
    );
}

// ─── Fila de gasto ─────────────────────────────────────────────────────────────

function ExpenseRow({ expense, onEdit }) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const destroy = () => {
        setDeleting(true);
        router.delete(route('admin.metrics.expenses.destroy', expense.id), {
            preserveScroll: true,
            onFinish: () => { setDeleting(false); setConfirming(false); },
        });
    };

    return (
        <li className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0 truncate text-sm font-medium text-brand-text">{expense.title}</span>

            <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-bold text-brand-text">{fmtMoney(expense.amount)}</span>

                {confirming ? (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={destroy}
                            disabled={deleting}
                            className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                        >
                            {deleting ? '...' : 'Confirmar'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            className="rounded-md border border-gray-200 px-2 py-1 text-[11px] font-semibold text-brand-text-muted hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onEdit(expense)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-brand-text-muted hover:bg-gray-100 hover:text-brand-primary"
                            aria-label={`Editar ${expense.title}`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirming(true)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-brand-text-muted hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Eliminar ${expense.title}`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
}

function ExpenseSection({ title, note, items, total, onEdit, emptyText }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div>
                    <h3 className="text-sm font-bold text-brand-text">{title}</h3>
                    {note && <p className="text-[11px] text-brand-text-muted">{note}</p>}
                </div>
                <span className="text-sm font-bold text-brand-text">{fmtMoney(total)}</span>
            </div>
            {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-brand-text-muted">{emptyText}</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {items.map((e) => <ExpenseRow key={e.id} expense={e} onEdit={onEdit} />)}
                </ul>
            )}
        </div>
    );
}

// ─── Página ─────────────────────────────────────────────────────────────────────

export default function MetricsExpenses({
    selectedPeriod,
    selectedLabel,
    availableMonths = [],
    grossRevenue,
    expenses,
    netRevenue,
    canCopyFixed,
    previousMonthLabel,
}) {
    const [editing, setEditing] = useState(null);
    const [copying, setCopying] = useState(false);

    const navigateMonth = (month) => {
        router.get(route('admin.metrics.expenses'), { month }, { preserveScroll: true, preserveState: true });
    };

    const copyFixed = () => {
        setCopying(true);
        router.post(route('admin.metrics.expenses.copy-fixed'), { month: selectedPeriod }, {
            preserveScroll: true,
            onFinish: () => setCopying(false),
        });
    };

    const fixedItems = expenses.items.filter((e) => e.type === 'fixed');
    const variableItems = expenses.items.filter((e) => e.type === 'variable');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                            <Link href={route('admin.metrics.index', { month: selectedPeriod })} className="hover:text-brand-primary">
                                ← Volver a métricas
                            </Link>
                        </div>
                        <h1 className="mt-1 text-xl font-bold text-brand-text">Gastos</h1>
                        <p className="text-sm text-brand-text-muted">Fijos y variables — se restan del Facturado (Bruto) para calcular el Neto</p>
                    </div>

                    <select
                        value={selectedPeriod}
                        onChange={(e) => navigateMonth(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-semibold text-brand-text shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                    >
                        {availableMonths.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            }
        >
            <Head title={`Gastos — ${selectedLabel}`} />

            <div className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Facturado (Bruto)</p>
                        <p className="mt-1 text-xl font-bold text-brand-cta">{fmtMoney(grossRevenue)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Gastos</p>
                        <p className="mt-1 text-xl font-bold text-rose-600">− {fmtMoney(expenses.total)}</p>
                        <p className="text-[11px] text-brand-text-muted">Fijos {fmtMoney(expenses.fixed_total)} · Variables {fmtMoney(expenses.variable_total)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Facturación Neta</p>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${NET_STATE[netProfitState(netRevenue)].badge}`}>
                                {NET_STATE[netProfitState(netRevenue)].label}
                            </span>
                        </div>
                        <p className={`mt-1 text-xl font-bold ${NET_STATE[netProfitState(netRevenue)].text}`}>{fmtMoney(netRevenue)}</p>
                    </div>
                </div>

                <ExpenseForm key={editing?.id ?? 'new'} month={selectedPeriod} editing={editing} onDone={() => setEditing(null)} />

                {canCopyFixed && (
                    <button
                        type="button"
                        onClick={copyFixed}
                        disabled={copying}
                        className="inline-flex items-center gap-2 rounded-lg border border-brand-primary/30 bg-brand-primary-surface px-3 py-2 text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:opacity-60"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {copying ? 'Copiando…' : `Copiar gastos fijos de ${previousMonthLabel}`}
                    </button>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <ExpenseSection
                        title="Gastos fijos"
                        note="Se repiten todos los meses (alquiler, sueldos, etc.)"
                        items={fixedItems}
                        total={expenses.fixed_total}
                        onEdit={setEditing}
                        emptyText="Todavía no cargaste gastos fijos para este mes."
                    />
                    <ExpenseSection
                        title="Gastos variables"
                        note="Puntuales de este mes"
                        items={variableItems}
                        total={expenses.variable_total}
                        onEdit={setEditing}
                        emptyText="Todavía no cargaste gastos variables para este mes."
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
