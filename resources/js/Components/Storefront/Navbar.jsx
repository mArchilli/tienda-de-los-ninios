import { Link, usePage } from '@inertiajs/react';

const NAV_ITEMS = [
    { label: 'Inicio', href: '/' },
    { label: 'Sobre nosotros', href: '/#about', activeBase: '/' },
    { label: 'Combos', href: '/catalogo?tipo=combos' },
    { label: 'Cat\u00e1logo', href: '/catalogo' },
];

function isActive(currentUrl, itemHref) {
    const currentBase = currentUrl.split('?')[0];
    const hrefBase = itemHref.split('?')[0].split('#')[0];

    if (itemHref.includes('?')) return currentUrl === itemHref;
    if (hrefBase === '/') return currentBase === '/';
    return currentBase === hrefBase || currentBase.startsWith(hrefBase + '/');
}

export default function Navbar() {
    const { url } = usePage();

    return (
        <nav className="border-b border-brand-secondary/20 bg-brand-bg lg:hidden">
            <div className="store-shell">
                <ul className="flex h-11 items-center justify-center gap-8 overflow-x-auto whitespace-nowrap">
                    {NAV_ITEMS.map((item) => {
                        const active = item.activeBase ? url.split('?')[0] === item.activeBase : isActive(url, item.href);
                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`relative inline-flex h-11 items-center px-1 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                                        active
                                            ? 'text-brand-primary'
                                            : 'text-brand-text hover:text-brand-primary'
                                    }`}
                                >
                                    {item.label}
                                    {active && (
                                        <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-brand-cta" />
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
