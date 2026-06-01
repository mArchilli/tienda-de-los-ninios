<?php

namespace App\Http\Controllers;

use App\Services\ImageProcessor;
use Illuminate\Http\Request;
use League\Glide\ServerFactory;

class ImageController extends Controller
{
    public function show(Request $request, string $filename, ImageProcessor $processor)
    {
        $relativePath = 'images/products/' . $filename;
        $sourcePath   = public_path($relativePath);

        if (! $processor->isAvailable()) {
            if (! is_file($sourcePath)) {
                abort(404);
            }

            return response()->file($sourcePath, [
                'Cache-Control' => 'public, max-age=31536000',
            ]);
        }

        $server = ServerFactory::create([
            'source' => public_path(),
            'cache'  => storage_path('app/glide-cache'),
            'driver' => $processor->driver(),
        ]);

        try {
            $params    = $request->only(['w', 'h', 'fit', 'q', 'fm']);
            $cachePath = $server->makeImage($relativePath, $params);
            $fullPath  = storage_path('app/glide-cache') . '/' . $cachePath;

            return response()->file($fullPath, [
                'Cache-Control' => 'public, max-age=31536000',
            ]);
        } catch (\Exception) {
            abort(404);
        }
    }
}
