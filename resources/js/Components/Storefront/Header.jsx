import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Logo from './Logo';

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

function CartIconButton({ children, label, badge, as: Tag = 'button', ...props }) {
    return (
        <Tag
            type={Tag === 'button' ? 'button' : undefined}
            aria-label={label}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-cta text-white shadow-sm transition-colors hover:bg-brand-cta-dark"
            {...props}
        >
            {children}
            {badge !== undefined && badge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-text px-1 text-[10px] font-bold text-white">
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
                    const active = item.activeBase ? url.split('?')[0] === item.activeBase : isActive(url, item.href);
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

function MobileMenuButton({ open, onClick }) {
    return (
        <button
            type="button"
            aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={open}
            onClick={onClick}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-secondary/50 bg-white text-brand-text shadow-sm transition-colors hover:border-brand-primary/40 hover:text-brand-primary lg:hidden"
        >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                )}
            </svg>
        </button>
    );
}

export default function Header({ cartCount }) {
    const { props, url } = usePage();
    const count = cartCount ?? props?.cartCount ?? 0;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    return (
        <header className="border-b border-brand-secondary/20 bg-white/95 backdrop-blur-sm">
            <div className="store-shell">
                <div className="grid min-h-[74px] grid-cols-[auto_1fr_auto] items-center gap-3 py-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
                    <div className="flex items-center justify-start lg:hidden">
                        <MobileMenuButton
                            open={mobileMenuOpen}
                            onClick={() => setMobileMenuOpen((open) => !open)}
                        />
                    </div>

                    <div className="hidden lg:flex lg:items-center lg:justify-start">
                        <DesktopNav url={url} />
                    </div>

                    <Link href="/" className="justify-self-center lg:justify-self-center">
                        <Logo className="scale-[0.92] sm:scale-100" />
                    </Link>

                    <div className="flex items-center justify-end gap-2">
                        <CartIconButton as={Link} href="/carrito" label="Carrito" badge={count}>
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                            </svg>
                        </CartIconButton>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="lg:hidden">
                    <button
                        type="button"
                        aria-label="Cerrar menu"
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-brand-text/30 backdrop-blur-[1px]"
                    />

                    <div className="fixed inset-x-0 top-[74px] z-50 px-3">
                        <div className="overflow-hidden rounded-[1.15rem] border border-brand-secondary/50 bg-white shadow-[0_24px_48px_rgba(31,31,31,0.12)]">
                            <nav aria-label="Menu principal movil" className="px-3 py-3">
                                <ul className="space-y-1">
                                    {NAV_ITEMS.map((item) => {
                                        const active = item.activeBase ? url.split('?')[0] === item.activeBase : isActive(url, item.href);

                                        return (
                                            <li key={item.label}>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center justify-between rounded-[0.9rem] px-4 py-3 text-sm font-semibold transition-colors ${
                                                        active
                                                            ? 'bg-brand-primary-surface text-brand-primary'
                                                            : 'text-brand-text hover:bg-brand-secondary-light'
                                                    }`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <span>{item.label}</span>
                                                    <svg className="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
