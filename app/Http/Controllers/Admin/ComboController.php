<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Combo;
use App\Models\ComboItem;
use App\Models\Gender;
use App\Models\Product;
use App\Models\Size;
use App\Services\ImageProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ComboController extends Controller
{
    public function __construct(private ImageProcessor $imageProcessor) {}

    public function index(Request $request)
    {
        $search      = $request->input('search', '');
        $categoryId  = $request->input('category') ? (int) $request->input('category') : null;
        $needsReview = $request->boolean('needs_review');

        // Combos cuyo armado incluye prendas de un género distinto al del combo.
        // Se calcula sobre TODOS los combos (no sólo la página actual) para poder
        // mostrar el aviso global y ofrecer el filtro «sólo los que necesitan revisión».
        $reviewIds = Combo::whereNotNull('gender_id')
            ->with(['items:id,combo_id,product_id', 'items.product:id', 'items.product.genders:id'])
            ->get(['id', 'gender_id'])
            ->filter(fn (Combo $c) => $c->items->contains(fn ($it) =>
                $it->product && ! $it->product->genders->contains('id', $c->gender_id)
            ))
            ->pluck('id');

        $combos = Combo::with([
                'sizes',
                'gender',
                'items.category',
                'items.product:id,name',
                'items.product.genders:id,name',
            ])
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($categoryId, fn($q) => $q->whereHas('items', fn($sq) => $sq->where('category_id', $categoryId)))
            ->when($needsReview, fn($q) => $q->whereIn('id', $reviewIds))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Combo $combo) => array_merge($combo->toArray(), [
                'review' => $this->genderReview($combo),
            ]));

        return Inertia::render('Admin/Combos/Index', [
            'combos'           => $combos,
            'sizes'            => Size::orderBy('name')->get(['id', 'name']),
            'categories'       => Category::orderBy('name')->get(['id', 'name']),
            'genders'          => Gender::orderBy('name')->get(['id', 'name']),
            'filters'          => [
                'search'       => $search,
                'category'     => $categoryId ? (string) $categoryId : '',
                'needs_review' => $needsReview,
            ],
            'needsReviewCount' => $reviewIds->count(),
        ]);
    }

    /**
     * Detecta si un combo ofrece prendas cuyo género no coincide con el suyo.
     * Devuelve el detalle para el aviso del panel, o null si está consistente.
     * Requiere que el combo venga con `gender`, `items.category` e
     * `items.product.genders` precargados.
     */
    private function genderReview(Combo $combo): ?array
    {
        if (! $combo->gender_id) {
            return null;
        }

        $mismatched = $combo->items->filter(fn ($item) =>
            $item->product && ! $item->product->genders->contains('id', $combo->gender_id)
        );

        if ($mismatched->isEmpty()) {
            return null;
        }

        return [
            'reason'              => 'gender_mismatch',
            'combo_gender'        => $combo->gender?->name,
            'mismatched_count'    => $mismatched->count(),
            'total_items'         => $combo->items->count(),
            'affected_categories' => $mismatched
                ->map(fn ($item) => $item->category?->name)
                ->filter()
                ->unique()
                ->sort()
                ->values()
                ->all(),
            'sample_products'     => $mismatched
                ->map(fn ($item) => $item->product?->name)
                ->filter()
                ->unique()
                ->sort()
                ->take(6)
                ->values()
                ->all(),
        ];
    }

    public function categoriesWithProducts(Request $request)
    {
        $sizeIds  = array_values(array_filter((array) $request->input('sizes', []), 'is_numeric'));
        $genderId = $request->input('gender') ? (int) $request->input('gender') : null;

        if (empty($sizeIds)) {
            return response()->json([]);
        }

        $categories = Category::whereHas('products', function ($q) use ($sizeIds, $genderId) {
            $q->whereHas('sizes', fn ($sq) => $sq->whereIn('sizes.id', $sizeIds)
                ->where('product_size.stock', '>', 0));
            if ($genderId) {
                $q->whereHas('genders', fn ($gq) => $gq->where('genders.id', $genderId));
            }
        })
        ->with(['products' => function ($q) use ($sizeIds, $genderId) {
            $q->whereHas('sizes', fn ($sq) => $sq->whereIn('sizes.id', $sizeIds)
                ->where('product_size.stock', '>', 0))
              ->with(['sizes' => fn ($sq) => $sq->whereIn('sizes.id', $sizeIds)
                  ->where('product_size.stock', '>', 0)])
              ->orderBy('name');
            if ($genderId) {
                $q->whereHas('genders', fn ($gq) => $gq->where('genders.id', $genderId));
            }
        }])
        ->orderBy('name')
        ->get(['id', 'name']);

        $payload = $categories->map(function ($cat) {
            $products = $cat->products->map(fn ($p) => [
                'id'       => $p->id,
                'name'     => $p->name,
                'price'    => $p->price,
                'images'   => $p->images,
                'size_ids' => $p->sizes->pluck('id')->values()->all(),
            ])->values();

            return [
                'id'       => $cat->id,
                'name'     => $cat->name,
                'size_ids' => $products->flatMap(fn ($p) => $p['size_ids'])->unique()->values()->all(),
                'products' => $products,
            ];
        });

        return response()->json($payload);
    }

    /**
     * Devuelve los talles seleccionados que NO tienen al menos una prenda con ese
     * talle entre los productos elegidos en cada categoría. Si la lista está
     * vacía, el combo es vendible en todos los talles seleccionados.
     *
     * @return array<int, array{size_id:int, size_name:string, categories:array<int, string>}>
     */
    private function uncoveredSizes(array $sizeIds, array $categoriesData): array
    {
        if (empty($sizeIds) || empty($categoriesData)) {
            return [];
        }

        $sizeNames = Size::whereIn('id', $sizeIds)->pluck('name', 'id')->all();
        $categoryNames = Category::whereIn('id', array_column($categoriesData, 'category_id'))
            ->pluck('name', 'id')->all();

        $uncovered = [];
        foreach ($sizeIds as $sizeId) {
            $missing = [];
            foreach ($categoriesData as $catData) {
                $productIds = $catData['product_ids'] ?? [];
                if (empty($productIds)) {
                    $missing[] = $categoryNames[$catData['category_id']] ?? ('#' . $catData['category_id']);
                    continue;
                }
                $hit = Product::whereIn('id', $productIds)
                    ->whereHas('sizes', fn ($q) => $q->where('sizes.id', $sizeId)
                        ->where('product_size.stock', '>', 0))
                    ->exists();
                if (! $hit) {
                    $missing[] = $categoryNames[$catData['category_id']] ?? ('#' . $catData['category_id']);
                }
            }
            if (! empty($missing)) {
                $uncovered[] = [
                    'size_id'    => (int) $sizeId,
                    'size_name'  => $sizeNames[$sizeId] ?? ('#' . $sizeId),
                    'categories' => $missing,
                ];
            }
        }

        return $uncovered;
    }

    private function assertSizeCoverage(Request $request): void
    {
        $sizeIds = array_values(array_filter((array) $request->input('sizes', []), 'is_numeric'));
        $categoriesData = (array) $request->input('categories', []);

        $uncovered = $this->uncoveredSizes($sizeIds, $categoriesData);
        if (empty($uncovered)) {
            return;
        }

        $msg = collect($uncovered)
            ->map(fn ($u) => "Talle {$u['size_name']}: faltan prendas en " . implode(', ', $u['categories']))
            ->implode('. ');

        throw ValidationException::withMessages([
            'sizes' => 'No se puede guardar el combo en talles sin cobertura completa. ' . $msg,
        ]);
    }

    /**
     * Si el combo tiene un género asignado, todas las prendas elegidas deben
     * pertenecer a ese género. Impide guardar combos con prendas mezcladas
     * (un combo «de niños» con prendas de niña o viceversa).
     */
    private function assertGenderConsistency(Request $request): void
    {
        $genderId = $request->input('gender_id') ? (int) $request->input('gender_id') : null;
        if (! $genderId) {
            return;
        }

        $productIds = collect($request->input('categories', []))
            ->flatMap(fn ($cat) => (array) ($cat['product_ids'] ?? []))
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->unique()
            ->all();

        if (empty($productIds)) {
            return;
        }

        $offending = Product::whereIn('id', $productIds)
            ->whereDoesntHave('genders', fn ($q) => $q->where('genders.id', $genderId))
            ->orderBy('name')
            ->pluck('name');

        if ($offending->isNotEmpty()) {
            $sample = $offending->take(8)->implode(', ');
            $more   = $offending->count() > 8 ? ' y ' . ($offending->count() - 8) . ' más' : '';

            throw ValidationException::withMessages([
                'gender_id' => "Hay prendas que no pertenecen al género del combo: {$sample}{$more}. "
                    . 'Quitalas del combo o corregí el género de esas prendas antes de guardar.',
            ]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'                         => 'required|string|max:255',
            'description'                  => 'nullable|string',
            'price'                        => 'required|numeric|min:0',
            'is_active'                    => 'boolean',
            'is_featured'                  => 'boolean',
            'image'                        => 'nullable|image|max:5120',
            'gender_id'                    => 'nullable|exists:genders,id',
            'sizes'                        => 'nullable|array',
            'sizes.*'                      => 'exists:sizes,id',
            'categories'                   => 'nullable|array',
            'categories.*.category_id'     => 'exists:categories,id',
            'categories.*.quantity'        => 'integer|min:1|max:20',
            'categories.*.product_ids'     => 'nullable|array',
            'categories.*.product_ids.*'   => 'exists:products,id',
        ]);

        $this->assertSizeCoverage($request);
        $this->assertGenderConsistency($request);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $this->uploadImage($request->file('image'));
        }

        $combo = Combo::create([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'is_active'   => $request->boolean('is_active'),
            'is_featured' => $request->boolean('is_featured'),
            'image'       => $imagePath,
            'gender_id'   => $request->input('gender_id') ?: null,
        ]);

        $combo->sizes()->sync($request->input('sizes', []));

        foreach ($request->input('categories', []) as $catData) {
            foreach ($catData['product_ids'] ?? [] as $productId) {
                ComboItem::create([
                    'combo_id'    => $combo->id,
                    'category_id' => $catData['category_id'],
                    'product_id'  => $productId,
                    'quantity'    => $catData['quantity'] ?? 1,
                ]);
            }
        }

        return back()->with('success', 'Combo creado correctamente.');
    }

    public function update(Request $request, Combo $combo)
    {
        $request->validate([
            'name'                         => 'required|string|max:255',
            'description'                  => 'nullable|string',
            'price'                        => 'required|numeric|min:0',
            'is_active'                    => 'boolean',
            'is_featured'                  => 'boolean',
            'image'                        => 'nullable|image|max:5120',
            'gender_id'                    => 'nullable|exists:genders,id',
            'sizes'                        => 'nullable|array',
            'sizes.*'                      => 'exists:sizes,id',
            'categories'                   => 'nullable|array',
            'categories.*.category_id'     => 'exists:categories,id',
            'categories.*.quantity'        => 'integer|min:1|max:20',
            'categories.*.product_ids'     => 'nullable|array',
            'categories.*.product_ids.*'   => 'exists:products,id',
        ]);

        $this->assertSizeCoverage($request);
        $this->assertGenderConsistency($request);

        if ($request->hasFile('image')) {
            if ($combo->image) {
                @unlink(public_path($combo->image));
            }
            $imagePath = $this->uploadImage($request->file('image'));
        } else {
            $imagePath = $combo->image;
        }

        $combo->update([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'is_active'   => $request->boolean('is_active'),
            'is_featured' => $request->boolean('is_featured'),
            'image'       => $imagePath,
            'gender_id'   => $request->input('gender_id') ?: null,
        ]);

        $combo->sizes()->sync($request->input('sizes', []));

        $combo->items()->delete();

        foreach ($request->input('categories', []) as $catData) {
            foreach ($catData['product_ids'] ?? [] as $productId) {
                ComboItem::create([
                    'combo_id'    => $combo->id,
                    'category_id' => $catData['category_id'],
                    'product_id'  => $productId,
                    'quantity'    => $catData['quantity'] ?? 1,
                ]);
            }
        }

        return back()->with('success', 'Combo actualizado correctamente.');
    }

    public function destroy(Combo $combo)
    {
        if ($combo->image) {
            @unlink(public_path($combo->image));
        }

        $combo->delete();

        return back()->with('success', 'Combo eliminado correctamente.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'exists:combos,id',
        ]);

        $combos = Combo::whereIn('id', $request->ids)->get();

        foreach ($combos as $combo) {
            if ($combo->image) {
                @unlink(public_path($combo->image));
            }
            $combo->delete();
        }

        $count = count($request->ids);
        $label = $count === 1 ? 'combo eliminado' : 'combos eliminados';

        return back()->with('success', "{$count} {$label} correctamente.");
    }

    private function uploadImage(\Illuminate\Http\UploadedFile $file): string
    {
        $base        = rtrim(env('COMBO_IMAGES_PATH', 'images'), '/');
        $filename    = uniqid() . '.' . $file->getClientOriginalExtension();
        $destination = public_path($base . '/combos');
        $fullPath    = $destination . '/' . $filename;

        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        $file->move($destination, $filename);

        $this->imageProcessor->resizeDownInPlace($fullPath, 800, 800, 85);

        return $base . '/combos/' . $filename;
    }
}
