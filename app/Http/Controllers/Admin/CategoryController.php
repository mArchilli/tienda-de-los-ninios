<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
        ]);

        Category::create(['name' => $request->name]);

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name,' . $category->id,
        ]);

        $category->update(['name' => $request->name]);

        return back()->with('success', 'Categoría actualizada correctamente.');
    }

    public function destroy(Category $category)
    {
        $reasons = [];
        if ($category->products()->exists()) $reasons[] = 'prendas';
        if ($category->comboItems()->exists() || $category->comboEmprendedorLimits()->exists()) $reasons[] = 'combos';

        if (! empty($reasons)) {
            return back()->withErrors([
                'delete' => "No se puede eliminar la categoría «{$category->name}» porque está en uso en " . implode(' y ', $reasons) . '. Quitala de ahí primero.',
            ]);
        }

        $category->delete();

        return back()->with('success', 'Categoría eliminada correctamente.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'exists:categories,id',
        ]);

        $blocking = Category::whereIn('id', $request->ids)
            ->where(fn ($q) => $q->whereHas('products')
                ->orWhereHas('comboItems')
                ->orWhereHas('comboEmprendedorLimits'))
            ->pluck('name');

        if ($blocking->isNotEmpty()) {
            return back()->withErrors([
                'bulk' => 'No se pueden eliminar estas categorías porque están en uso en prendas o combos: ' . $blocking->implode(', ') . '. Quitalas de ahí primero.',
            ]);
        }

        Category::whereIn('id', $request->ids)->delete();

        $count = count($request->ids);
        $label = $count === 1 ? 'categoría eliminada' : 'categorías eliminadas';

        return back()->with('success', "{$count} {$label} correctamente.");
    }
}
