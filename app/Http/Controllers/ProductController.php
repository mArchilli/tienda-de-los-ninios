<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(Product $product)
    {
        $product->load(['categories', 'colors', 'sizes', 'genders']);

        $categoryIds = $product->categories->pluck('id');

        $related = Product::with(['sizes'])
            ->where('id', '!=', $product->id)
            ->when($categoryIds->isNotEmpty(), fn ($q) =>
                $q->whereHas('categories', fn ($sq) => $sq->whereIn('categories.id', $categoryIds))
            )
            ->orderByDesc('is_featured')
            ->limit(5)
            ->get();

        return Inertia::render('Product/Show', [
            'product' => [
                'id'          => $product->id,
                'name'        => $product->name,
                'description' => $product->description,
                'price'       => $product->price,
                'is_featured' => (bool) $product->is_featured,
                'images'      => $product->images,
                'categories'  => $product->categories->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values(),
                'colors'      => $product->colors->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->values(),
                'genders'     => $product->genders->map(fn ($g) => ['id' => $g->id, 'name' => $g->name])->values(),
                'sizes'       => $product->sizes->map(fn ($s) => [
                    'id'    => $s->id,
                    'name'  => $s->name,
                    'stock' => (int) ($s->pivot->stock ?? 0),
                ])->values(),
            ],
            'related' => $related->map(fn ($p) => [
                'id'          => $p->id,
                'name'        => $p->name,
                'price'       => $p->price,
                'image'       => $p->images[0] ?? null,
                'is_featured' => (bool) $p->is_featured,
            ])->values(),
        ]);
    }
}
