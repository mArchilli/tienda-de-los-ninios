<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\ComboController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SizeController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ComboController as StorefrontComboController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ProductController as StorefrontProductController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/images/products/{filename}', [ImageController::class, 'show'])->where('filename', '.*');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('admin')->middleware(['auth', 'verified'])->name('admin.')->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::post('/products/{product}', [ProductController::class, 'update'])->name('products.update');
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
});

require __DIR__.'/auth.php';
