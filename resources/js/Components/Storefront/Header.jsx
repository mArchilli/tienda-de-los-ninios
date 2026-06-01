import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import CartIcon from './CartIcon';

const MOBILE_NAV_ITEMS = [
    { label: 'Inicio', href: '/' },
    { label: 'Cat\u00e1logo', href: '/catalogo' },
    { label: 'Contacto', href: '/contacto' },
    { label: 'Carrito', href: '/carrito' },
];

const DESKTOP_NAV_ITEMS = MOBILE_NAV_ITEMS.filter((item) => item.href !== '/carrito');

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
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-bold text-white">
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
                {DESKTOP_NAV_ITEMS.map((item) => {
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

export default function Header({ cartCount, onMobileMenuChange }) {
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

        onMobileMenuChange?.(mobileMenuOpen);

        return () => {
            document.body.style.overflow = '';
            onMobileMenuChange?.(false);
        };
    }, [mobileMenuOpen, onMobileMenuChange]);

    return (
        <header className="border-b border-brand-cta/45 bg-white/95 backdrop-blur-sm">
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
                            <CartIcon className="h-[18px] w-[18px]" />
                        </CartIconButton>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex min-h-screen flex-col bg-brand-cta lg:hidden">
                    <button
                        type="button"
                        aria-label="Cerrar menu"
                        onClick={() => setMobileMenuOpen(false)}
                        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/55 bg-white/10 text-white transition-colors hover:bg-white/15"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <nav aria-label="Menu principal movil" className="flex flex-1 items-start justify-center px-6 pb-10 pt-24">
                        <div className="flex w-full max-w-sm flex-col items-center">
                            <Link href="/" className="mb-10" onClick={() => setMobileMenuOpen(false)}>
                                <Logo className="scale-[0.98] text-white sm:scale-100" />
                            </Link>

                            <ul className="flex w-full flex-col gap-4">
                                {MOBILE_NAV_ITEMS.map((item) => {
                                    const active = item.activeBase ? url.split('?')[0] === item.activeBase : isActive(url, item.href);

                                    return (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center justify-between rounded-[1.6rem] border px-6 py-4 text-base font-semibold uppercase tracking-[0.18em] transition-colors ${
                                                    active
                                                        ? 'border-white bg-white text-brand-cta'
                                                        : 'border-white/45 bg-white/10 text-white hover:bg-white/16'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <span>{item.label}</span>
                                                <svg className="h-5 w-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            <Link
                                href="/login"
                                className="mt-10 text-xs text-white/35 hover:text-white/60 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Ingresar
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
