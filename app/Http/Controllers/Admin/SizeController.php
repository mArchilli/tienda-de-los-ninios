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
        $size->delete();

        return back()->with('success', 'Talle eliminado correctamente.');
    }
}
