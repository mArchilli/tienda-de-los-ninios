<?php

namespace App\Http\Controllers;

use App\Models\Combo;
use App\Models\Gender;
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
            'items.category',
            'items.product.sizes',
            'items.product.genders',
        ]);

        // Agrupamos los items por categoría: cada categoría queda con su quantity y la
        // lista de productos elegibles (con sus talles+stock y géneros).
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
                            'id'      => $item->product->id,
                            'name'    => $item->product->name,
                            'image'   => $item->product->images[0] ?? null,
                            'sizes'   => $item->product->sizes->map(fn ($s) => [
                                'id'    => $s->id,
                                'name'  => $s->name,
                                'stock' => (int) ($s->pivot->stock ?? 0),
                            ])->values(),
                            'genders' => $item->product->genders->pluck('id')->values(),
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
                'sizes'       => $combo->sizes->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values(),
                'categories'  => $categories,
            ],
            'genders' => Gender::orderBy('name')->get(['id', 'name']),
        ]);
    }
}
