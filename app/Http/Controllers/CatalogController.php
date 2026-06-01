<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Combo;
use App\Models\ComboEmprendedor;
use App\Models\Product;
use App\Models\Size;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        $allCategories = Category::orderBy('name')->pluck('name')->values();
        $allSizes = Size::whereHas('products', fn ($q) => $q->where('product_size.stock', '>', 0))
            ->get(['name'])
            ->sortBy(function ($size) {
                $lower = mb_strtolower($size->name);
                $group = match (true) {
                    str_contains($lower, 'bebe') || str_contains($lower, 'bebé') => 0,
                    preg_match('/ni[ñn][oa]/u', $lower) === 1                     => 1,
                    default                                                       => 2,
                };
                $number = preg_match('/\d+/', $size->name, $m) ? (int) $m[0] : PHP_INT_MAX;

                return $group * 1000 + $number;
            })
            ->pluck('name')
            ->values();

        $combos = Combo::where('is_active', true)
            ->with(['sizes:id,name', 'items.product.genders:id,name'])
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'image', 'is_featured'])
            ->map(function ($c) {
                $genders = $c->items
                    ->flatMap(fn ($item) => optional($item->product)->genders ?? collect())
                    ->pluck('name')
                    ->unique()
                    ->values();

                return [
                    'id'          => $c->id,
                    'name'        => $c->name,
                    'price'       => $c->price,
                    'image'       => $c->image ? '/' . ltrim($c->image, '/') : null,
                    'is_featured' => (bool) $c->is_featured,
                    'genders'     => $genders,
                    'sizes'       => $c->sizes->pluck('name')->values(),
                ];
            })
            ->values();

        $combosEmprendedor = ComboEmprendedor::where('is_active', true)
            ->with(['genders:id,name', 'items.product.sizes'])
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'image', 'is_featured', 'max_items'])
            ->map(function ($c) {
                $sizeNames = $c->items
                    ->flatMap(fn ($item) => optional($item->product)->sizes ?? collect())
                    ->filter(fn ($s) => (int) ($s->pivot->stock ?? 0) > 0)
                    ->pluck('name')
                    ->unique()
                    ->values();

                return [
                    'id'          => $c->id,
                    'name'        => $c->name,
                    'price'       => (float) $c->price,
                    'image'       => $c->image ? '/' . ltrim($c->image, '/') : null,
                    'is_featured' => (bool) $c->is_featured,
                    'max_items'   => (int) $c->max_items,
                    'genders'     => $c->genders->pluck('name')->values(),
                    'sizes'       => $sizeNames,
                ];
            })
            ->values();

        $products = Product::whereHas('sizes', fn ($q) => $q->where('product_size.stock', '>', 0))
            ->with([
                'sizes'      => fn ($q) => $q->where('product_size.stock', '>', 0),
                'genders:id,name',
                'categories:id,name',
            ])
            ->orderBy('updated_at', 'desc')
            ->get(['id', 'name', 'price', 'images', 'is_featured', 'updated_at'])
            ->map(fn ($p) => [
                'id'          => $p->id,
                'name'        => $p->name,
                'price'       => $p->price,
                'image'       => $p->images[0] ?? null,
                'is_featured' => (bool) $p->is_featured,
                'genders'     => $p->genders->pluck('name')->values(),
                'sizes'       => $p->sizes->pluck('name')->values(),
                'categories'  => $p->categories->pluck('name')->values(),
            ])
            ->values();

        return Inertia::render('Catalog', [
            'combos'             => $combos,
            'combosEmprendedor'  => $combosEmprendedor,
            'products'           => $products,
            'allSizes'           => $allSizes,
            'allCategories'      => $allCategories,
        ]);
    }
}
