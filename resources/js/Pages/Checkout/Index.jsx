import { Head, Link, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR') + ' ARS';
}

const PROVINCES = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes',
    'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
    'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman',
];

const COURIERS = ['Correo Argentino', 'Andreani', 'Via Cargo', 'Asesorarme por la tienda'];

function Field({ label, error, children }) {
    return (
        <label className="block text-sm">
            <span className="block font-semibold uppercase tracking-[0.08em] text-brand-text">{label}</span>
            <div className="mt-1.5">{children}</div>
            {error && <p className="mt-1 text-xs font-semibold text-brand-cta-dark">{error}</p>}
        </label>
    );
}

const inputCls =
    'w-full rounded-[1rem] border border-brand-primary/25 bg-white px-3 py-2.5 text-sm text-brand-text shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15';

function PicksList({ picksDisplay }) {
    if (!picksDisplay?.length) return null;

    return (
        <div className="mt-1.5 space-y-0.5 border-l-2 border-brand-primary/20 pl-2.5">
            {picksDisplay.map((group, i) => (
                <div key={i} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11px]">
                    <span className="shrink-0 font-bold uppercase tracking-[0.08em] text-brand-text-muted">
                        {group.category_name}:
                    </span>
                    <span className="text-brand-text">{group.products.join(', ')}</span>
                </div>
            ))}
        </div>
    );
}

