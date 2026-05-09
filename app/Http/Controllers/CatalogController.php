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
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'image', 'is_featured'])
            ->map(fn ($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'price'       => $c->price,
                'image'       => $c->image ? '/' . ltrim($c->image, '/') : null,
                'is_featured' => (bool) $c->is_featured,
            ])
            ->values();

        $products = Product::orderBy('name')
            ->get(['id', 'name', 'price', 'images', 'is_featured'])
            ->map(fn ($p) => [
                'id'          => $p->id,
                'name'        => $p->name,
                'price'       => $p->price,
                'image'       => $p->images[0] ?? null,
                'is_featured' => (bool) $p->is_featured,
            ])
            ->values();

        return Inertia::render('Catalog', [
            'combos'   => $combos,
            'products' => $products,
        ]);
    }
}
