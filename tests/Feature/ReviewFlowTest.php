<?php

namespace Tests\Feature;

use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_review_page_renders(): void
    {
        $this->get('/reseñas')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Reviews/Create')->has('reviews.data')->has('stats'));
    }

    public function test_visitor_can_submit_a_review_and_it_is_visible(): void
    {
        $before = Review::count();

        $this->post('/reseñas', [
            'author_name' => 'Test Persona',
            'rating' => 5,
            'body' => 'Todo excelente, muy recomendable.',
        ])->assertRedirect(route('reviews.create'));

        $this->assertSame($before + 1, Review::count());
        $review = Review::latest()->first();
        $this->assertTrue($review->is_visible);
        $this->assertSame(5, $review->rating);
    }

    public function test_review_validation_rejects_bad_input(): void
    {
        $this->post('/reseñas', ['rating' => 9, 'body' => 'x'])
            ->assertSessionHasErrors(['rating', 'body']);
    }

    public function test_admin_can_toggle_visibility(): void
    {
        $user = User::factory()->create();
        $review = Review::create(['rating' => 4, 'body' => 'Una reseña de prueba.', 'is_visible' => true]);

        $this->actingAs($user)
            ->patch("/admin/reviews/{$review->id}/visibility", ['is_visible' => false])
            ->assertRedirect();

        $this->assertFalse($review->fresh()->is_visible);
    }

    public function test_admin_reviews_index_renders(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/admin/reviews')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Reviews/Index')->has('reviews.data')->has('counts'));
    }

    public function test_guest_cannot_reach_admin_reviews(): void
    {
        $this->get('/admin/reviews')->assertRedirect('/login');
    }

    public function test_reviews_are_listed_newest_first(): void
    {
        // `recent` se crea primero (id más bajo) pero tiene fecha reciente.
        $recent = Review::create(['rating' => 5, 'body' => 'Reseña con fecha reciente.', 'is_visible' => true]);
        // `oldByDate` se crea después (id más alto) pero con fecha vieja.
        $oldByDate = Review::create(['rating' => 3, 'body' => 'Reseña con fecha vieja.', 'is_visible' => true]);

        \DB::table('reviews')->where('id', $recent->id)->update(['created_at' => now()]);
        \DB::table('reviews')->where('id', $oldByDate->id)->update(['created_at' => now()->subMonth()]);

        // La fecha manda sobre el id: `recent` primero aunque tenga id menor.
        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('reviews.0.id', $recent->id)
            ->where('reviews.1.id', $oldByDate->id));

        $this->get('/reseñas')->assertInertia(fn ($page) => $page
            ->where('reviews.data.0.id', $recent->id)
            ->where('reviews.data.1.id', $oldByDate->id));
    }
}
