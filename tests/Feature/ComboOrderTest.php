<?php

namespace Tests\Feature;

use App\Models\Combo;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComboOrderTest extends TestCase
{
    use RefreshDatabase;

    private function makeCombo(array $attrs): Combo
    {
        return Combo::create(array_merge([
            'name'        => 'Combo',
            'price'       => 1000,
            'is_active'   => true,
            'is_featured' => false,
        ], $attrs));
    }

    public function test_guest_cannot_reach_order_screen(): void
    {
        $this->get('/admin/combos/order')->assertRedirect('/login');
    }

    public function test_order_screen_lists_combos_sorted_by_order(): void
    {
        $user = User::factory()->create();

        $c1 = $this->makeCombo(['name' => 'Combo C', 'order' => 3]);
        $c2 = $this->makeCombo(['name' => 'Combo A', 'order' => 1]);
        $c3 = $this->makeCombo(['name' => 'Combo B', 'order' => 2]);

        $this->actingAs($user)->get('/admin/combos/order')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Combos/Order')
                ->where('combos.0.id', $c2->id)
                ->where('combos.1.id', $c3->id)
                ->where('combos.2.id', $c1->id));
    }

    public function test_admin_can_persist_a_new_order(): void
    {
        $user = User::factory()->create();

        $c1 = $this->makeCombo(['name' => 'Combo A', 'order' => 1]);
        $c2 = $this->makeCombo(['name' => 'Combo B', 'order' => 2]);
        $c3 = $this->makeCombo(['name' => 'Combo C', 'order' => 3]);

        $this->actingAs($user)
            ->post('/admin/combos/reorder', ['ids' => [$c3->id, $c1->id, $c2->id]])
            ->assertRedirect();

        $this->assertSame(1, $c3->fresh()->order);
        $this->assertSame(2, $c1->fresh()->order);
        $this->assertSame(3, $c2->fresh()->order);
    }

    public function test_landing_combos_follow_manual_order_not_name_or_featured(): void
    {
        // A pesar de que `zNoDestacado` no es alfabético primero y no está destacado,
        // su `order` bajo debe ponerlo primero igual, algo que el sort viejo
        // (is_featured desc, name asc) nunca hubiera permitido.
        $first  = $this->makeCombo(['name' => 'zNoDestacado', 'is_featured' => false, 'order' => 1]);
        $second = $this->makeCombo(['name' => 'aDestacado', 'is_featured' => true, 'order' => 2]);

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('featuredCombos.0.id', $first->id)
            ->where('featuredCombos.1.id', $second->id));
    }

    public function test_landing_hides_inactive_combos(): void
    {
        $active   = $this->makeCombo(['name' => 'Activo', 'is_active' => true, 'order' => 1]);
        $inactive = $this->makeCombo(['name' => 'Inactivo', 'is_active' => false, 'order' => 2]);

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('featuredCombos.0.id', $active->id)
            ->has('featuredCombos', 1));
    }

    public function test_new_combo_is_appended_to_the_end_of_the_manual_order(): void
    {
        $user = User::factory()->create();
        $this->makeCombo(['name' => 'Existente', 'order' => 5]);

        $this->actingAs($user)->post('/admin/combos', [
            'name'       => 'Nuevo combo',
            'price'      => 1500,
            'is_active'  => true,
            'sizes'      => [],
            'categories' => [],
        ])->assertRedirect();

        $created = Combo::where('name', 'Nuevo combo')->first();
        $this->assertNotNull($created);
        $this->assertSame(6, $created->order);
    }

    public function test_landing_uses_default_section_title_when_unset(): void
    {
        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('combosTitle', 'COMBOS DE ESTA SEMANA'));
    }

    public function test_admin_can_update_section_title_and_it_reflects_on_landing_and_order_screen(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/admin/combos/section-title', ['title' => '  Combos destacados  '])
            ->assertRedirect();

        $this->assertSame('Combos destacados', Setting::get(Setting::LANDING_COMBOS_TITLE_KEY));

        $this->get('/')->assertInertia(fn ($page) => $page
            ->where('combosTitle', 'Combos destacados'));

        $this->actingAs($user)->get('/admin/combos/order')
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Combos/Order')
                ->where('sectionTitle', 'Combos destacados'));
    }

    public function test_section_title_cannot_be_saved_blank(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/admin/combos/section-title', ['title' => '   '])
            ->assertSessionHasErrors(['title']);
    }

    public function test_guest_cannot_update_section_title(): void
    {
        $this->post('/admin/combos/section-title', ['title' => 'Hackeado'])
            ->assertRedirect('/login');
    }

    public function test_catalog_order_is_unaffected_by_manual_order(): void
    {
        // El catálogo sigue ordenando por fecha de creación (más nuevo primero),
        // sin importar el `order` manual usado en la landing.
        $older = $this->makeCombo(['name' => 'Viejo', 'order' => 1]);
        \DB::table('combos')->where('id', $older->id)->update(['created_at' => now()->subDay()]);

        $newer = $this->makeCombo(['name' => 'Nuevo', 'order' => 99]);

        $this->get('/catalogo')->assertInertia(fn ($page) => $page
            ->where('combos.0.id', $newer->id)
            ->where('combos.1.id', $older->id));
    }
}
