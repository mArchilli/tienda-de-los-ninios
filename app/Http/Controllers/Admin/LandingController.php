<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Un solo lugar con todos los títulos editables de las secciones de la
     * landing, para no repartir esta configuración por distintas pantallas.
     */
    private const SECTIONS = [
        'hero_title_top' => [
            'key'     => Setting::LANDING_HERO_TITLE_TOP_KEY,
            'default' => Setting::LANDING_HERO_TITLE_TOP_DEFAULT,
        ],
        'hero_title_bottom' => [
            'key'     => Setting::LANDING_HERO_TITLE_BOTTOM_KEY,
            'default' => Setting::LANDING_HERO_TITLE_BOTTOM_DEFAULT,
        ],
        'combos_title' => [
            'key'     => Setting::LANDING_COMBOS_TITLE_KEY,
            'default' => Setting::LANDING_COMBOS_TITLE_DEFAULT,
        ],
        'price_range_title' => [
            'key'     => Setting::LANDING_PRICE_RANGE_TITLE_KEY,
            'default' => Setting::LANDING_PRICE_RANGE_TITLE_DEFAULT,
        ],
        'catalog_title' => [
            'key'     => Setting::LANDING_CATALOG_TITLE_KEY,
            'default' => Setting::LANDING_CATALOG_TITLE_DEFAULT,
        ],
        'about_title' => [
            'key'     => Setting::LANDING_ABOUT_TITLE_KEY,
            'default' => Setting::LANDING_ABOUT_TITLE_DEFAULT,
        ],
        'reviews_title' => [
            'key'     => Setting::LANDING_REVIEWS_TITLE_KEY,
            'default' => Setting::LANDING_REVIEWS_TITLE_DEFAULT,
        ],
        'faq_title' => [
            'key'     => Setting::LANDING_FAQ_TITLE_KEY,
            'default' => Setting::LANDING_FAQ_TITLE_DEFAULT,
        ],
    ];

    public function edit()
    {
        $titles = [];
        foreach (self::SECTIONS as $field => $section) {
            $titles[$field] = Setting::get($section['key'], $section['default']);
        }

        return Inertia::render('Admin/Landing/Index', [
            'titles' => $titles,
        ]);
    }

    public function update(Request $request)
    {
        $notBlank = function (string $attribute, $value, \Closure $fail) {
            if (trim((string) $value) === '') {
                $fail('El título no puede estar vacío.');
            }
        };

        $rules = [];
        foreach (array_keys(self::SECTIONS) as $field) {
            $rules[$field] = ['required', 'string', 'max:120', $notBlank];
        }

        $data = $request->validate($rules);

        foreach (self::SECTIONS as $field => $section) {
            Setting::set($section['key'], trim($data[$field]));
        }

        return back()->with('success', 'Títulos de la landing actualizados correctamente.');
    }
}
