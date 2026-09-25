<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'hero_title_top'     => 'COMBOS',
            'hero_title_bottom'  => 'PARA ARMAR.',
            'combos_title'       => 'COMBOS DE ESTA SEMANA',
            'price_range_title'  => 'COMBOS PARA EMPRENDEDORES',
            'catalog_title'      => 'CATALOGO',
            'about_title'        => 'SOBRE NOSOTROS',
            'reviews_title'      => 'RESEÑAS DE CLIENTES',
            'faq_title'          => 'PREGUNTAS FRECUENTES',
        ], $overrides);
    }

    public function test_guest_cannot_view_landing_settings(): void
    {
        $this->get('/admin/landing')->assertRedirect('/login');
    }

    public function test_guest_cannot_update_landing_settings(): void
    {
        $this->post('/admin/landing', $this->validPayload())->assertRedirect('/login');
    }

    public function test_landing_settings_page_shows_defaults_when_unset(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/admin/landing')
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Landing/Index')
                ->where('titles.hero_title_top', 'COMBOS')
                ->where('titles.hero_title_bottom', 'PARA ARMAR.')
                ->where('titles.combos_title', 'COMBOS DE ESTA SEMANA')
                ->where('titles.price_range_title', 'COMBOS PARA EMPRENDEDORES')
                ->where('titles.catalog_title', 'CATALOGO')
                ->where('titles.about_title', 'SOBRE NOSOTROS')
                ->where('titles.reviews_title', 'RESEÑAS DE CLIENTES')
                ->where('titles.faq_title', 'PREGUNTAS FRECUENTES')
            );
    }

    public function test_admin_can_update_all_landing_titles_and_they_reach_the_home_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/landing', $this->validPayload([
            'combos_title' => '  Combos destacados  ',
            'about_title'  => '  Quiénes somos  ',
        ]))->assertRedirect();

        $this->assertSame('Combos destacados', Setting::get(Setting::LANDING_COMBOS_TITLE_KEY));
        $this->assertSame('Quiénes somos', Setting::get(Setting::LANDING_ABOUT_TITLE_KEY));

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('combosTitle', 'Combos destacados')
            ->where('aboutTitle', 'Quiénes somos')
        );

        $this->actingAs($user)->get('/admin/landing')
            ->assertInertia(fn ($page) => $page
                ->where('titles.combos_title', 'Combos destacados')
                ->where('titles.about_title', 'Quiénes somos')
            );
    }

    public function test_a_landing_title_cannot_be_saved_blank(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/admin/landing', $this->validPayload(['faq_title' => '   ']))
            ->assertSessionHasErrors(['faq_title']);
    }

    public function test_home_uses_defaults_for_every_title_when_unset(): void
    {
        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('combosTitle', 'COMBOS DE ESTA SEMANA')
            ->where('heroTitleTop', 'COMBOS')
            ->where('heroTitleBottom', 'PARA ARMAR.')
            ->where('priceRangeTitle', 'COMBOS PARA EMPRENDEDORES')
            ->where('catalogTitle', 'CATALOGO')
            ->where('aboutTitle', 'SOBRE NOSOTROS')
            ->where('reviewsTitle', 'RESEÑAS DE CLIENTES')
            ->where('faqTitle', 'PREGUNTAS FRECUENTES')
        );
    }
}
