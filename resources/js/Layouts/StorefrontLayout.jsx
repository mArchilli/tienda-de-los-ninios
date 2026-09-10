import { useEffect, useState } from 'react';
import TopBar from '@/Components/Storefront/TopBar';
import Header from '@/Components/Storefront/Header';
import Footer from '@/Components/Storefront/Footer';
import WhatsAppButton from '@/Components/Storefront/WhatsAppButton';
import CartButton from '@/Components/Storefront/CartButton';

// ─── StorefrontLayout ─────────────────────────────────────────────────────────
// Layout compartido para vistas de cliente: TopBar + Header + Navbar + contenido + Footer.
// Todo el sitio público debería envolverse aquí para mantener coherencia visual.

export default function StorefrontLayout({ children, cartCount = 0 }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Los botones flotantes (carrito + WhatsApp) arrancan ocultos al entrar y
    // aparecen recién cuando el usuario baja ~media pantalla (o llega al final de
    // una página corta que no da para tanto scroll).
    const [floatingRevealed, setFloatingRevealed] = useState(false);
    useEffect(() => {
        let ticking = false;
        const check = () => {
            ticking = false;
            const y = window.scrollY;
            const vh = window.innerHeight;
            const atBottom = y + vh >= document.documentElement.scrollHeight - 8;
            const should = y > vh * 0.5 || (y > 40 && atBottom);
            setFloatingRevealed((prev) => (prev === should ? prev : should));
        };
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(check);
        };
        check();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return (
        <div className="storefront-theme min-h-screen bg-brand-bg text-brand-text font-sans">
            <div className="sticky top-0 z-40">
                {!mobileMenuOpen && <TopBar />}
                <Header cartCount={cartCount} onMobileMenuChange={setMobileMenuOpen} />
            </div>
            <main className="overflow-x-hidden">{children}</main>
            <Footer />
            {!mobileMenuOpen && <CartButton revealed={floatingRevealed} />}
            {!mobileMenuOpen && <WhatsAppButton revealed={floatingRevealed} />}
        </div>
    );
}
