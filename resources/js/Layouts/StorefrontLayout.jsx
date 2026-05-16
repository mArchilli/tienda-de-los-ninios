import TopBar from '@/Components/Storefront/TopBar';
import Header from '@/Components/Storefront/Header';
import Navbar from '@/Components/Storefront/Navbar';
import Footer from '@/Components/Storefront/Footer';
import WhatsAppButton from '@/Components/Storefront/WhatsAppButton';
import CartButton from '@/Components/Storefront/CartButton';

// ─── StorefrontLayout ─────────────────────────────────────────────────────────
// Layout compartido para vistas de cliente: TopBar + Header + Navbar + contenido + Footer.
// Todo el sitio público debería envolverse aquí para mantener coherencia visual.

export default function StorefrontLayout({ children, cartCount = 0 }) {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
            <div className="sticky top-0 z-40">
                <TopBar />
                <Header cartCount={cartCount} />
                <Navbar />
            </div>
            <main>{children}</main>
            <Footer />
            <CartButton />
            <WhatsAppButton />
        </div>
    );
}
