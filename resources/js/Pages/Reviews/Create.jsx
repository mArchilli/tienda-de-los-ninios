import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import StarRating from '@/Components/Storefront/StarRating';
import ReviewCard from '@/Components/Storefront/ReviewCard';

export default function ReviewsCreate({ reviews = { data: [] }, stats, cartCount }) {
    const list = reviews.data ?? [];
    const { flash } = usePage().props;
    const [submitted, setSubmitted] = useState(Boolean(flash?.review_submitted));

    const { data, setData, post, processing, errors, reset } = useForm({
        author_name: '',
        rating: 0,
        body: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('reviews.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const canSubmit = data.rating > 0 && data.body.trim().length >= 5;

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title="Dejá tu reseña" />

            <section className="home-angular bg-brand-bg">
                <div className="store-shell store-section">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-flex rounded-full border border-brand-cta/30 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cta">
                            Reseñas
                        </span>
                        <h1 className="home-section-title mt-3 text-center">CONTANOS TU EXPERIENCIA</h1>
                        <p className="mt-3 text-sm text-brand-text-muted sm:text-base">
                            Tu opinión ayuda a otras familias a elegir mejor. Te toma menos de un minuto.
                        </p>
                        {stats?.count > 0 && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                                <StarRating value={stats.average} size="sm" />
                                <span className="text-sm font-bold text-brand-text">{stats.average}</span>
                                <span className="text-xs text-brand-text-muted">
                                    ({stats.count} {stats.count === 1 ? 'reseña' : 'reseñas'})
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mx-auto mt-8 max-w-2xl">
                        {submitted ? (
                            <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 p-6 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="mt-3 text-lg font-extrabold text-emerald-800">¡Gracias por tu reseña!</p>
                                <p className="mt-1 text-sm text-emerald-700">
                                    Ya está publicada. Podés dejar otra cuando quieras.
                                </p>
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSubmitted(false)}
                                        className="home-button inline-flex items-center bg-brand-cta px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-cta-dark"
                                    >
                                        Dejar otra
                                    </button>
                                    <Link
                                        href="/"
                                        className="home-button inline-flex items-center border-2 border-brand-cta bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-brand-cta transition-colors hover:bg-brand-cta hover:text-white"
                                    >
                                        Volver al inicio
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={submit}
                                className="space-y-5 rounded-[1.6rem] border border-brand-secondary/60 bg-white p-6 shadow-[0_18px_40px_rgba(41,50,65,0.07)] sm:p-8"
                            >
                                <div>
                                    <span className="block text-sm font-bold uppercase tracking-[0.08em] text-brand-text">
                                        Tu puntaje
                                    </span>
                                    <div className="mt-2">
                                        <StarRating
                                            value={data.rating}
                                            onChange={(n) => setData('rating', n)}
                                            size="lg"
                                        />
                                    </div>
                                    {errors.rating && (
                                        <p className="mt-1.5 text-xs font-semibold text-brand-cta-dark">{errors.rating}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="body" className="block text-sm font-bold uppercase tracking-[0.08em] text-brand-text">
                                        Tu reseña
                                    </label>
                                    <textarea
                                        id="body"
                                        rows={5}
                                        maxLength={1000}
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        placeholder="¿Cómo fue tu compra? ¿Qué te pareció la atención, los tiempos de envío, las prendas?"
                                        className={`mt-2 w-full resize-none rounded-[1rem] border px-4 py-3 text-sm text-brand-text outline-none transition focus:ring-2 ${
                                            errors.body
                                                ? 'border-red-400 focus:ring-red-200'
                                                : 'border-brand-primary/25 focus:border-brand-primary focus:ring-brand-primary/15'
                                        }`}
                                    />
                                    <div className="mt-1 flex items-center justify-between">
                                        {errors.body ? (
                                            <p className="text-xs font-semibold text-brand-cta-dark">{errors.body}</p>
                                        ) : (
                                            <span />
                                        )}
                                        <span className="text-[11px] text-brand-text-light">{data.body.length}/1000</span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="author_name" className="block text-sm font-bold uppercase tracking-[0.08em] text-brand-text">
                                        Tu nombre{' '}
                                        <span className="font-normal normal-case tracking-normal text-brand-text-light">
                                            (opcional)
                                        </span>
                                    </label>
                                    <input
                                        id="author_name"
                                        type="text"
                                        maxLength={80}
                                        value={data.author_name}
                                        onChange={(e) => setData('author_name', e.target.value)}
                                        placeholder="Cómo querés que aparezca"
                                        className={`mt-2 w-full rounded-[1rem] border px-4 py-3 text-sm text-brand-text outline-none transition focus:ring-2 ${
                                            errors.author_name
                                                ? 'border-red-400 focus:ring-red-200'
                                                : 'border-brand-primary/25 focus:border-brand-primary focus:ring-brand-primary/15'
                                        }`}
                                    />
                                    {errors.author_name && (
                                        <p className="mt-1.5 text-xs font-semibold text-brand-cta-dark">{errors.author_name}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || !canSubmit}
                                    className="home-button inline-flex w-full items-center justify-center bg-brand-cta px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Enviando…' : 'Publicar reseña'}
                                </button>
                                <p className="text-center text-[11px] text-brand-text-light">
                                    Al publicar, tu reseña puede mostrarse en el sitio.
                                </p>
                            </form>
                        )}
                    </div>

                    {list.length > 0 && (
                        <div id="todas" className="mx-auto mt-14 max-w-5xl scroll-mt-28">
                            <h2 className="text-center text-lg font-extrabold uppercase tracking-[0.12em] text-brand-text">
                                Todas las reseñas{reviews.total ? ` (${reviews.total})` : ''}
                            </h2>
                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {list.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>

                            {reviews.last_page > 1 && (
                                <div className="mt-8 flex flex-wrap justify-center gap-1.5">
                                    {reviews.links.map((link, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={!link.url || link.active}
                                            onClick={() =>
                                                link.url &&
                                                router.get(`${link.url}#todas`, {}, { preserveScroll: false })
                                            }
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`min-w-[38px] rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                                link.active
                                                    ? 'bg-brand-cta text-white shadow-sm'
                                                    : link.url
                                                    ? 'border border-brand-secondary bg-white text-brand-text hover:border-brand-cta hover:text-brand-cta'
                                                    : 'cursor-not-allowed border border-brand-secondary/50 bg-white/50 text-brand-text-light'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </StorefrontLayout>
    );
}
