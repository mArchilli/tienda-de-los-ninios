import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

// ─── Confirmación de pedido ───────────────────────────────────────────────────
// Al montar, intenta abrir WhatsApp (app en mobile, WhatsApp Web en desktop)
// con el mensaje del pedido ya prellenado. Muestra un botón de respaldo por si
// el navegador bloquea el popup. El carrito ya quedó vacío en el backend.

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR') + ' ARS';
}

function PicksList({ picksDisplay }) {
    if (!picksDisplay?.length) return null;
    return (
        <div className="mt-1 space-y-0.5 border-l-2 border-brand-primary/20 pl-2.5">
            {picksDisplay.map((group, i) => (
                <div key={i} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11px]">
                    <span className="font-bold uppercase tracking-[0.08em] text-brand-text-muted shrink-0">
                        {group.category_name}:
                    </span>
                    <span className="text-brand-text">{group.products.join(', ')}</span>
                </div>
            ))}
        </div>
    );
}

export default function Confirmation({ order, items = [], whatsapp_url, whatsapp_message }) {
    const [opened, setOpened] = useState(false);
    const openedRef = useRef(false);

    useEffect(() => {
        if (!whatsapp_url || openedRef.current) return;
        openedRef.current = true;
        // Intento de apertura automática. Si el navegador lo bloquea, el usuario
        // tiene el botón "Abrir WhatsApp" más abajo como fallback.
        const win = window.open(whatsapp_url, '_blank', 'noopener,noreferrer');
        if (win) setOpened(true);
    }, [whatsapp_url]);

    const openWhatsapp = () => {
        if (!whatsapp_url) return;
        window.open(whatsapp_url, '_blank', 'noopener,noreferrer');
        setOpened(true);
    };

    return (
        <StorefrontLayout>
            <Head title="Pedido generado · La Tienda de los Niños" />

            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
                <section className="rounded-2xl border border-brand-secondary/30 bg-white p-8 shadow-sm text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-surface">
                        <svg className="h-9 w-9 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="mt-4 text-2xl font-bold bg-gradient-to-r from-purple-600 to-brand-primary bg-clip-text text-transparent">
                        ¡Pedido generado!
                    </h1>
                    <p className="mt-2 text-sm text-brand-text-muted">
                        Tu pedido <span className="font-semibold text-brand-text">#{order?.id}</span> fue creado correctamente y está
                        <span className="font-semibold text-brand-text"> pendiente de confirmación</span>.
                    </p>

                    <div className="mt-6 rounded-xl border border-brand-secondary/30 bg-brand-secondary-surface px-5 py-4 text-left">
                        <p className="text-sm text-brand-text">
                            <span className="font-semibold">Para confirmarlo, enviá el WhatsApp</span> con el resumen
                            del pedido que se abre automáticamente. Si no se abrió,
                            tocá el botón de abajo.
                        </p>
                    </div>

                    {items.length > 0 && (
                        <div className="mt-6 rounded-xl border border-brand-secondary/30 bg-white px-4 py-3 text-left">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-text-muted mb-3">
                                Detalle del pedido
                            </p>
                            <ul className="divide-y divide-brand-secondary/30">
                                {items.map((it, i) => (
                                    <li key={i} className="flex items-start gap-3 py-2.5">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <p className="text-sm font-bold text-brand-text">{it.name}</p>
                                                {it.type === 'combo' && (
                                                    <span className="inline-flex items-center border border-brand-primary/20 bg-brand-secondary-surface px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-text-muted">
                                                        Combo
                                                    </span>
                                                )}
                                                {it.gender_name && (
                                                    <span className="inline-flex items-center border border-brand-cta/20 bg-brand-cta-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-cta">
                                                        {it.gender_name}
                                                    </span>
                                                )}
                                            </div>
                                            {it.size_name && (
                                                <p className="mt-0.5 text-xs text-brand-text-muted">Talle: {it.size_name}</p>
                                            )}
                                            <PicksList picksDisplay={it.picks_display} />
                                        </div>
                                        <div className="shrink-0 text-right text-xs">
                                            <p className="text-brand-text-muted">x{it.quantity}</p>
                                            <p className="font-bold text-brand-primary">{fmt(it.subtotal)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={openWhatsapp}
                        disabled={!whatsapp_url}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white shadow hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        {opened ? 'Volver a abrir WhatsApp' : 'Abrir WhatsApp'}
                    </button>

                    {!whatsapp_url && (
                        <p className="mt-3 text-xs text-brand-cta-dark font-semibold">
                            El número de WhatsApp del negocio no está configurado. Contactá al
                            administrador del sitio.
                        </p>
                    )}

                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm font-semibold text-brand-primary">
                            Ver mensaje del pedido
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-brand-secondary/30 bg-white px-4 py-3 text-xs text-brand-text">
{whatsapp_message}
                        </pre>
                    </details>

                    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                        <Link
                            href="/catalogo"
                            className="rounded-full border border-brand-secondary/40 px-5 py-2 font-semibold text-brand-text hover:border-brand-primary transition"
                        >
                            Seguir comprando
                        </Link>
                    </div>

                    {order && (
                        <div className="mt-6 rounded-xl border border-brand-secondary/30 bg-white px-4 py-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-brand-text-muted">Total del pedido</span>
                                <span className="font-bold text-brand-primary">{fmt(order.total)}</span>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </StorefrontLayout>
    );
}
