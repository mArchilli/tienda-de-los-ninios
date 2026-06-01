<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Drivers\Imagick\Driver as ImagickDriver;
use Intervention\Image\ImageManager;

class ImageProcessor
{
    public const DRIVER_GD      = 'gd';
    public const DRIVER_IMAGICK = 'imagick';
    public const DRIVER_NONE    = 'none';

    private ?ImageManager $manager;
    private string $driver;

    public function __construct()
    {
        if (extension_loaded('gd')) {
            $this->manager = new ImageManager(new GdDriver());
            $this->driver  = self::DRIVER_GD;
        } elseif (extension_loaded('imagick')) {
            $this->manager = new ImageManager(new ImagickDriver());
            $this->driver  = self::DRIVER_IMAGICK;
        } else {
            $this->manager = null;
            $this->driver  = self::DRIVER_NONE;
            Log::warning('ImageProcessor: ni GD ni Imagick están disponibles. Las imágenes se guardarán sin redimensionar.');
        }
    }

    public function driver(): string
    {
        return $this->driver;
    }

    public function isAvailable(): bool
    {
        return $this->manager !== null;
    }

    /**
     * Redimensiona en-place si la imagen excede los límites. No-op si no hay driver disponible.
     *
     * @return array{resized:bool, width:?int, height:?int}
     */
    /**
     * Devuelve {width, height} de la imagen o null si no hay driver disponible.
     *
     * @return array{width:int, height:int}|null
     */
    public function dimensions(string $path): ?array
    {
        if (! $this->isAvailable()) {
            return null;
        }

        $image = $this->manager->read($path);

        return ['width' => $image->width(), 'height' => $image->height()];
    }

    public function resizeDownInPlace(string $path, int $maxWidth, int $maxHeight, int $quality = 85): array
    {
        if (! $this->isAvailable()) {
            return ['resized' => false, 'width' => null, 'height' => null];
        }

        $image = $this->manager->read($path);
        $w     = $image->width();
        $h     = $image->height();

        if ($w <= $maxWidth && $h <= $maxHeight) {
            return ['resized' => false, 'width' => $w, 'height' => $h];
        }

        $image->scaleDown($maxWidth, $maxHeight)->save($path, quality: $quality);

        return ['resized' => true, 'width' => $w, 'height' => $h];
    }
}
