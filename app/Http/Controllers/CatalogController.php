<?php

namespace App\Http\Controllers;

use App\Models\Combo;
use App\Models\Product;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
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

        $products = Product::whereHas('sizes', fn ($q) => $q->where('product_size.stock', '>', 0))
            ->with(['sizes:id,name', 'genders:id,name'])
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'images', 'is_featured'])
            ->map(fn ($p) => [
                'id'          => $p->id,
                'name'        => $p->name,
                'price'       => $p->price,
                'image'       => $p->images[0] ?? null,
                'is_featured' => (bool) $p->is_featured,
                'genders'     => $p->genders->pluck('name')->values(),
                'sizes'       => $p->sizes->pluck('name')->values(),
            ])
            ->values();

        return Inertia::render('Catalog', [
            'combos'   => $combos,
            'products' => $products,
        ]);
    }
}
