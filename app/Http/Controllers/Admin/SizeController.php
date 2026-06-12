<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SizeController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sizes/Index', [
            'sizes' => Size::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:sizes,name',
        ]);

        Size::create(['name' => $request->name]);

        return back()->with('success', 'Talle creado correctamente.');
    }

    public function update(Request $request, Size $size)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:sizes,name,' . $size->id,
        ]);

        $size->update(['name' => $request->name]);

        return back()->with('success', 'Talle actualizado correctamente.');
    }

    public function destroy(Size $size)
    {
        $reasons = [];
        if ($size->products()->exists()) $reasons[] = 'prendas';
        if ($size->combos()->exists())   $reasons[] = 'combos';

        if (! empty($reasons)) {
            return back()->withErrors([
                'delete' => "No se puede eliminar el talle «{$size->name}» porque está en uso en " . implode(' y ', $reasons) . '. Quitalo de ahí primero.',
            ]);
        }

        $size->delete();

        return back()->with('success', 'Talle eliminado correctamente.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'exists:sizes,id',
        ]);

        $blocking = Size::whereIn('id', $request->ids)
            ->where(fn ($q) => $q->whereHas('products')->orWhereHas('combos'))
            ->pluck('name');

        if ($blocking->isNotEmpty()) {
            return back()->withErrors([
                'bulk' => 'No se pueden eliminar estos talles porque están en uso en prendas o combos: ' . $blocking->implode(', ') . '. Quitalos de ahí primero.',
            ]);
        }

        Size::whereIn('id', $request->ids)->delete();

        $count = count($request->ids);
        $label = $count === 1 ? 'talle eliminado' : 'talles eliminados';

        return back()->with('success', "{$count} {$label} correctamente.");
    }
}
