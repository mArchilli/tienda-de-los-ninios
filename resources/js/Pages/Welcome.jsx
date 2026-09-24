import { Head } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import Hero from '@/Components/Storefront/Hero';
import About from '@/Components/Storefront/About';
import FAQ from '@/Components/Storefront/FAQ';
import PriceRangeSection from '@/Components/Storefront/PriceRangeSection';
import FeaturedCombos from '@/Components/Storefront/FeaturedCombos';
import CategoryShortcuts from '@/Components/Storefront/CategoryShortcuts';
import Reviews from '@/Components/Storefront/Reviews';

export default function Welcome({ featuredCombos, combosTitle, featuredProducts, heroImage, cartCount, reviews = [], reviewStats }) {
    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title="La Tienda de Los Niños · Combos y ropa para los más chicos" />

            <div className="home-angular">
                <Hero image={heroImage} />
                <FeaturedCombos combos={featuredCombos} title={combosTitle} />
                <PriceRangeSection />
                <CategoryShortcuts />
                <About />
                <Reviews reviews={reviews} stats={reviewStats} />
                <FAQ />
            </div>
        </StorefrontLayout>
    );
}