function ProductsCard({ items }) {
    return (
        <section className="rounded-[1.5rem] border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.06)]">
            <div className="rounded-[1rem] border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Pedido</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Productos</h2>
            </div>

            <ul className="mt-4 divide-y divide-brand-primary/12">
                {items.map((it) => (
                    <li key={it.key} className="flex items-start gap-4 py-3">
                        {it.image ? (
                            <img
                                src={it.image}
                                alt={it.name}
                                className="h-14 w-14 shrink-0 rounded-[0.9rem] border border-brand-primary/20 bg-white object-cover"
                            />
                        ) : (
                            <div className="h-14 w-14 shrink-0 rounded-[0.9rem] border border-brand-primary/20 bg-brand-primary-surface" />
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold uppercase tracking-[0.04em] text-brand-text">{it.name}</p>
                            {it.type === 'combo' && (
                                <div className="mt-0.5 flex flex-wrap gap-1">
                                    {it.gender_name && (
                                        <span className="inline-flex items-center rounded-full border border-brand-cta/20 bg-brand-cta-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-cta">
                                            {it.gender_name}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-secondary-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-text-muted">
                                        Combo
                                    </span>
                                </div>
                            )}
                            <PicksList picksDisplay={it.picks_display} />
                            <p className="mt-1 text-xs text-brand-text-muted">
                                {it.size_name && <>Talle: {it.size_name} · </>}
                                Cantidad: {it.quantity}
                            </p>
                        </div>

                        <div className="shrink-0 text-right text-xs">
                            <p className="text-brand-text">Precio: {fmt(it.price)}</p>
                            <p className="font-bold text-brand-primary">Total: {fmt(it.subtotal)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function MethodToggle({ value, onChange }) {
    const opts = [
        {
            key: 'home',
            label: 'Envio a domicilio',
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13l9-9 9 9M5 11v9h4v-6h6v6h4v-9" />
                </svg>
            ),
        },
        {
            key: 'branch',
            label: 'Envio a sucursal',
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7l9-4 9 4M4 10h16v10H4zM9 20v-6h6v6" />
                </svg>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {opts.map((o) => {
                const active = value === o.key;

                return (
                    <button
                        key={o.key}
                        type="button"
                        onClick={() => onChange(o.key)}
                        className={`flex items-center justify-center gap-2 rounded-[1rem] border px-3 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition ${
                            active
                                ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                                : 'border-brand-primary/25 bg-white text-brand-text hover:border-brand-primary hover:text-brand-primary'
                        }`}
                    >
                        {o.icon}
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

function SummaryRow({ label, value, accent }) {
    return (
        <div className={`flex items-center justify-between rounded-[1rem] border px-4 py-3 ${accent ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-primary/25 bg-white'}`}>
            <span className={`text-sm font-semibold uppercase tracking-[0.12em] ${accent ? 'text-white' : 'text-brand-primary'}`}>{label}</span>
            <span className={`text-sm font-bold ${accent ? 'text-white text-base' : 'text-brand-text'}`}>{value}</span>
        </div>
    );
}

export default function CheckoutIndex({ cart }) {
    const items = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;

    const { data, setData, post, processing, errors } = useForm({
        shipping_method: '',
        first_name: '',
        last_name: '',
        email: '',
        dni: '',
        province: '',
        locality: '',
        postal_code: '',
        courier: '',
        address: '',
        phone: '',
        observations: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/checkout');
    };

    const isHome = data.shipping_method === 'home';
    const hasShippingMethod = data.shipping_method === 'home' || data.shipping_method === 'branch';

    const requiredFields = ['first_name', 'last_name', 'email', 'dni', 'province', 'locality', 'postal_code', 'courier', 'phone'];
    if (isHome) requiredFields.push('address');
    const allFieldsFilled = hasShippingMethod && requiredFields.every((f) => String(data[f] ?? '').trim() !== '');
    const isFormComplete = hasShippingMethod && allFieldsFilled;

    return (
        <StorefrontLayout>
            <Head title="Checkout · La Tienda de los Niños" />

            <form onSubmit={submit} className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <span className="inline-flex rounded-full border border-brand-primary/25 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                        Checkout
                    </span>
                    <h1 className="home-section-title mt-3">
                        Finalizar compra
                    </h1>
                    <p className="mt-1 text-sm text-brand-text-muted">
                        Completa tus datos para continuar con el pedido.
                    </p>
                </div>

                <div className="mb-6">
                    <Link
                        href="/carrito"
                        className="inline-flex items-center gap-2 rounded-full border border-brand-primary/35 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-primary shadow-sm transition-colors hover:bg-brand-primary hover:text-white"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver al carrito
                    </Link>
                </div>

                <div className="mb-6 rounded-[1.4rem] border border-brand-primary/25 bg-white p-5 shadow-[0_4px_18px_rgba(41,50,65,0.07)]">
                    <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-brand-text">
                        ¿Cómo funciona?
                    </p>

                    <ol className="mt-4 space-y-3">
                        <li className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${hasShippingMethod ? 'bg-[#25D366] text-white' : 'border-2 border-brand-primary/30 text-brand-primary/60'}`}>
                                {hasShippingMethod ? (
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : '1'}
                            </span>
                            <span className={`text-sm font-semibold transition-colors ${hasShippingMethod ? 'text-[#25D366]' : 'text-brand-text'}`}>
                                Elegí un método de envío <span className="font-normal text-brand-text-muted">(domicilio o sucursal)</span>
                            </span>
                        </li>

                        <li className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${allFieldsFilled ? 'bg-[#25D366] text-white' : 'border-2 border-brand-primary/30 text-brand-primary/60'}`}>
                                {allFieldsFilled ? (
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : '2'}
                            </span>
                            <span className={`text-sm font-semibold transition-colors ${allFieldsFilled ? 'text-[#25D366]' : 'text-brand-text'}`}>
                                Completá todos los campos del formulario
                            </span>
                        </li>

                        <li className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary/20 text-xs font-bold text-brand-primary/40">3</span>
                            <span className="pt-0.5 text-sm text-brand-text-muted">
                                Al confirmar, tu pedido se enviará por <span className="font-semibold text-[#25D366]">WhatsApp</span> a la tienda.
                            </span>
                        </li>

                        <li className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary/20 text-xs font-bold text-brand-primary/40">4</span>
                            <span className="pt-0.5 text-sm text-brand-text-muted">
                                Coordinamos el envío y te informamos el costo.
                            </span>
                        </li>

                        <li className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary/20 text-xs font-bold text-brand-primary/40">5</span>
                            <span className="pt-0.5 text-sm text-brand-text-muted">
                                Una vez cerrado el envío, se acuerda el pago.
                            </span>
                        </li>
                    </ol>

                    <p className={`mt-4 text-xs font-semibold transition-colors ${isFormComplete ? 'text-[#25D366]' : 'text-brand-text-muted'}`}>
                        {isFormComplete
                            ? '¡Todo listo! Ya podés enviar tu pedido.'
                            : 'El botón "Enviar mi pedido" se habilitará cuando completes los pasos 1 y 2.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <section className="rounded-[1.5rem] border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.06)]">
                            <div className="rounded-[1rem] border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Envio</p>
                                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Informacion de envio</h2>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-text">
                                    Metodo de envio <span className="font-normal normal-case tracking-normal text-brand-text-muted">(A cargo del comprador)</span>
                                </p>
                                <p className="mt-1 text-xs text-brand-text-muted">
                                    En ambos casos nos comunicaremos con usted para informarle el importe del envio.
                                </p>
                                <div className="mt-3">
                                    <MethodToggle value={data.shipping_method} onChange={(v) => setData('shipping_method', v)} />
                                </div>
                                {errors.shipping_method && (
                                    <p className="mt-2 text-xs font-semibold text-brand-cta-dark">{errors.shipping_method}</p>
                                )}
                                <div className="mt-3 rounded-[1rem] border border-brand-primary/18 bg-brand-primary-surface px-3 py-2 text-xs text-brand-text-muted">
                                    {!hasShippingMethod
                                        ? 'Eligi donde queres que te enviemos el pedido.'
                                        : isHome
                                            ? 'Te contactaremos luego de la compra para coordinar el envio y su costo.'
                                            : 'Te contactaremos luego de la compra para coordinar la sucursal de retiro y el costo.'}
                                </div>
                            </div>

                            {hasShippingMethod && (
                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field label="Nombre" error={errors.first_name}>
                                        <input className={inputCls} value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                    </Field>
                                    <Field label="Apellido" error={errors.last_name}>
                                        <input className={inputCls} value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                                    </Field>
                                    <Field label="Correo electronico" error={errors.email}>
                                        <input type="email" className={inputCls} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    </Field>
                                    <Field label="DNI" error={errors.dni}>
                                        <input className={inputCls} value={data.dni} onChange={(e) => setData('dni', e.target.value)} />
                                    </Field>
                                    <Field label="Provincia" error={errors.province}>
                                        <select className={inputCls} value={data.province} onChange={(e) => setData('province', e.target.value)}>
                                            <option value="">Seleccione una provincia</option>
                                            {PROVINCES.map((p) => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Localidad" error={errors.locality}>
                                        <input
                                            className={inputCls}
                                            value={data.locality}
                                            onChange={(e) => setData('locality', e.target.value)}
                                            placeholder="Ingresa tu localidad"
                                        />
                                    </Field>
                                    <Field label="Codigo postal" error={errors.postal_code}>
                                        <input className={inputCls} value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                                    </Field>
                                    <Field label="Empresa de correo" error={errors.courier}>
                                        <select className={inputCls} value={data.courier} onChange={(e) => setData('courier', e.target.value)}>
                                            <option value="">Seleccione una empresa</option>
                                            {COURIERS.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </Field>

                                    {isHome && (
                                        <Field label="Direccion" error={errors.address}>
                                            <input className={inputCls} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                        </Field>
                                    )}

                                    <Field label="Telefono de contacto" error={errors.phone}>
                                        <input className={inputCls} value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="1123456789" />
                                    </Field>

                                    {isHome && (
                                        <div className="sm:col-span-2">
                                            <Field label="Observaciones (opcional)" error={errors.observations}>
                                                <textarea
                                                    rows={3}
                                                    className={inputCls}
                                                    value={data.observations}
                                                    onChange={(e) => setData('observations', e.target.value)}
                                                    placeholder="Agregue cualquier observacion o instruccion especial para la entrega"
                                                />
                                            </Field>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <ProductsCard items={items} />
                    </div>

                    <aside className="space-y-3 self-start rounded-[1.5rem] border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.08)]">
                        <div className="rounded-[1rem] border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Resumen</p>
                            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Tu compra</h2>
                        </div>

                        <SummaryRow label="Subtotal" value={fmt(subtotal)} />
                        <SummaryRow label="Envio" value="A confirmar" />
                        <SummaryRow label="Total" value={fmt(subtotal)} accent />

                        <button
                            type="submit"
                            disabled={processing || !isFormComplete}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#1ebe5d] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            {processing ? 'Procesando...' : 'Enviar mi pedido'}
                        </button>
                    </aside>
                </div>
            </form>
        </StorefrontLayout>
    );
}
