<?php

namespace App\Console\Commands;

use App\Services\ImageProcessor;
use Illuminate\Console\Command;

class OptimizeProductImages extends Command
{
    protected $signature   = 'images:optimize {--dry-run : Muestra qué imágenes serían procesadas sin modificarlas}';
    protected $description = 'Redimensiona las imágenes existentes en public/images/products a un máximo de 800×1066 px';

    private const MAX_WIDTH  = 800;
    private const MAX_HEIGHT = 1066;
    private const QUALITY    = 85;

    public function handle(ImageProcessor $processor): int
    {
        if (! $processor->isAvailable()) {
            $this->error('No hay driver de imágenes disponible (ni GD ni Imagick). Instalá una de las dos extensiones de PHP.');
            return self::FAILURE;
        }

        $dir    = public_path('images/products');
        $dryRun = $this->option('dry-run');

        if (!is_dir($dir)) {
            $this->error("El directorio {$dir} no existe.");
            return self::FAILURE;
        }

        $files = array_filter(
            glob($dir . '/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}', GLOB_BRACE),
            'is_file'
        );

        if (empty($files)) {
            $this->info('No se encontraron imágenes.');
            return self::SUCCESS;
        }

        $this->info(sprintf('Driver: %s · Encontradas %d imágenes.%s', $processor->driver(), count($files), $dryRun ? ' (dry-run)' : ''));

        $processed = 0;
        $skipped   = 0;

        foreach ($files as $path) {
            try {
                if ($dryRun) {
                    ['width' => $w, 'height' => $h] = $processor->dimensions($path);
                    if ($w > self::MAX_WIDTH || $h > self::MAX_HEIGHT) {
                        $this->line("  <fg=green>OPT</>  " . basename($path) . " ({$w}×{$h} → máx " . self::MAX_WIDTH . "×" . self::MAX_HEIGHT . ")");
                        $processed++;
                    } else {
                        $this->line("  <fg=gray>SKIP</> " . basename($path) . " ({$w}×{$h})");
                        $skipped++;
                    }
                    continue;
                }

                $result = $processor->resizeDownInPlace($path, self::MAX_WIDTH, self::MAX_HEIGHT, self::QUALITY);
                if ($result['resized']) {
                    $this->line("  <fg=green>OPT</>  " . basename($path) . " ({$result['width']}×{$result['height']} → máx " . self::MAX_WIDTH . "×" . self::MAX_HEIGHT . ")");
                    $processed++;
                } else {
                    $this->line("  <fg=gray>SKIP</> " . basename($path) . " ({$result['width']}×{$result['height']})");
                    $skipped++;
                }
            } catch (\Throwable $e) {
                $this->warn("  ERROR " . basename($path) . ": " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info("Procesadas: {$processed} | Saltadas (ya optimizadas): {$skipped}");

        return self::SUCCESS;
    }
}
