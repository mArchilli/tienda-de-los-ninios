<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\ComboController;
use App\Http\Controllers\Admin\MetricsController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SizeController;
use App\Http\Controllers\CartController;
use App\Models\Combo;
use App\Models\Product;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ComboController as StorefrontComboController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ProductController as StorefrontProductController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/images/products/{filename}', [ImageController::class, 'show'])->where('filename', '.*');

Route::get('/', function () {
    $combos = Combo::where('is_active', true)
        ->orderByDesc('is_featured')
        ->orderBy('name')
        ->get(['id', 'name', 'description', 'price', 'image', 'is_featured'])
        ->map(fn ($c) => [
            'id'         => $c->id,
            'name'       => $c->name,
            'desc'       => $c->description,
            'price'      => (float) $c->price,
            'image'      => $c->image ? '/' . ltrim($c->image, '/') : null,
            'badge'      => $c->is_featured ? 'DESTACADO' : null,
            'badgeColor' => $c->is_featured ? 'bg-brand-cta' : null,
        ])
        ->values();

    $products = Product::where('is_featured', true)
        ->orderBy('name')
        ->get(['id', 'name', 'price', 'images'])
        ->map(fn ($p) => [
            'id'    => $p->id,
            'name'  => $p->name,
            'price' => (float) $p->price,
            'image' => $p->images[0] ?? null,
        ])
        ->values();

    return Inertia::render('Welcome', [
        'featuredCombos'   => $combos,
        'featuredProducts' => $products,
    ]);
})->name('home');

Route::get('/catalogo', [CatalogController::class, 'index'])->name('catalog');
Route::get('/producto/{product}', [StorefrontProductController::class, 'show'])->name('product.show');
Route::get('/combo/{combo}', [StorefrontComboController::class, 'show'])->name('combo.show');

Route::get('/carrito', [CartController::class, 'index'])->name('cart.index');
Route::post('/carrito/producto', [CartController::class, 'addProduct'])->name('cart.add-product');
Route::post('/carrito/combo', [CartController::class, 'addCombo'])->name('cart.add-combo');
Route::patch('/carrito/{key}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/carrito/{key}', [CartController::class, 'remove'])->name('cart.remove');
Route::delete('/carrito', [CartController::class, 'clear'])->name('cart.clear');
Route::get('/checkout', [CartController::class, 'checkout'])->name('checkout.index');
Route::post('/checkout', [CartController::class, 'placeOrder'])->name('checkout.store');
Route::get('/checkout/confirmacion', [CartController::class, 'confirmation'])->name('checkout.confirmation');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('admin')->middleware(['auth', 'verified'])->name('admin.')->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::post('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/bulk', [ProductController::class, 'bulkDestroy'])->name('products.bulk-destroy');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/sizes', [SizeController::class, 'index'])->name('sizes.index');
    Route::post('/sizes', [SizeController::class, 'store'])->name('sizes.store');
    Route::put('/sizes/{size}', [SizeController::class, 'update'])->name('sizes.update');
    Route::delete('/sizes/{size}', [SizeController::class, 'destroy'])->name('sizes.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/colors', [ColorController::class, 'index'])->name('colors.index');
    Route::post('/colors', [ColorController::class, 'store'])->name('colors.store');
    Route::put('/colors/{color}', [ColorController::class, 'update'])->name('colors.update');
    Route::delete('/colors/{color}', [ColorController::class, 'destroy'])->name('colors.destroy');

    Route::get('/combos/categories-for-sizes', [ComboController::class, 'categoriesWithProducts'])->name('combos.categories-for-sizes');
    Route::get('/combos', [ComboController::class, 'index'])->name('combos.index');
    Route::post('/combos', [ComboController::class, 'store'])->name('combos.store');
    Route::post('/combos/{combo}', [ComboController::class, 'update'])->name('combos.update');
    Route::delete('/combos/{combo}', [ComboController::class, 'destroy'])->name('combos.destroy');

    Route::get('/metrics', [MetricsController::class, 'index'])->name('metrics.index');
    Route::get('/metrics/orders', [MetricsController::class, 'orders'])->name('metrics.orders');
    Route::patch('/metrics/orders', [MetricsController::class, 'updateOrders'])->name('metrics.orders.update');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
});

require __DIR__.'/auth.php';
