<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ComboEmprendedor;
use App\Models\ComboEmprendedorCategoryLimit;
use App\Models\ComboEmprendedorItem;
use App\Models\Gender;
use App\Models\Size;
use App\Services\ImageProcessor;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComboEmprendedorController extends Controller
{
    public function __construct(private ImageProcessor $imageProcessor) {}

    public function index(Request $request)
    {
        $search   = $request->input('search', '');
        $genderId = $request->input('gender') ? (int) $request->input('gender') : null;

        $combos = ComboEmprendedor::with(['genders', 'categoryLimits', 'items.product.categories', 'items.product.sizes'])
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($genderId, fn($q) => $q->whereHas('genders', fn($sq) => $sq->where('genders.id', $genderId)))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/CombosEmprendedor/Index', [
            'combos'     => $combos,
            'genders'    => Gender::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters'    => [
                'search' => $search,
                'gender' => $genderId ? (string) $genderId : '',
            ],
        ]);
    }

    /**
     * AJAX: Productos disponibles agrupados por talle para los géneros indicados.
     * Cada producto se repite por cada talle donde tiene stock > 0.
     */
    public function productsForGenders(Request $request)
    {
        $genderIds = array_values(array_filter((array) $request->input('genders', []), 'is_numeric'));

        if (empty($genderIds)) {
            return response()->json([]);
        }

        // Traemos productos que matcheen al menos uno de los géneros indicados,
        // con sus talles (sólo aquellos con stock > 0) y sus categorías.
        $products = \App\Models\Product::whereHas('genders', fn ($q) => $q->whereIn('genders.id', $genderIds))
            ->whereHas('sizes', fn ($q) => $q->where('product_size.stock', '>', 0))
            ->with([
                'sizes'      => fn ($q) => $q->where('product_size.stock', '>', 0)->orderBy('name'),
                'categories:id,name',
                'genders:id,name',
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'images']);

        // Indexamos talles para construir el agrupado.
        $bySize = [];
        foreach ($products as $product) {
            foreach ($product->sizes as $size) {
                $sid = (int) $size->id;
                if (! isset($bySize[$sid])) {
                    $bySize[$sid] = [
                        'id'       => $sid,
                        'name'     => $size->name,
                        'products' => [],
                    ];
                }
                $bySize[$sid]['products'][] = [
                    'id'         => (int) $product->id,
                    'name'       => $product->name,
                    'price'      => (float) $product->price,
                    'images'     => $product->images,
                    'stock'      => (int) ($size->pivot->stock ?? 0),
                    'category_id'   => $product->categories->first()?->id,
                    'category_name' => $product->categories->first()?->name,
                    'gender_ids' => $product->genders->pluck('id')->values()->all(),
                ];
            }
        }

        // Orden por familia (Bebé > Niño/a > Otros) y luego por número ascendente.
        $bySize = array_values($bySize);
        usort($bySize, fn ($a, $b) => Size::compareNames($a['name'], $b['name']));

        return response()->json($bySize);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $this->uploadImage($request->file('image'));
        }

        $combo = ComboEmprendedor::create([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'price'       => $data['price'],
            'max_items'   => $data['max_items'],
            'is_active'   => $request->boolean('is_active'),
            'is_featured' => $request->boolean('is_featured'),
            'image'       => $imagePath,
        ]);

        $combo->genders()->sync($data['genders']);

        foreach (array_unique($data['product_ids'] ?? []) as $productId) {
            ComboEmprendedorItem::create([
                'combo_emprendedor_id' => $combo->id,
                'product_id'           => (int) $productId,
            ]);
        }

        $this->syncCategoryLimits($combo, $data['category_limits']);

        return back()->with('success', 'Combo emprendedor creado correctamente.');
    }

    public function update(Request $request, ComboEmprendedor $combo)
    {
        $data = $this->validatePayload($request);

        if ($request->hasFile('image')) {
            if ($combo->image) {
                @unlink(public_path($combo->image));
            }
            $imagePath = $this->uploadImage($request->file('image'));
        } else {
            $imagePath = $combo->image;
        }

        $combo->update([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'price'       => $data['price'],
            'max_items'   => $data['max_items'],
            'is_active'   => $request->boolean('is_active'),
            'is_featured' => $request->boolean('is_featured'),
            'image'       => $imagePath,
        ]);

        $combo->genders()->sync($data['genders']);

        $combo->items()->delete();
        foreach (array_unique($data['product_ids'] ?? []) as $productId) {
            ComboEmprendedorItem::create([
                'combo_emprendedor_id' => $combo->id,
                'product_id'           => (int) $productId,
            ]);
        }

        $this->syncCategoryLimits($combo, $data['category_limits']);

        return back()->with('success', 'Combo emprendedor actualizado correctamente.');
    }

    private function syncCategoryLimits(ComboEmprendedor $combo, array $limits): void
    {
        $combo->categoryLimits()->delete();
        foreach ($limits as $entry) {
            ComboEmprendedorCategoryLimit::create([
                'combo_emprendedor_id' => $combo->id,
                'category_id'          => (int) $entry['category_id'],
                'max_items'            => (int) $entry['max_items'],
            ]);
        }
    }

    public function destroy(ComboEmprendedor $combo)
    {
        if ($combo->image) {
            @unlink(public_path($combo->image));
        }

        $combo->delete();

        return back()->with('success', 'Combo emprendedor eliminado correctamente.');
    }

    private function validatePayload(Request $request): array
    {
        $data = $request->validate([
            'name'                        => 'required|string|max:255',
            'description'                 => 'nullable|string',
            'price'                       => 'required|numeric|min:100000',
            'max_items'                   => 'required|integer|min:1|max:50',
            'is_active'                   => 'boolean',
            'is_featured'                 => 'boolean',
            'image'                       => 'nullable|image|max:5120',
            'genders'                     => 'required|array|min:1',
            'genders.*'                   => 'integer|exists:genders,id',
            'product_ids'                 => 'required|array|min:1',
            'product_ids.*'               => 'integer|exists:products,id',
            'category_limits'             => 'required|array|min:1',
            'category_limits.*.category_id' => 'required|integer|exists:categories,id',
            'category_limits.*.max_items'   => 'required|integer|min:1',
        ], [
            'price.min'             => 'El precio mínimo de un combo emprendedor es de $100.000.',
            'genders.required'      => 'Seleccioná al menos un género para el combo.',
            'product_ids.required'  => 'Tenés que curar al menos una prenda para el combo.',
            'max_items.max'         => 'El máximo de prendas no puede superar 50.',
            'category_limits.required' => 'Definí el máximo de prendas por categoría.',
        ]);

        $productIds = array_unique(array_map('intval', $data['product_ids']));

        $productsWithCategories = \App\Models\Product::with('categories:id,name')
            ->whereIn('id', $productIds)
            ->get();

        $productsSinCategoria = $productsWithCategories
            ->filter(fn ($p) => $p->categories->isEmpty())
            ->pluck('name')
            ->all();

        if (! empty($productsSinCategoria)) {
            throw ValidationException::withMessages([
                'product_ids' => 'Hay prendas sin categoría asignada: ' .
                    implode(', ', $productsSinCategoria) .
                    '. Asigná una categoría a cada prenda antes de guardar el combo.',
            ]);
        }

        // Cada prenda se asigna a su categoría principal (la primera).
        $catLimitIds = collect($data['category_limits'])
            ->pluck('category_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if (count(array_unique($catLimitIds)) !== count($catLimitIds)) {
            throw ValidationException::withMessages([
                'category_limits' => 'No puede haber categorías repetidas en los límites.',
            ]);
        }

        $offendingProducts = $productsWithCategories
            ->filter(fn ($p) => ! in_array((int) $p->categories->first()->id, $catLimitIds, true))
            ->pluck('name')
            ->all();

        if (! empty($offendingProducts)) {
            throw ValidationException::withMessages([
                'category_limits' => 'Hay prendas cuya categoría no está incluida en los límites: ' .
                    implode(', ', $offendingProducts) .
                    '. Quitalas o agregá su categoría a los límites.',
            ]);
        }

        $sumaLimites = array_sum(array_map(
            fn ($e) => (int) $e['max_items'],
            $data['category_limits']
        ));

        if ($sumaLimites !== (int) $data['max_items']) {
            throw ValidationException::withMessages([
                'category_limits' => "La suma de los máximos por categoría ({$sumaLimites}) debe ser igual al máximo total del combo ({$data['max_items']}).",
            ]);
        }

        return $data;
    }

    private function uploadImage(\Illuminate\Http\UploadedFile $file): string
    {
        $base        = rtrim(env('COMBO_IMAGES_PATH', 'images'), '/');
        $filename    = uniqid() . '.' . $file->getClientOriginalExtension();
        $destination = public_path($base . '/combos-emprendedor');
        $fullPath    = $destination . '/' . $filename;

        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        $file->move($destination, $filename);

        $this->imageProcessor->resizeDownInPlace($fullPath, 800, 800, 85);

        return $base . '/combos-emprendedor/' . $filename;
    }
}
