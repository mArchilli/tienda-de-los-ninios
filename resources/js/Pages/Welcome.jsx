import { Head } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import Hero from '@/Components/Storefront/Hero';
import PriceRangeSection from '@/Components/Storefront/PriceRangeSection';
import FeaturedCombos from '@/Components/Storefront/FeaturedCombos';
import TrustBanner from '@/Components/Storefront/TrustBanner';
import CategoryShortcuts from '@/Components/Storefront/CategoryShortcuts';
import FeaturedProducts from '@/Components/Storefront/FeaturedProducts';

export default function Welcome({ featuredCombos, featuredProducts, heroImage, cartCount }) {
    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title="Mimos · Combos y ropa para los más chicos" />

            <Hero image={heroImage} />
            <FeaturedCombos combos={featuredCombos} />
            <PriceRangeSection />
            <TrustBanner />
            <CategoryShortcuts />
            <FeaturedProducts products={featuredProducts} />
        </StorefrontLayout>
    );
}
