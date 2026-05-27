import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// ─── Iconos (heroicons-style outline) ──────────────────────────────────
const Icon = {
    Dashboard: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    ),
    Pedidos: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
    ),
    Metricas: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
    ),
    Prendas: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 4 4 5.5 2.5 9.5 5.5 11v9.25c0 .414.336.75.75.75h11.5c.414 0 .75-.336.75-.75V11l3-1.5L20 5.5 16 4c0 1.657-1.79 3-4 3s-4-1.343-4-3Z" />
        </svg>
    ),
    Combos: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
    ),
    Categorias: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
    ),
    Colores: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
        </svg>
    ),
    Talles: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25h18v7.5H3v-7.5Zm3.75 0v3m3-3v4.5m3-4.5v3m3-3v4.5m3-4.5v3" />
        </svg>
    ),
    Volver: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
    ),
    Perfil: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    ),
    Logout: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
        </svg>
    ),
    Hamburger: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    ),
    Close: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    ),
    CollapseLeft: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 5l-7 7 7 7" />
        </svg>
    ),
    CollapseRight: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
        </svg>
    ),
};

// ─── Link de navegación con tooltip cuando está colapsado ─────────────
function SidebarNavLink({ href, active = false, icon, expanded, children, onClick }) {
    const link = (
        <Link
            href={href}
            onClick={onClick}
            className={
                'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ' +
                (active
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-brand-secondary hover:bg-brand-primary-dark hover:text-white') +
                (!expanded ? ' justify-center' : '')
            }
        >
            {active && expanded && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-cta" />
            )}
            <span className="shrink-0">{icon}</span>
            {expanded && <span className="truncate">{children}</span>}
        </Link>
    );

    if (expanded) return link;

    return (
        <div className="relative group">
            {link}
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 whitespace-nowrap rounded-md bg-brand-text px-2.5 py-1.5 text-xs font-medium text-white shadow-lg opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                {children}
            </span>
        </div>
    );
}

