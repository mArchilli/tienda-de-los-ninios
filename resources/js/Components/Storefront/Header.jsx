import { Link, usePage } from '@inertiajs/react';
import Logo from './Logo';

const NAV_ITEMS = [
    { label: 'Inicio', href: '/' },
    { label: 'Cat\u00e1logo', href: '/catalogo' },
];

function isActive(currentUrl, itemHref) {
    if (itemHref === '/') return currentUrl === '/';
    return currentUrl === itemHref || currentUrl.startsWith(itemHref + '/');
}

function IconButton({ children, label, badge, as: Tag = 'button', ...props }) {
    return (
        <Tag
            type={Tag === 'button' ? 'button' : undefined}
            aria-label={label}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary/20 bg-white/80 text-brand-text shadow-sm transition-colors hover:border-brand-secondary/35 hover:text-brand-primary"
            {...props}
        >
            {children}
            {badge !== undefined && badge > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-bold text-white">
                    {badge}
                </span>
            )}
        </Tag>
    );
}

function DesktopNav({ url }) {
    return (
        <nav className="hidden lg:block">
            <ul className="flex items-center gap-7">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(url, item.href);
                    return (
                        <li key={item.label}>
                            <Link
                                href={item.href}
                                className={`relative inline-flex items-center py-2 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                                    active
                                        ? 'text-brand-primary'
                                        : 'text-brand-text hover:text-brand-primary'
                                }`}
                            >
                                {item.label}
                                {active && (
                                    <span className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-brand-cta" />
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default function Header({ cartCount }) {
    const { props, url } = usePage();
    const count = cartCount ?? props?.cartCount ?? 0;

    return (
        <header className="border-b border-brand-secondary/20 bg-brand-bg/96 backdrop-blur">
            <div className="store-shell">
                <div className="grid min-h-[74px] grid-cols-[1fr_auto] items-center gap-4 py-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
                    <div className="hidden lg:flex lg:items-center lg:justify-start">
                        <DesktopNav url={url} />
                    </div>

                    <Link href="/" className="justify-self-center">
                        <Logo className="scale-[0.92] sm:scale-100" />
                    </Link>

                    <div className="flex items-center justify-end gap-2">
                        <IconButton label="Buscar">
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </IconButton>
                        <IconButton label="Mi cuenta">
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 14a4 4 0 10-8 0M12 11a3 3 0 100-6 3 3 0 000 6zM4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                            </svg>
                        </IconButton>
                        <IconButton as={Link} href="/carrito" label="Carrito" badge={count}>
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                            </svg>
                        </IconButton>
                    </div>
                </div>
            </div>
        </header>
    );
}
