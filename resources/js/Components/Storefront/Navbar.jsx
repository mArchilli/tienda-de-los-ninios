import { Link, usePage } from '@inertiajs/react';

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Barra de navegación principal del sitio cliente: Inicio + Catálogo.
// Pensada para vivir debajo del Header. Marca el ítem activo con subrayado coral.

const NAV_ITEMS = [
    { label: 'Inicio',   href: '/'         },
    { label: 'Catálogo', href: '/catalogo' },
];

function isActive(currentUrl, itemHref) {
    if (itemHref === '/') return currentUrl === '/';
    return currentUrl === itemHref || currentUrl.startsWith(itemHref + '/');
}

export default function Navbar() {
    const { url } = usePage();

    return (
        <nav className="bg-brand-bg border-b border-brand-secondary/20">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <ul className="flex items-center justify-center gap-10 h-11">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(url, item.href);
                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`relative inline-flex h-11 items-center px-1 text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                                        active
                                            ? 'text-brand-primary'
                                            : 'text-brand-text hover:text-brand-primary'
                                    }`}
                                >
                                    {item.label}
                                    {active && (
                                        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-cta" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}