// ─── Botón de logout (mismo estilo + tooltip) ──────────────────────────
function SidebarLogout({ expanded, onClick }) {
    const button = (
        <Link
            href={route('logout')}
            method="post"
            as="button"
            onClick={onClick}
            className={
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-secondary hover:bg-red-500/15 hover:text-red-300 transition-colors duration-150 ' +
                (!expanded ? 'justify-center' : '')
            }
        >
            <span className="shrink-0">{Icon.Logout}</span>
            {expanded && <span className="truncate">Cerrar sesión</span>}
        </Link>
    );

    if (expanded) return button;

    return (
        <div className="relative group">
            {button}
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 whitespace-nowrap rounded-md bg-brand-text px-2.5 py-1.5 text-xs font-medium text-white shadow-lg opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
                Cerrar sesión
            </span>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [expanded, setExpanded] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebarExpanded');
            return saved !== null ? JSON.parse(saved) : true;
        } catch {
            return true;
        }
    });

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
        } catch {}
    }, [expanded]);

    // Bloquea el scroll del body cuando el menú móvil está abierto
    useEffect(() => {
        if (mobileOpen) {
            const original = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = original;
            };
        }
    }, [mobileOpen]);

    // Cierra el menú móvil al pulsar Escape
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mobileOpen]);

    const closeMobile = () => setMobileOpen(false);

    // ─── Items de navegación (compartidos por desktop y mobile) ────────
    const navItems = [
        { href: route('dashboard'), active: route().current('dashboard'), icon: Icon.Dashboard, label: 'Dashboard' },
        { href: route('admin.orders.index'), active: route().current('admin.orders.*'), icon: Icon.Pedidos, label: 'Pedidos' },
        { href: route('admin.metrics.index'), active: route().current('admin.metrics.*'), icon: Icon.Metricas, label: 'Métricas' },
        { href: route('admin.products.index'), active: route().current('admin.products.*'), icon: Icon.Prendas, label: 'Prendas' },
        { href: route('admin.combos.index'), active: route().current('admin.combos.*'), icon: Icon.Combos, label: 'Combos' },
        { href: route('admin.categories.index'), active: route().current('admin.categories.*'), icon: Icon.Categorias, label: 'Categorías' },
        { href: route('admin.colors.index'), active: route().current('admin.colors.*'), icon: Icon.Colores, label: 'Colores' },
        { href: route('admin.sizes.index'), active: route().current('admin.sizes.*'), icon: Icon.Talles, label: 'Talles' },
    ];

    return (
        <div className="flex min-h-screen bg-brand-bg">
            {/* ── Sidebar desktop ───────────────────────────────────────── */}
            <aside
                className={
                    'hidden md:flex sticky top-0 h-screen flex-col flex-none bg-brand-primary shadow-xl shadow-brand-primary/10 transition-all duration-300 ease-in-out overflow-hidden ' +
                    (expanded ? 'w-60' : 'w-16')
                }
            >
                {/* Logo + toggle */}
                <div
                    className={
                        'flex items-center h-16 border-b border-brand-primary-dark/60 px-3 shrink-0 ' +
                        (expanded ? 'justify-between' : 'justify-center')
                    }
                >
                    {expanded && (
                        <Link href="/" className="flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="La Tienda de los Niños"
                                className="h-10 w-auto select-none"
                            />
                        </Link>
                    )}
                    <button
                        onClick={() => setExpanded((prev) => !prev)}
                        title={expanded ? 'Contraer menú' : 'Expandir menú'}
                        className="flex items-center justify-center w-8 h-8 rounded-md text-brand-secondary hover:bg-brand-primary-dark hover:text-white transition-colors"
                    >
                        {expanded ? Icon.CollapseLeft : Icon.CollapseRight}
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-2 pt-4 pb-2 space-y-0.5">
                    {expanded ? (
                        <p className="px-3 pb-2 text-[11px] font-semibold tracking-widest uppercase text-brand-secondary/60 select-none">
                            Gestión
                        </p>
                    ) : (
                        <div className="border-t border-brand-primary-dark/60 mx-2 mb-2" />
                    )}

                    {navItems.map((item) => (
                        <SidebarNavLink
                            key={item.label}
                            href={item.href}
                            active={item.active}
                            icon={item.icon}
                            expanded={expanded}
                        >
                            {item.label}
                        </SidebarNavLink>
                    ))}
                </nav>

                {/* Usuario / acciones */}
                <div className="border-t border-brand-primary-dark/60 px-2 py-3 space-y-0.5 shrink-0">
                    <SidebarNavLink
                        href="/"
                        expanded={expanded}
                        icon={Icon.Volver}
                    >
                        Volver al sitio
                    </SidebarNavLink>

                    {expanded && (
                        <div className="mt-3 mb-2 mx-1 rounded-lg bg-brand-primary-dark/40 px-3 py-2">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-brand-secondary truncate">{user.email}</p>
                        </div>
                    )}

                    {!expanded && <div className="border-t border-brand-primary-dark/60 mx-2 my-2" />}

                    <SidebarNavLink
                        href={route('profile.edit')}
                        active={route().current('profile.edit')}
                        expanded={expanded}
                        icon={Icon.Perfil}
                    >
                        Perfil
                    </SidebarNavLink>

                    <SidebarLogout expanded={expanded} />
                </div>
            </aside>

            {/* ── Topbar mobile ─────────────────────────────────────────── */}
            <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between h-14 px-4 bg-brand-primary border-b border-brand-primary-dark/60 shadow-md">
                <Link href="/" className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="La Tienda de los Niños"
                        className="h-9 w-auto select-none"
                    />
                </Link>
                <button
                    onClick={() => setMobileOpen(true)}
                    aria-label="Abrir menú"
                    className="flex items-center justify-center w-10 h-10 rounded-md text-brand-secondary hover:bg-brand-primary-dark hover:text-white transition-colors"
                >
                    {Icon.Hamburger}
                </button>
            </header>

            {/* ── Menú fullscreen mobile ────────────────────────────────── */}
            <div
                className={
                    'md:hidden fixed inset-0 z-50 bg-brand-primary flex flex-col transition-all duration-200 ' +
                    (mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none')
                }
            >
                <div className="flex items-center justify-between h-14 px-4 border-b border-brand-primary-dark/60 shrink-0">
                    <Link href="/" onClick={closeMobile} className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="La Tienda de los Niños"
                            className="h-9 w-auto select-none"
                        />
                    </Link>
                    <button
                        onClick={closeMobile}
                        aria-label="Cerrar menú"
                        className="flex items-center justify-center w-10 h-10 rounded-md text-brand-secondary hover:bg-brand-primary-dark hover:text-white transition-colors"
                    >
                        {Icon.Close}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-1">
                    <p className="px-3 pb-2 text-[11px] font-semibold tracking-widest uppercase text-brand-secondary/60 select-none">
                        Gestión
                    </p>

                    {navItems.map((item) => (
                        <SidebarNavLink
                            key={item.label}
                            href={item.href}
                            active={item.active}
                            icon={item.icon}
                            expanded
                            onClick={closeMobile}
                        >
                            {item.label}
                        </SidebarNavLink>
                    ))}
                </nav>

                <div className="border-t border-brand-primary-dark/60 px-3 py-3 space-y-1 shrink-0">
                    <SidebarNavLink href="/" expanded icon={Icon.Volver} onClick={closeMobile}>
                        Volver al sitio
                    </SidebarNavLink>

                    <div className="mt-3 mb-2 mx-1 rounded-lg bg-brand-primary-dark/40 px-3 py-2">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-brand-secondary truncate">{user.email}</p>
                    </div>

                    <SidebarNavLink
                        href={route('profile.edit')}
                        active={route().current('profile.edit')}
                        expanded
                        icon={Icon.Perfil}
                        onClick={closeMobile}
                    >
                        Perfil
                    </SidebarNavLink>

                    <SidebarLogout expanded onClick={closeMobile} />
                </div>
            </div>

            {/* ── Contenido principal ───────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 pt-14 md:pt-0">
                {header && (
                    <header className="bg-white border-b border-gray-200 shadow-sm">
                        <div className="px-4 py-5 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
