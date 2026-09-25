import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function glideUrl(src, w, h, fit = 'crop') {
    if (!src) return null;
    return `${src}?w=${w}&h=${h}&fit=${fit}`;
}

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function DragHandleIcon() {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
        </svg>
    );
}

function GiftIcon() {
    return (
        <svg className="h-5 w-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4 10 7-.42 1.27-1.3 2.7-2.56 3.94M6.53 6.53C4.46 7.9 2.9 9.8 2 12c1 3 5 7 10 7 1.35 0 2.62-.28 3.75-.77" />
        </svg>
    );
}

function SortableRow({ combo, position, total, onPositionChange, onToggleLanding }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: combo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const imgSrc = combo.image ? glideUrl('/' + combo.image, 120, 150) : null;

    const [positionInput, setPositionInput] = useState(String(position));

    useEffect(() => {
        setPositionInput(String(position));
    }, [position]);

    const commitPosition = () => {
        const parsed = parseInt(positionInput, 10);
        if (!Number.isFinite(parsed)) {
            setPositionInput(String(position));
            return;
        }
        const clamped = Math.min(Math.max(parsed, 1), total);
        if (clamped === position) {
            setPositionInput(String(position));
        } else {
            onPositionChange(combo.id, clamped);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-4 rounded-xl border bg-white p-3 shadow-sm transition-opacity ${
                isDragging ? 'relative z-10 border-brand-primary shadow-md' : 'border-gray-200'
            } ${combo.show_on_landing ? '' : 'opacity-60'}`}
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="flex h-9 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-brand-text-light hover:bg-gray-100 active:cursor-grabbing"
                aria-label="Arrastrar para reordenar"
            >
                <DragHandleIcon />
            </button>

            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                {imgSrc ? (
                    <img src={imgSrc} alt={combo.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand-text-light">
                        <GiftIcon />
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-text">{combo.name}</p>
                <p className="text-xs text-brand-text-muted">{fmt(combo.price)}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                {combo.is_featured && (
                    <span className="rounded-full bg-brand-cta px-2 py-0.5 text-[10px] font-bold text-white">DESTACADO</span>
                )}
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        combo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                    }`}
                >
                    {combo.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            <div className="flex shrink-0 items-center gap-2 pl-1">
                <span className="hidden items-center gap-1 text-[11px] font-medium text-brand-text-muted sm:flex">
                    {!combo.show_on_landing && <EyeOffIcon />}
                    Portada
                </span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={combo.show_on_landing}
                    aria-label={`Mostrar "${combo.name}" en el inicio`}
                    onClick={() => onToggleLanding(combo.id, !combo.show_on_landing)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        combo.show_on_landing ? 'bg-brand-primary' : 'bg-gray-300'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            combo.show_on_landing ? 'translate-x-[18px]' : 'translate-x-[2px]'
                        }`}
                    />
                </button>
            </div>

            <input
                type="number"
                inputMode="numeric"
                min={1}
                max={total}
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                onBlur={commitPosition}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                }}
                aria-label={`Posición de ${combo.name}`}
                className="w-14 shrink-0 rounded-lg border border-gray-200 py-1.5 text-center text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
        </div>
    );
}

function SectionTitleForm({ initialTitle }) {
    const [savedTitle, setSavedTitle] = useState(initialTitle);
    const [title, setTitle]           = useState(initialTitle);
    const [saving, setSaving]         = useState(false);
    const [error, setError]           = useState(null);

    const trimmed = title.trim();
    const dirty = trimmed.length > 0 && trimmed !== savedTitle;

    const handleSave = () => {
        if (!trimmed) {
            setError('El título no puede estar vacío.');
            return;
        }
        setSaving(true);
        setError(null);
        router.post(
            route('admin.combos.section-title'),
            { title: trimmed },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setSavedTitle(trimmed);
                    setTitle(trimmed);
                    setSaving(false);
                },
                onError: () => {
                    setSaving(false);
                    setError('No se pudo guardar el título. Probá de nuevo.');
                },
            }
        );
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label htmlFor="combos-section-title" className="text-xs font-semibold uppercase tracking-wide text-brand-text-muted">
                Título de la sección en el inicio
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                    id="combos-section-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                    }}
                    maxLength={120}
                    placeholder="COMBOS DE ESTA SEMANA"
                    className="w-full flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-text outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-cta-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {saving ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

export default function Order({ combos: initialCombos, sectionTitle }) {
    const { flash } = usePage().props;

    const [combos, setCombos]   = useState(initialCombos);
    const [saving, setSaving]   = useState(false);
    const [flashMsg, setFlashMsg] = useState(flash?.success ?? null);
    const [error, setError]     = useState(null);

    useEffect(() => {
        if (flash?.success) setFlashMsg(flash.success);
    }, [flash]);

    useEffect(() => {
        if (!flashMsg) return;
        const t = setTimeout(() => setFlashMsg(null), 3500);
        return () => clearTimeout(t);
    }, [flashMsg]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const persistOrder = (ordered) => {
        setSaving(true);
        setError(null);
        router.post(
            route('admin.combos.reorder'),
            { ids: ordered.map((c) => c.id) },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSaving(false),
                onError: () => {
                    setSaving(false);
                    setError('No se pudo guardar el nuevo orden. Probá de nuevo.');
                },
            }
        );
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setCombos((prev) => {
            const oldIndex = prev.findIndex((c) => c.id === active.id);
            const newIndex = prev.findIndex((c) => c.id === over.id);
            const next = arrayMove(prev, oldIndex, newIndex);
            persistOrder(next);
            return next;
        });
    };

    const handlePositionChange = (id, newPosition) => {
        setCombos((prev) => {
            const oldIndex = prev.findIndex((c) => c.id === id);
            const newIndex = newPosition - 1;
            if (oldIndex === -1 || oldIndex === newIndex) return prev;
            const next = arrayMove(prev, oldIndex, newIndex);
            persistOrder(next);
            return next;
        });
    };

    const handleToggleLanding = (id, showOnLanding) => {
        setCombos((prev) => prev.map((c) => (c.id === id ? { ...c, show_on_landing: showOnLanding } : c)));
        setError(null);
        router.post(
            route('admin.combos.toggle-landing', id),
            { show_on_landing: showOnLanding },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setCombos((prev) => prev.map((c) => (c.id === id ? { ...c, show_on_landing: !showOnLanding } : c)));
                    setError('No se pudo actualizar la visibilidad. Probá de nuevo.');
                },
            }
        );
    };

    const handleToggleLandingAll = (showOnLanding) => {
        const previous = combos;
        setCombos((prev) => prev.map((c) => ({ ...c, show_on_landing: showOnLanding })));
        setError(null);
        router.post(
            route('admin.combos.toggle-landing-all'),
            { show_on_landing: showOnLanding },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setCombos(previous);
                    setError('No se pudo actualizar la visibilidad. Probá de nuevo.');
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Orden en la portada</h1>
                        <p className="mt-0.5 text-sm text-brand-text-muted">
                            Definí el título y el orden de los combos que aparecen en el inicio.
                        </p>
                    </div>
                    <Link
                        href={route('admin.combos.index')}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
                    >
                        Volver a combos
                    </Link>
                </div>
            }
        >
            <Head title="Orden de combos" />

            <div className="space-y-4 p-6">
                {flashMsg && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                        <span className="flex-1">{flashMsg}</span>
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                        <span className="flex-1">{error}</span>
                    </div>
                )}
                <SectionTitleForm initialTitle={sectionTitle} />

                {combos.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-xs font-medium text-brand-text-muted">
                            {combos.filter((c) => c.show_on_landing).length} de {combos.length} combos visibles en el inicio
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleToggleLandingAll(true)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
                            >
                                Mostrar todos
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleLandingAll(false)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
                            >
                                Ocultar todos
                            </button>
                        </div>
                    </div>
                )}

                {saving && <p className="text-xs font-medium text-brand-text-muted">Guardando orden…</p>}

                {combos.length === 0 ? (
                    <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-brand-text-muted">
                        Todavía no hay combos cargados.
                    </p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={combos.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {combos.map((combo, index) => (
                                    <SortableRow
                                        key={combo.id}
                                        combo={combo}
                                        position={index + 1}
                                        total={combos.length}
                                        onPositionChange={handlePositionChange}
                                        onToggleLanding={handleToggleLanding}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                <p className="text-xs text-brand-text-muted">
                    Usá el interruptor «Portada» para elegir qué combos aparecen en el inicio. Los combos inactivos
                    tampoco se muestran ahí, pero podés ordenarlos y configurarlos igual para cuando los actives.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
