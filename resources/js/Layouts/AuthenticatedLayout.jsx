import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function SidebarNavLink({ href, active = false, icon, expanded, children, ...props }) {
    return (
        <Link
            href={href}
            {...props}
            title={!expanded ? String(children) : undefined}
            className={
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ' +
                (active
                    ? 'bg-white/15 text-white'
                    : 'text-brand-secondary hover:bg-brand-primary-dark hover:text-white') +
                (!expanded ? ' justify-center' : '')
            }
        >
            <span className="shrink-0">{icon}</span>
            {expanded && <span className="truncate">{children}</span>}
        </Link>
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

    useEffect(() => {
        try {
            localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
        } catch {}
    }, [expanded]);

    return (
        <div className="flex min-h-screen bg-brand-bg">
            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside
                className={
                    'sticky top-0 h-screen flex flex-col flex-none bg-brand-primary transition-all duration-300 ease-in-out overflow-hidden ' +
                    (expanded ? 'w-60' : 'w-16')
                }
            >
                {/* Logo + toggle */}
                <div
                    className={
                        'flex items-center h-16 border-b border-brand-primary-dark px-3 shrink-0 ' +
                        (expanded ? 'justify-between' : 'justify-center')
                    }
                >
                    {expanded && (
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-9 w-auto fill-current text-white" />
                        </Link>
                    )}
                    <button
                        onClick={() => setExpanded((prev) => !prev)}
                        title={expanded ? 'Contraer menú' : 'Expandir menú'}
                        className="flex items-center justify-center w-8 h-8 rounded-md text-brand-secondary hover:bg-brand-primary-dark hover:text-white transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {expanded ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 5l-7 7 7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 px-2 pt-3 pb-2 overflow-y-auto">
                    {expanded ? (
                        <p className="px-3 pb-2 text-xs font-semibold tracking-widest uppercase text-brand-secondary/50 select-none">
                            Gestión
                        </p>
                    ) : (
                        <div className="border-t border-brand-primary-dark mx-1 mb-2" />
                    )}

                    <SidebarNavLink
                        href={route('dashboard')}
                        active={route().current('dashboard')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                                />
                            </svg>
                        }
                    >
                        Dashboard
                    </SidebarNavLink>

                    <SidebarNavLink
                        href={route('admin.orders.index')}
                        active={route().current('admin.orders.*')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                            </svg>
                        }
                    >
                        Pedidos
                    </SidebarNavLink>

                    <SidebarNavLink
                        href={route('admin.products.index')}
                        active={route().current('admin.products.*')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        }
                    >
                        Prendas
                    </SidebarNavLink>

                    <SidebarNavLink
                        href={route('admin.combos.index')}
                        active={route().current('admin.combos.*')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        }
                    >
                        Combos
                    </SidebarNavLink>

                    <SidebarNavLink
                        href={route('admin.categories.index')}
                        active={route().current('admin.categories.*')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                        }
                    >
                        Categorías
                    </SidebarNavLink>

                    <SidebarNavLink
                        href={route('admin.colors.index')}
                        active={route().current('admin.colors.*')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                />
                            </svg>
                        }
                    >
                        Colores
                    </SidebarNavLink>

                    <SidebarNavLink
                        href={route('admin.sizes.index')}
                        active={route().current('admin.sizes.*')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M12 17h.01M15 17h.01M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                                />
                            </svg>
                        }
                    >
                        Talles
                    </SidebarNavLink>
                </nav>

                {/* User section */}
                <div className="border-t border-brand-primary-dark px-2 py-3 space-y-1 shrink-0">
                    <SidebarNavLink
                        href="/"
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        }
                    >
                        Volver al sitio
                    </SidebarNavLink>

                    <div className="border-t border-brand-primary-dark mx-1 my-1" />

                    {expanded && (
                        <div className="px-3 py-2">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-brand-secondary truncate">{user.email}</p>
                        </div>
                    )}

                    <SidebarNavLink
                        href={route('profile.edit')}
                        active={route().current('profile.edit')}
                        expanded={expanded}
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        }
                    >
                        Perfil
                    </SidebarNavLink>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        title={!expanded ? 'Cerrar sesión' : undefined}
                        className={
                            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-secondary hover:bg-red-500/20 hover:text-red-300 transition-colors duration-150 ' +
                            (!expanded ? 'justify-center' : '')
                        }
                    >
                        <span className="shrink-0">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </span>
                        {expanded && <span className="truncate">Cerrar sesión</span>}
                    </Link>
                </div>
            </aside>

            {/* ── Main content ──────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0">
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
