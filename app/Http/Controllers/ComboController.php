<?php

namespace App\Http\Controllers;

use App\Models\Combo;
use Inertia\Inertia;

class ComboController extends Controller
{
    public function show(Combo $combo)
    {
        if (! $combo->is_active) {
            abort(404);
        }

        $combo->load([
            'sizes',
            'gender',
            'items.category',
            'items.product.sizes',
        ]);

        // Agrupamos los items por categoría: cada categoría queda con su quantity y la
        // lista de productos elegibles (con sus talles+stock).
        $categories = $combo->items
            ->groupBy('category_id')
            ->map(function ($items) {
                $first = $items->first();
                return [
                    'id'       => $first->category->id,
                    'name'     => $first->category->name,
                    'quantity' => (int) $first->quantity,
                    'products' => $items
                        ->map(fn ($item) => [
                            'id'     => $item->product->id,
                            'name'   => $item->product->name,
                            'image'  => $item->product->images[0] ?? null,
                            'images' => $item->product->images ?? [],
                            'sizes' => $item->product->sizes->map(fn ($s) => [
                                'id'    => $s->id,
                                'name'  => $s->name,
                                'stock' => (int) ($s->pivot->stock ?? 0),
                            ])->values(),
                        ])
                        ->unique('id')
                        ->values(),
                ];
            })
            ->values();

        return Inertia::render('Combo/Show', [
            'combo' => [
                'id'          => $combo->id,
                'name'        => $combo->name,
                'description' => $combo->description,
                'price'       => $combo->price,
                'image'       => $combo->image ? '/' . ltrim($combo->image, '/') : null,
                'gender'      => $combo->gender
                    ? ['id' => $combo->gender->id, 'name' => $combo->gender->name]
                    : null,
                'sizes'       => $combo->sizes->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values(),
                'categories'  => $categories,
            ],
        ]);
    }
}
