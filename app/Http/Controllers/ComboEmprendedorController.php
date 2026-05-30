<?php

namespace App\Http\Controllers;

use App\Models\ComboEmprendedor;
use App\Models\Size;
use Inertia\Inertia;

class ComboEmprendedorController extends Controller
{
    public function show(ComboEmprendedor $combo)
    {
        if (! $combo->is_active) {
            abort(404);
        }

        $combo->load([
            'genders',
            'categoryLimits.category:id,name',
            'items.product.sizes',
            'items.product.categories',
        ]);

        // Agrupamos productos por talle (con stock > 0). Cada producto puede
        // aparecer en varios grupos si tiene stock en múltiples talles.
        $bySize = [];
        foreach ($combo->items as $item) {
            $product = $item->product;
            if (! $product) continue;

            foreach ($product->sizes as $size) {
                $stock = (int) ($size->pivot->stock ?? 0);
                if ($stock <= 0) continue;

                $sid = (int) $size->id;
                if (! isset($bySize[$sid])) {
                    $bySize[$sid] = [
                        'id'       => $sid,
                        'name'     => $size->name,
                        'products' => [],
                    ];
                }
                $bySize[$sid]['products'][] = [
                    'id'     => (int) $product->id,
                    'name'   => $product->name,
                    'price'  => (float) $product->price,
                    'image'  => $product->images[0] ?? null,
                    'images' => $product->images ?? [],
                    'stock'  => $stock,
                    'category_id'   => $product->categories->first()?->id,
                    'category_name' => $product->categories->first()?->name,
                ];
            }
        }

        $bySize = array_values($bySize);
        usort($bySize, fn ($a, $b) => Size::compareNames($a['name'], $b['name']));

        return Inertia::render('ComboEmprendedor/Show', [
            'combo' => [
                'id'          => $combo->id,
                'name'        => $combo->name,
                'description' => $combo->description,
                'price'       => (float) $combo->price,
                'max_items'   => (int) $combo->max_items,
                'image'       => $combo->image ? '/' . ltrim($combo->image, '/') : null,
                'genders'     => $combo->genders->map(fn ($g) => [
                    'id'   => $g->id,
                    'name' => $g->name,
                ])->values(),
                'category_limits' => $combo->categoryLimits
                    ->map(fn ($cl) => [
                        'category_id'   => (int) $cl->category_id,
                        'category_name' => $cl->category?->name,
                        'max_items'     => (int) $cl->max_items,
                    ])
                    ->sortBy('category_name')
                    ->values(),
                'sizes_groups' => $bySize,
            ],
        ]);
    }
}
