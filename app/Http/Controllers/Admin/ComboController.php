<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Combo;
use App\Models\ComboItem;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Inertia\Inertia;

class ComboController extends Controller
{
    public function index(Request $request)
    {
        $search     = $request->input('search', '');
        $categoryId = $request->input('category') ? (int) $request->input('category') : null;

        $combos = Combo::with(['sizes', 'items.category', 'items.product'])
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($categoryId, fn($q) => $q->whereHas('items', fn($sq) => $sq->where('category_id', $categoryId)))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/Combos/Index', [
            'combos'     => $combos,
            'sizes'      => Size::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters'    => ['search' => $search, 'category' => $categoryId ? (string) $categoryId : ''],
        ]);
    }

    public function categoriesWithProducts(Request $request)
    {
        $sizeIds = array_values(array_filter((array) $request->input('sizes', []), 'is_numeric'));

        if (empty($sizeIds)) {
            return response()->json([]);
        }

        $categories = Category::whereHas('products', function ($q) use ($sizeIds) {
            $q->whereHas('sizes', fn ($sq) => $sq->whereIn('sizes.id', $sizeIds));
        })
        ->with(['products' => function ($q) use ($sizeIds) {
            $q->whereHas('sizes', fn ($sq) => $sq->whereIn('sizes.id', $sizeIds))
              ->orderBy('name');
        }])
        ->orderBy('name')
        ->get(['id', 'name']);

        return response()->json($categories);
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
            'sizes'                        => 'nullable|array',
            'sizes.*'                      => 'exists:sizes,id',
            'categories'                   => 'nullable|array',
            'categories.*.category_id'     => 'exists:categories,id',
            'categories.*.quantity'        => 'integer|min:1|max:20',
            'categories.*.product_ids'     => 'nullable|array',
            'categories.*.product_ids.*'   => 'exists:products,id',
        ]);

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
            'sizes'                        => 'nullable|array',
            'sizes.*'                      => 'exists:sizes,id',
            'categories'                   => 'nullable|array',
            'categories.*.category_id'     => 'exists:categories,id',
            'categories.*.quantity'        => 'integer|min:1|max:20',
            'categories.*.product_ids'     => 'nullable|array',
            'categories.*.product_ids.*'   => 'exists:products,id',
        ]);

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

    private function uploadImage($file): string
    {
        $base        = rtrim(env('COMBO_IMAGES_PATH', 'images'), '/');
        $manager     = new ImageManager(new Driver());
        $filename    = uniqid() . '.' . $file->getClientOriginalExtension();
        $destination = public_path($base . '/combos');
        $fullPath    = $destination . '/' . $filename;

        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        $file->move($destination, $filename);

        $image = $manager->read($fullPath);
        if ($image->width() > 800 || $image->height() > 800) {
            $image->scaleDown(800, 800)->save($fullPath, quality: 85);
        }

        return $base . '/combos/' . $filename;
    }
}
