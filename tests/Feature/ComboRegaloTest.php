<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ComboRegalo;
use App\Models\ComboRegaloItem;
use App\Models\Gender;
use App\Models\Order;
use App\Models\Product;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComboRegaloTest extends TestCase
{
    use RefreshDatabase;

    private function makeComboWithOneProduct(array $comboAttrs = []): array
    {
        $gender   = Gender::create(['name' => 'Niños']);
        $category = Category::create(['name' => 'Remeras']);
        $size     = Size::create(['name' => '4']);

        $product = Product::create(['name' => 'Remera azul', 'price' => 5000, 'images' => []]);
        $product->categories()->attach($category->id);
        $product->genders()->attach($gender->id);
        $product->sizes()->attach($size->id, ['stock' => 10]);

        $combo = ComboRegalo::create(array_merge([
            'name'       => 'Combo Regalo Bebé',
            'price'      => 20000,
            'is_active'  => true,
            'gender_id'  => $gender->id,
        ], $comboAttrs));
        $combo->sizes()->attach($size->id);

        ComboRegaloItem::create([
            'combo_regalo_id' => $combo->id,
            'category_id'     => $category->id,
            'product_id'      => $product->id,
            'quantity'        => 1,
        ]);

        return compact('combo', 'gender', 'category', 'size', 'product');
    }

    public function test_guest_cannot_access_admin_gift_combos(): void
    {
        $this->get('/admin/combos-regalo')->assertRedirect('/login');
    }

    public function test_admin_can_create_gift_combo(): void
    {
        $user     = User::factory()->create();
        $category = Category::create(['name' => 'Pantalones']);
        $size     = Size::create(['name' => '6']);
        $product  = Product::create(['name' => 'Pantalón', 'price' => 4000, 'images' => []]);
        $product->categories()->attach($category->id);
        $product->sizes()->attach($size->id, ['stock' => 5]);

        $this->actingAs($user)->post('/admin/combos-regalo', [
            'name'       => 'Combo Regalo Nene',
            'price'      => 15000,
            'is_active'  => true,
            'sizes'      => [$size->id],
            'categories' => [
                ['category_id' => $category->id, 'quantity' => 1, 'product_ids' => [$product->id]],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('combo_regalos', ['name' => 'Combo Regalo Nene']);
        $combo = ComboRegalo::where('name', 'Combo Regalo Nene')->first();
        $this->assertSame(1, $combo->items()->count());
    }

    public function test_storefront_show_renders_combo_and_gift_message_max_length(): void
    {
        ['combo' => $combo] = $this->makeComboWithOneProduct();

        $this->get("/combo-regalo/{$combo->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('ComboRegalo/Show')
                ->where('combo.id', $combo->id)
                ->where('giftMessageMaxLength', 150));
    }

    public function test_inactive_gift_combo_returns_404(): void
    {
        ['combo' => $combo] = $this->makeComboWithOneProduct(['is_active' => false]);

        $this->get("/combo-regalo/{$combo->id}")->assertNotFound();
    }

    public function test_add_gift_combo_to_cart_with_message(): void
    {
        ['combo' => $combo, 'size' => $size, 'category' => $category, 'product' => $product] = $this->makeComboWithOneProduct();

        $response = $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id,
            'size_id'         => $size->id,
            'picks'           => [$category->id => [$product->id]],
            'gift_message'    => 'Feliz cumple!',
            'quantity'        => 1,
        ]);
        $response->assertRedirect();

        $this->get('/carrito')->assertInertia(fn ($page) => $page
            ->where('cart.items.0.variant', 'regalo')
            ->where('cart.items.0.gift_message', 'Feliz cumple!')
            ->where('cart.items.0.type', 'combo'));
    }

    public function test_gift_message_respects_configured_max_length(): void
    {
        \App\Models\Setting::set(\App\Models\Setting::GIFT_MESSAGE_MAX_LENGTH_KEY, '10');

        ['combo' => $combo, 'size' => $size, 'category' => $category, 'product' => $product] = $this->makeComboWithOneProduct();

        $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id,
            'size_id'         => $size->id,
            'picks'           => [$category->id => [$product->id]],
            'gift_message'    => 'Este mensaje es demasiado largo para el límite',
            'quantity'        => 1,
        ])->assertSessionHasErrors(['gift_message']);
    }

    public function test_identical_picks_with_different_messages_do_not_merge(): void
    {
        ['combo' => $combo, 'size' => $size, 'category' => $category, 'product' => $product] = $this->makeComboWithOneProduct();
        // Aumentamos el stock para permitir 2 unidades del mismo producto.
        $product->sizes()->updateExistingPivot($size->id, ['stock' => 10]);

        $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id, 'size_id' => $size->id,
            'picks' => [$category->id => [$product->id]], 'gift_message' => 'Mensaje uno', 'quantity' => 1,
        ]);
        $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id, 'size_id' => $size->id,
            'picks' => [$category->id => [$product->id]], 'gift_message' => 'Mensaje dos', 'quantity' => 1,
        ]);

        $this->get('/carrito')->assertInertia(fn ($page) => $page
            ->has('cart.items', 2)
            ->where('cart.items.0.gift_message', 'Mensaje uno')
            ->where('cart.items.1.gift_message', 'Mensaje dos'));
    }

    public function test_checkout_order_stores_gift_message_and_whatsapp_message_mentions_it(): void
    {
        ['combo' => $combo, 'size' => $size, 'category' => $category, 'product' => $product] = $this->makeComboWithOneProduct();

        $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id,
            'size_id'         => $size->id,
            'picks'           => [$category->id => [$product->id]],
            'gift_message'    => 'Con cariño para vos',
            'quantity'        => 1,
        ]);

        $this->post('/checkout', [
            'shipping_method' => 'branch',
            'first_name'      => 'Ana',
            'last_name'       => 'Gomez',
            'email'           => 'ana@example.com',
            'dni'             => '12345678',
            'province'        => 'Buenos Aires',
            'locality'        => 'La Plata',
            'postal_code'     => '1900',
            'courier'         => 'Correo Argentino',
            'phone'           => '1122334455',
        ])->assertRedirect(route('checkout.confirmation'));

        $order = Order::latest('id')->first();
        $this->assertNotNull($order);
        $item = $order->items()->first();
        $this->assertSame('regalo', $item->combo_data['variant']);
        $this->assertSame('Con cariño para vos', $item->combo_data['gift_message']);

        // Stock se descontó igual que un combo tradicional (mismo talle, misma prenda).
        $this->assertSame(9, (int) $product->sizes()->first()->pivot->stock);

        $this->get(route('checkout.confirmation'))->assertInertia(fn ($page) => $page
            ->where('items.0.variant', 'regalo')
            ->where('items.0.gift_message', 'Con cariño para vos')
            ->where('whatsapp_message', fn ($value) =>
                str_contains($value, '[Regalo]') && str_contains($value, 'Con cariño para vos')
            ));
    }

    public function test_admin_order_show_exposes_gift_message_and_variant(): void
    {
        $user = User::factory()->create();
        ['combo' => $combo, 'size' => $size, 'category' => $category, 'product' => $product] = $this->makeComboWithOneProduct();

        $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id,
            'size_id'         => $size->id,
            'picks'           => [$category->id => [$product->id]],
            'gift_message'    => 'Un regalito',
            'quantity'        => 1,
        ]);

        $this->post('/checkout', [
            'shipping_method' => 'branch', 'first_name' => 'Ana', 'last_name' => 'Gomez',
            'email' => 'ana@example.com', 'dni' => '12345678', 'province' => 'Buenos Aires',
            'locality' => 'La Plata', 'postal_code' => '1900', 'courier' => 'Correo Argentino',
            'phone' => '1122334455',
        ]);

        $order = Order::latest('id')->first();

        $this->actingAs($user)->get("/admin/orders/{$order->id}")
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Orders/Show')
                ->where('order.items.0.variant', 'regalo')
                ->where('order.items.0.gift_message', 'Un regalito'));
    }

    public function test_admin_orders_index_exposes_type_summary_per_order(): void
    {
        $user = User::factory()->create();
        ['combo' => $combo, 'size' => $size, 'category' => $category, 'product' => $product] = $this->makeComboWithOneProduct();

        $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id,
            'size_id'         => $size->id,
            'picks'           => [$category->id => [$product->id]],
            'gift_message'    => null,
            'quantity'        => 1,
        ]);

        $this->post('/checkout', [
            'shipping_method' => 'branch', 'first_name' => 'Ana', 'last_name' => 'Gomez',
            'email' => 'ana@example.com', 'dni' => '12345678', 'province' => 'Buenos Aires',
            'locality' => 'La Plata', 'postal_code' => '1900', 'courier' => 'Correo Argentino',
            'phone' => '1122334455',
        ]);

        $this->actingAs($user)->get('/admin/orders')
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Orders/Index')
                ->where('pending.0.type_summary', ['Combo de Regalo']));
    }

    public function test_whatsapp_message_summarizes_order_type_composition(): void
    {
        ['combo' => $combo, 'size' => $size, 'category' => $category, 'product' => $product] = $this->makeComboWithOneProduct();

        // Producto suelto, distinto del que usa el combo, para no competir por el mismo stock.
        $looseCategory = Category::create(['name' => 'Buzos']);
        $looseProduct  = Product::create(['name' => 'Buzo de algodón', 'price' => 8000, 'images' => []]);
        $looseProduct->categories()->attach($looseCategory->id);
        $looseProduct->sizes()->attach($size->id, ['stock' => 5]);

        $this->post('/carrito/combo-regalo', [
            'combo_regalo_id' => $combo->id,
            'size_id'         => $size->id,
            'picks'           => [$category->id => [$product->id]],
            'gift_message'    => null,
            'quantity'        => 1,
        ]);
        $this->post('/carrito/producto', [
            'product_id' => $looseProduct->id,
            'size_id'    => $size->id,
            'quantity'   => 1,
        ]);

        $this->post('/checkout', [
            'shipping_method' => 'branch', 'first_name' => 'Ana', 'last_name' => 'Gomez',
            'email' => 'ana@example.com', 'dni' => '12345678', 'province' => 'Buenos Aires',
            'locality' => 'La Plata', 'postal_code' => '1900', 'courier' => 'Correo Argentino',
            'phone' => '1122334455',
        ]);

        $this->get(route('checkout.confirmation'))->assertInertia(fn ($page) => $page
            ->where('whatsapp_message', fn ($value) =>
                str_contains($value, "*Nuevo Pedido #")
                && str_contains($value, 'Incluye: Productos sueltos, Combo de Regalo')
                && ! str_contains($value, '¡Hola!')
            ));
    }

    public function test_catalog_includes_active_gift_combos_and_excludes_inactive(): void
    {
        ['combo' => $active] = $this->makeComboWithOneProduct(['name' => 'Regalo activo']);
        ['combo' => $inactive] = $this->makeComboWithOneProduct(['name' => 'Regalo inactivo', 'is_active' => false]);

        $this->get('/catalogo')->assertInertia(fn ($page) => $page
            ->has('combosRegalo', 1)
            ->where('combosRegalo.0.name', 'Regalo activo'));
    }
}
