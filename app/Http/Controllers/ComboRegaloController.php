<?php

namespace App\Http\Controllers;

use App\Models\ComboRegalo;
use App\Models\Setting;
use Inertia\Inertia;

class ComboRegaloController extends Controller
{
    public function show(ComboRegalo $combo)
    {
        if (! $combo->is_active) {
            abort(404);
        }

        $combo->load([
            'sizes',
            'gender',
            'items.category',
            'items.product.sizes',
            'items.product.colors',
            'items.product.genders',
        ]);

        $comboGenderId = $combo->gender?->id;

        // Agrupamos los items por categoría igual que en el combo tradicional:
        // cada categoría queda con su quantity y la lista de productos elegibles
        // (con sus talles+stock), descartando prendas de otro género si el combo
        // tiene uno asignado.
        $categories = $combo->items
            ->groupBy('category_id')
            ->map(function ($items) use ($comboGenderId) {
                $first = $items->first();
                return [
                    'id'       => $first->category->id,
                    'name'     => $first->category->name,
                    'quantity' => (int) $first->quantity,
                    'products' => $items
                        ->filter(fn ($item) => $item->product && (
                            ! $comboGenderId
                            || $item->product->genders->contains('id', $comboGenderId)
                        ))
                        ->map(fn ($item) => [
                            'id'     => $item->product->id,
                            'name'   => $item->product->name,
                            'image'  => $item->product->images[0] ?? null,
                            'images' => $item->product->images ?? [],
                            'colors' => $item->product->colors->map(fn ($c) => [
                                'id'   => $c->id,
                                'name' => $c->name,
                            ])->values(),
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

        return Inertia::render('ComboRegalo/Show', [
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
            'giftMessageMaxLength' => (int) Setting::get(
                Setting::GIFT_MESSAGE_MAX_LENGTH_KEY,
                (string) Setting::GIFT_MESSAGE_MAX_LENGTH_DEFAULT
            ),
        ]);
    }
}
