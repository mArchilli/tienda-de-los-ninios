<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use League\Glide\ServerFactory;

class ImageController extends Controller
{
    public function show(Request $request, string $filename)
    {
        $path = 'images/products/' . $filename;

        $server = ServerFactory::create([
            'source' => public_path(),
            'cache'  => storage_path('app/glide-cache'),
        ]);

        try {
            $params    = $request->only(['w', 'h', 'fit', 'q', 'fm']);
            $cachePath = $server->makeImage($path, $params);
            $fullPath  = storage_path('app/glide-cache') . '/' . $cachePath;

            return response()->file($fullPath, [
                'Cache-Control' => 'public, max-age=31536000',
            ]);
        } catch (\Exception) {
            abort(404);
        }
    }
}
