<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Color;
use App\Models\ComboItem;
use App\Models\Gender;
use App\Models\Product;
use App\Models\Size;
use App\Services\ImageProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ProductController extends Controller
{
    public function __construct(private ImageProcessor $imageProcessor) {}

    private function filteredQuery(Request $request)
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

        $sort = $request->input('sort', 'date_desc');
        match ($sort) {
            'name_asc'   => $query->orderBy('name', 'asc'),
            'name_desc'  => $query->orderBy('name', 'desc'),
            'stock_asc'  => $query->orderBy('total_stock', 'asc')->orderBy('name', 'asc'),
            'stock_desc' => $query->orderBy('total_stock', 'desc')->orderBy('name', 'asc'),
            'date_asc'   => $query->orderBy('created_at', 'asc')->orderBy('id', 'asc'),
            default      => $query->orderBy('created_at', 'desc')->orderBy('id', 'desc'),
        };

        return $query;
    }

    public function index(Request $request)
    {
        $products = $this->filteredQuery($request)->paginate(12)->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products'   => $products,
            'filters'    => $request->only(['search', 'category', 'color', 'size', 'gender', 'featured', 'stock_zero', 'sort']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'colors'     => Color::orderBy('name')->get(['id', 'name']),
            'sizes'      => Size::orderBy('name')->get(['id', 'name']),
            'genders'    => Gender::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function export(Request $request)
    {
        $products = $this->filteredQuery($request)->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Prendas');

        $headings = ['ID', 'Nombre', 'Precio', 'Categorías', 'Colores', 'Géneros', 'Talles y stock', 'Stock total', 'Destacada', 'Creada'];
        $sheet->fromArray($headings, null, 'A1');
        $sheet->getStyle('A1:J1')->getFont()->setBold(true);

        $row = 2;
        foreach ($products as $product) {
            $sheet->fromArray([
                $product->id,
                $product->name,
                (float) $product->price,
                $product->categories->pluck('name')->implode(', '),
                $product->colors->pluck('name')->implode(', '),
                $product->genders->pluck('name')->implode(', '),
                $product->sizes->map(fn($s) => $s->name . ': ' . ($s->pivot->stock ?? 0))->implode(', '),
                (int) $product->total_stock,
                $product->is_featured ? 'Sí' : 'No',
                optional($product->created_at)->format('d/m/Y'),
            ], null, "A{$row}");
            $row++;
        }

        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'prendas-' . now()->format('Y-m-d-His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
            'categories'    => 'required|array',
            'categories.*'  => 'exists:categories,id',
            'colors'        => 'required|array',
            'colors.*'      => 'exists:colors,id',
            'genders'       => 'required|array',
            'genders.*'     => 'exists:genders,id',
            'sizes'         => 'nullable|array',
            'sizes.*.id'    => 'exists:sizes,id',
            'sizes.*.stock' => 'integer|min:0',
            'add_to_combos'                => 'nullable|array',
            'add_to_combos.*.combo_id'     => 'required|exists:combos,id',
            'add_to_combos.*.category_id'  => 'required|exists:categories,id',
        ], [
            'genders.required'    => 'Seleccioná al menos un género para la prenda.',
            'categories.required' => 'Seleccioná al menos una categoría para la prenda.',
            'colors.required'     => 'Seleccioná al menos un color para la prenda.',
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

        $this->addToCombos($product, $request);

        return back()->with('success', 'Producto creado correctamente.');
    }

    /**
     * Suma la prenda recién creada como opción elegible en los combos que el
     * admin haya marcado desde el formulario de carga, respetando la cantidad
     * ya definida para esa categoría dentro de cada combo.
     */
    private function addToCombos(Product $product, Request $request): void
    {
        $categoryIds = array_map('intval', $request->input('categories', []));

        $pairs = collect($request->input('add_to_combos', []))
            ->filter(fn ($pair) => in_array((int) ($pair['category_id'] ?? null), $categoryIds, true))
            ->unique(fn ($pair) => $pair['combo_id'] . '-' . $pair['category_id']);

        foreach ($pairs as $pair) {
            $quantity = ComboItem::where('combo_id', $pair['combo_id'])
                ->where('category_id', $pair['category_id'])
                ->value('quantity') ?? 1;

            ComboItem::firstOrCreate([
                'combo_id'    => $pair['combo_id'],
                'category_id' => $pair['category_id'],
                'product_id'  => $product->id,
            ], [
                'quantity' => $quantity,
            ]);
        }
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
        $base  = rtrim(env('PUBLIC_IMAGES_PATH', 'images'), '/');
        $paths = [];

        foreach ($files as $file) {
            $filename    = uniqid() . '.' . $file->getClientOriginalExtension();
            $destination = public_path($base . '/products');
            $fullPath    = $destination . '/' . $filename;

            $file->move($destination, $filename);

            $this->imageProcessor->resizeDownInPlace($fullPath, 800, 1066, 85);

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
