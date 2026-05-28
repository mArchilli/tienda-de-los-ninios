<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Color;
use App\Models\Gender;
use App\Models\Product;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $stockSubquery = DB::table('product_size')
            ->selectRaw('COALESCE(SUM(stock), 0)')
            ->whereColumn('product_id', 'products.id');

        $query = Product::with(['categories', 'colors', 'sizes', 'genders'])
            ->select('products.*')
            ->selectSub($stockSubquery, 'total_stock');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->whereHas('categories', fn($q) => $q->where('categories.id', $request->category));
        }

        if ($request->filled('color')) {
            $query->whereHas('colors', fn($q) => $q->where('colors.id', $request->color));
        }

        if ($request->filled('size')) {
            $query->whereHas('sizes', fn($q) => $q->where('sizes.id', $request->size));
        }

        if ($request->filled('gender')) {
            $query->whereHas('genders', fn($q) => $q->where('genders.id', $request->gender));
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('stock_zero')) {
            $query->whereDoesntHave('sizes', fn($q) => $q->where('product_size.stock', '>', 0));
        }

        $sort = $request->input('sort', 'name_asc');
        match ($sort) {
            'name_desc'  => $query->orderBy('name', 'desc'),
            'stock_asc'  => $query->orderBy('total_stock', 'asc')->orderBy('name', 'asc'),
            'stock_desc' => $query->orderBy('total_stock', 'desc')->orderBy('name', 'asc'),
            default      => $query->orderBy('name', 'asc'),
        };

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products'   => $products,
            'filters'    => $request->only(['search', 'category', 'color', 'size', 'gender', 'featured', 'stock_zero', 'sort']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'colors'     => Color::orderBy('name')->get(['id', 'name']),
            'sizes'      => Size::orderBy('name')->get(['id', 'name']),
            'genders'    => Gender::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'is_featured'   => 'boolean',
            'images.*'      => 'nullable|image|max:5120',
            'categories'    => 'nullable|array',
            'categories.*'  => 'exists:categories,id',
            'colors'        => 'nullable|array',
            'colors.*'      => 'exists:colors,id',
            'genders'       => 'nullable|array',
            'genders.*'     => 'exists:genders,id',
            'sizes'         => 'nullable|array',
            'sizes.*.id'    => 'exists:sizes,id',
            'sizes.*.stock' => 'integer|min:0',
        ]);

        $imagePaths = $this->uploadImages($request->file('images') ?? []);

        $id = DB::table('products')->insertGetId([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'is_featured' => $request->boolean('is_featured'),
            'images'      => json_encode($imagePaths),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        $product = Product::find($id);
        $product->categories()->sync($request->input('categories', []));
        $product->colors()->sync($request->input('colors', []));
        $product->genders()->sync($request->input('genders', []));
        $product->sizes()->sync(
            collect($request->input('sizes', []))
                ->mapWithKeys(fn($s) => [$s['id'] => ['stock' => $s['stock']]])
        );

        return back()->with('success', 'Producto creado correctamente.');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name'              => 'required|string|max:255',
            'description'       => 'nullable|string',
            'price'             => 'required|numeric|min:0',
            'is_featured'       => 'boolean',
            'images.*'          => 'nullable|image|max:5120',
            'existing_images'   => 'nullable|array',
            'existing_images.*' => 'nullable|string',
            'categories'        => 'nullable|array',
            'categories.*'      => 'exists:categories,id',
            'colors'            => 'nullable|array',
            'colors.*'          => 'exists:colors,id',
            'genders'           => 'nullable|array',
            'genders.*'         => 'exists:genders,id',
            'sizes'             => 'nullable|array',
            'sizes.*.id'        => 'exists:sizes,id',
            'sizes.*.stock'     => 'integer|min:0',
        ]);

        $keptPaths = array_map(
            fn($url) => $this->urlToStoragePath($url),
            $request->input('existing_images', [])
        );

        $storedPaths = json_decode($product->getRawOriginal('images'), true) ?? [];
        foreach ($storedPaths as $path) {
            if (!in_array($path, $keptPaths)) {
                @unlink(public_path($path));
            }
        }

        $newPaths   = $this->uploadImages($request->file('images') ?? []);
        $finalPaths = array_merge($keptPaths, $newPaths);

        DB::table('products')->where('id', $product->id)->update([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'is_featured' => $request->boolean('is_featured'),
            'images'      => json_encode($finalPaths),
            'updated_at'  => now(),
        ]);

        $product->categories()->sync($request->input('categories', []));
        $product->colors()->sync($request->input('colors', []));
        $product->genders()->sync($request->input('genders', []));
        $product->sizes()->sync(
            collect($request->input('sizes', []))
                ->mapWithKeys(fn($s) => [$s['id'] => ['stock' => $s['stock']]])
        );

        return back()->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Product $product)
    {
        $storedPaths = json_decode($product->getRawOriginal('images'), true) ?? [];
        foreach ($storedPaths as $path) {
            @unlink(public_path($path));
        }

        $product->delete();

        return back()->with('success', 'Producto eliminado correctamente.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'exists:products,id',
        ]);

        $products = Product::whereIn('id', $request->ids)->get();

        foreach ($products as $product) {
            $storedPaths = json_decode($product->getRawOriginal('images'), true) ?? [];
            foreach ($storedPaths as $path) {
                @unlink(public_path($path));
            }
            $product->delete();
        }

        $count = count($request->ids);
        $label = $count === 1 ? 'prenda eliminada' : 'prendas eliminadas';

        return back()->with('success', "{$count} {$label} correctamente.");
    }

    private function uploadImages(array $files): array
    {
        $base    = rtrim(env('PUBLIC_IMAGES_PATH', 'images'), '/');
        $manager = new ImageManager(new Driver());
        $paths   = [];

        foreach ($files as $file) {
            $filename    = uniqid() . '.' . $file->getClientOriginalExtension();
            $destination = public_path($base . '/products');
            $fullPath    = $destination . '/' . $filename;

            $file->move($destination, $filename);

            $image = $manager->read($fullPath);
            if ($image->width() > 800 || $image->height() > 1066) {
                $image->scaleDown(800, 1066)->save($fullPath, quality: 85);
            }

            $paths[] = $base . '/products/' . $filename;
        }

        return $paths;
    }

    private function urlToStoragePath(string $url): string
    {
        $urlBase     = '/' . rtrim(env('PUBLIC_IMAGES_URL_PATH', 'images'), '/') . '/';
        $storageBase = rtrim(env('PUBLIC_IMAGES_PATH', 'images'), '/') . '/';

        return $storageBase . ltrim(str_replace($urlBase, '', $url), '/');
    }
}
