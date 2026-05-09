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
        $color->delete();

        return back()->with('success', 'Color eliminado correctamente.');
    }
}
