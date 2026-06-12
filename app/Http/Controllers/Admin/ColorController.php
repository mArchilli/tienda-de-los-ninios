<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ColorController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Colors/Index', [
            'colors' => Color::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:colors,name',
        ]);

        Color::create(['name' => $request->name]);

        return back()->with('success', 'Color creado correctamente.');
    }

    public function update(Request $request, Color $color)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:colors,name,' . $color->id,
        ]);

        $color->update(['name' => $request->name]);

        return back()->with('success', 'Color actualizado correctamente.');
    }

    public function destroy(Color $color)
    {
        if ($color->products()->exists()) {
            return back()->withErrors([
                'delete' => "No se puede eliminar el color «{$color->name}» porque tiene prendas asociadas. Quitalo de esas prendas primero.",
            ]);
        }

        $color->delete();

        return back()->with('success', 'Color eliminado correctamente.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'exists:colors,id',
        ]);

        $blocking = Color::whereIn('id', $request->ids)
            ->whereHas('products')
            ->pluck('name');

        if ($blocking->isNotEmpty()) {
            return back()->withErrors([
                'bulk' => 'No se pueden eliminar estos colores porque tienen prendas asociadas: ' . $blocking->implode(', ') . '. Quitalos de esas prendas primero.',
            ]);
        }

        Color::whereIn('id', $request->ids)->delete();

        $count = count($request->ids);
        $label = $count === 1 ? 'color eliminado' : 'colores eliminados';

        return back()->with('success', "{$count} {$label} correctamente.");
    }
}
