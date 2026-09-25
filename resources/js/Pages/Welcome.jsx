import { Head } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import Hero from '@/Components/Storefront/Hero';
import About from '@/Components/Storefront/About';
import FAQ from '@/Components/Storefront/FAQ';
import PriceRangeSection from '@/Components/Storefront/PriceRangeSection';
import FeaturedCombos from '@/Components/Storefront/FeaturedCombos';
import CategoryShortcuts from '@/Components/Storefront/CategoryShortcuts';
import Reviews from '@/Components/Storefront/Reviews';

export default function Welcome({
    featuredCombos,
    combosTitle,
    heroTitleTop,
    heroTitleBottom,
    priceRangeTitle,
    catalogTitle,
    aboutTitle,
    reviewsTitle,
    faqTitle,
    featuredProducts,
    heroImage,
    cartCount,
    reviews = [],
    reviewStats,
}) {
    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title="La Tienda de Los Niños · Combos y ropa para los más chicos" />

            <div className="home-angular">
                <Hero image={heroImage} titleTop={heroTitleTop} titleBottom={heroTitleBottom} />
                <FeaturedCombos combos={featuredCombos} title={combosTitle} />
                <PriceRangeSection title={priceRangeTitle} />
                <CategoryShortcuts title={catalogTitle} />
                <About title={aboutTitle} />
                <Reviews reviews={reviews} stats={reviewStats} title={reviewsTitle} />
                <FAQ title={faqTitle} />
            </div>
        </StorefrontLayout>
    );
}
