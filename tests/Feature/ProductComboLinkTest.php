<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Color;
use App\Models\Combo;
use App\Models\ComboItem;
use App\Models\Gender;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductComboLinkTest extends TestCase
{
    use RefreshDatabase;

    private function makeProduct(array $attrs = []): Product
    {
        return Product::create(array_merge([
            'name'   => 'Producto',
            'price'  => 1000,
            'images' => [],
        ], $attrs));
    }

    private function makeCombo(array $attrs = []): Combo
    {
        return Combo::create(array_merge([
            'name'      => 'Combo',
            'price'     => 20000,
            'is_active' => true,
        ], $attrs));
    }

    // ── GET /admin/combos/for-categories ───────────────────────────────────

    public function test_guest_cannot_query_combos_for_categories(): void
    {
        $this->get('/admin/combos/for-categories')->assertRedirect('/login');
    }

    public function test_for_categories_returns_combos_that_offer_the_category(): void
    {
        $user       = User::factory()->create();
        $remeras    = Category::create(['name' => 'Remeras']);
        $pantalones = Category::create(['name' => 'Pantalones']);

        $combo1 = $this->makeCombo(['name' => 'Combo con remeras']);
        ComboItem::create([
            'combo_id'    => $combo1->id,
            'category_id' => $remeras->id,
            'product_id'  => $this->makeProduct(['name' => 'Remera vieja'])->id,
            'quantity'    => 2,
        ]);

        $combo2 = $this->makeCombo(['name' => 'Combo con pantalones']);
        ComboItem::create([
            'combo_id'    => $combo2->id,
            'category_id' => $pantalones->id,
            'product_id'  => $this->makeProduct(['name' => 'Pantalón viejo'])->id,
            'quantity'    => 1,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/admin/combos/for-categories?categories[]=' . $remeras->id);

        $response->assertOk();
        $data = $response->json();

        $this->assertCount(1, $data);
        $this->assertSame($combo1->id, $data[0]['combo_id']);
        $this->assertSame('Remeras', $data[0]['category_name']);
        $this->assertSame(2, $data[0]['quantity']);
    }

    public function test_for_categories_deduplicates_combos_with_several_products_in_the_same_slot(): void
    {
        $user    = User::factory()->create();
        $remeras = Category::create(['name' => 'Remeras']);
        $combo   = $this->makeCombo();

        ComboItem::create([
            'combo_id' => $combo->id, 'category_id' => $remeras->id,
            'product_id' => $this->makeProduct(['name' => 'A'])->id, 'quantity' => 2,
        ]);
        ComboItem::create([
            'combo_id' => $combo->id, 'category_id' => $remeras->id,
            'product_id' => $this->makeProduct(['name' => 'B'])->id, 'quantity' => 2,
        ]);

        $data = $this->actingAs($user)
            ->getJson('/admin/combos/for-categories?categories[]=' . $remeras->id)
            ->json();

        $this->assertCount(1, $data);
    }

    public function test_for_categories_filters_by_gender(): void
    {
        $user    = User::factory()->create();
        $remeras = Category::create(['name' => 'Remeras']);
        $nino    = Gender::create(['name' => 'Niño']);
        $nena    = Gender::create(['name' => 'Nena']);

        $comboNino = $this->makeCombo(['name' => 'Combo Niño', 'gender_id' => $nino->id]);
        ComboItem::create([
            'combo_id' => $comboNino->id, 'category_id' => $remeras->id,
            'product_id' => $this->makeProduct()->id, 'quantity' => 1,
        ]);

        $comboSinGenero = $this->makeCombo(['name' => 'Combo sin género']);
        ComboItem::create([
            'combo_id' => $comboSinGenero->id, 'category_id' => $remeras->id,
            'product_id' => $this->makeProduct()->id, 'quantity' => 1,
        ]);

        // Pidiendo el género "Nena": sólo debe verse el combo sin género asignado.
        $data = $this->actingAs($user)
            ->getJson('/admin/combos/for-categories?categories[]=' . $remeras->id . '&genders[]=' . $nena->id)
            ->json();

        $comboIds = array_column($data, 'combo_id');
        $this->assertNotContains($comboNino->id, $comboIds);
        $this->assertContains($comboSinGenero->id, $comboIds);

        // Pidiendo el género "Niño": ahora deben verse los dos.
        $data = $this->actingAs($user)
            ->getJson('/admin/combos/for-categories?categories[]=' . $remeras->id . '&genders[]=' . $nino->id)
            ->json();

        $comboIds = array_column($data, 'combo_id');
        $this->assertContains($comboNino->id, $comboIds);
        $this->assertContains($comboSinGenero->id, $comboIds);
    }

    // ── POST /admin/products (add_to_combos) ───────────────────────────────

    private function baseProductPayload(array $overrides = []): array
    {
        return array_merge([
            'name'  => 'Remera nueva',
            'price' => 5000,
        ], $overrides);
    }

    public function test_creating_a_product_can_add_it_to_selected_combos(): void
    {
        $user    = User::factory()->create();
        $remeras = Category::create(['name' => 'Remeras']);
        $color   = Color::create(['name' => 'Rojo']);
        $gender  = Gender::create(['name' => 'Niño']);

        $combo = $this->makeCombo(['name' => 'Combo con remeras', 'gender_id' => $gender->id]);
        ComboItem::create([
            'combo_id' => $combo->id, 'category_id' => $remeras->id,
            'product_id' => $this->makeProduct()->id, 'quantity' => 3,
        ]);

        $this->actingAs($user)->post('/admin/products', $this->baseProductPayload([
            'categories' => [$remeras->id],
            'colors'     => [$color->id],
            'genders'    => [$gender->id],
            'add_to_combos' => [
                ['combo_id' => $combo->id, 'category_id' => $remeras->id],
            ],
        ]))->assertRedirect();

        $newProduct = Product::where('name', 'Remera nueva')->firstOrFail();

        $this->assertDatabaseHas('combo_items', [
            'combo_id'    => $combo->id,
            'category_id' => $remeras->id,
            'product_id'  => $newProduct->id,
            'quantity'    => 3,
        ]);
    }

    public function test_add_to_combos_ignores_pairs_for_categories_not_selected_on_the_product(): void
    {
        $user       = User::factory()->create();
        $remeras    = Category::create(['name' => 'Remeras']);
        $pantalones = Category::create(['name' => 'Pantalones']);
        $color      = Color::create(['name' => 'Rojo']);
        $gender     = Gender::create(['name' => 'Niño']);

        $combo = $this->makeCombo();
        ComboItem::create([
            'combo_id' => $combo->id, 'category_id' => $pantalones->id,
            'product_id' => $this->makeProduct()->id, 'quantity' => 1,
        ]);

        // La prenda sólo tiene la categoría "Remeras" seleccionada, pero el
        // combo elegido ofrece la ranura de "Pantalones": el par debe ignorarse.
        $this->actingAs($user)->post('/admin/products', $this->baseProductPayload([
            'categories' => [$remeras->id],
            'colors'     => [$color->id],
            'genders'    => [$gender->id],
            'add_to_combos' => [
                ['combo_id' => $combo->id, 'category_id' => $pantalones->id],
            ],
        ]))->assertRedirect();

        $newProduct = Product::where('name', 'Remera nueva')->firstOrFail();

        $this->assertDatabaseMissing('combo_items', [
            'combo_id'   => $combo->id,
            'product_id' => $newProduct->id,
        ]);
    }

    public function test_add_to_combos_does_not_create_duplicate_rows(): void
    {
        $user    = User::factory()->create();
        $remeras = Category::create(['name' => 'Remeras']);
        $color   = Color::create(['name' => 'Rojo']);
        $gender  = Gender::create(['name' => 'Niño']);

        $combo = $this->makeCombo();
        ComboItem::create([
            'combo_id' => $combo->id, 'category_id' => $remeras->id,
            'product_id' => $this->makeProduct()->id, 'quantity' => 1,
        ]);

        $this->actingAs($user)->post('/admin/products', $this->baseProductPayload([
            'categories' => [$remeras->id],
            'colors'     => [$color->id],
            'genders'    => [$gender->id],
            'add_to_combos' => [
                ['combo_id' => $combo->id, 'category_id' => $remeras->id],
                ['combo_id' => $combo->id, 'category_id' => $remeras->id],
            ],
        ]))->assertRedirect();

        $newProduct = Product::where('name', 'Remera nueva')->firstOrFail();

        $this->assertSame(1, ComboItem::where('combo_id', $combo->id)
            ->where('product_id', $newProduct->id)
            ->count());
    }
}
