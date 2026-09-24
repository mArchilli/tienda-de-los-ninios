<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class ProductExportTest extends TestCase
{
    use RefreshDatabase;

    private function makeProduct(array $attrs): Product
    {
        return Product::create(array_merge([
            'name'   => 'Producto',
            'price'  => 1000,
            'images' => [],
        ], $attrs));
    }

    private function rowsFromResponse($response): array
    {
        $tmp = tempnam(sys_get_temp_dir(), 'xlsx');
        file_put_contents($tmp, $response->streamedContent());
        $rows = IOFactory::load($tmp)->getActiveSheet()->toArray();
        unlink($tmp);

        return $rows;
    }

    public function test_guest_cannot_export_products(): void
    {
        $this->get('/admin/products/export')->assertRedirect('/login');
    }

    public function test_export_without_filters_includes_all_products(): void
    {
        $user = User::factory()->create();

        $this->makeProduct(['name' => 'Producto A']);
        $this->makeProduct(['name' => 'Producto B']);

        $response = $this->actingAs($user)->get('/admin/products/export');
        $response->assertOk();
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $rows = $this->rowsFromResponse($response);

        // Encabezado + 2 productos.
        $this->assertCount(3, $rows);
        $this->assertSame('Nombre', $rows[0][1]);
    }

    public function test_export_respects_category_filter(): void
    {
        $user = User::factory()->create();

        $remeras    = Category::create(['name' => 'Remeras']);
        $pantalones = Category::create(['name' => 'Pantalones']);

        $remera = $this->makeProduct(['name' => 'Remera roja']);
        $remera->categories()->attach($remeras->id);

        $pantalon = $this->makeProduct(['name' => 'Pantalón azul']);
        $pantalon->categories()->attach($pantalones->id);

        $response = $this->actingAs($user)->get('/admin/products/export?category=' . $remeras->id);
        $response->assertOk();

        $rows = $this->rowsFromResponse($response);

        // Solo la remera filtrada, ninguna otra prenda de otra categoría.
        $this->assertCount(2, $rows);
        $this->assertSame('Remera roja', $rows[1][1]);
    }

    public function test_export_respects_search_filter(): void
    {
        $user = User::factory()->create();

        $this->makeProduct(['name' => 'Campera de invierno']);
        $this->makeProduct(['name' => 'Remera de verano']);

        $response = $this->actingAs($user)->get('/admin/products/export?search=Campera');
        $rows = $this->rowsFromResponse($response);

        $this->assertCount(2, $rows);
        $this->assertSame('Campera de invierno', $rows[1][1]);
    }
}
