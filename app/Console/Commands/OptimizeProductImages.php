<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class OptimizeProductImages extends Command
{
    protected $signature   = 'images:optimize {--dry-run : Muestra qué imágenes serían procesadas sin modificarlas}';
    protected $description = 'Redimensiona las imágenes existentes en public/images/products a un máximo de 800×1066 px';

    private const MAX_WIDTH  = 800;
    private const MAX_HEIGHT = 1066;
    private const QUALITY    = 85;

    public function handle(): int
    {
        $dir     = public_path('images/products');
        $dryRun  = $this->option('dry-run');
        $manager = new ImageManager(new Driver());

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

        $this->info(sprintf('Encontradas %d imágenes.%s', count($files), $dryRun ? ' (dry-run)' : ''));

        $processed = 0;
        $skipped   = 0;

        foreach ($files as $path) {
            try {
                $image = $manager->read($path);
                $w     = $image->width();
                $h     = $image->height();

                if ($w <= self::MAX_WIDTH && $h <= self::MAX_HEIGHT) {
                    $this->line("  <fg=gray>SKIP</> " . basename($path) . " ({$w}×{$h})");
                    $skipped++;
                    continue;
                }

                $this->line("  <fg=green>OPT</>  " . basename($path) . " ({$w}×{$h} → máx " . self::MAX_WIDTH . "×" . self::MAX_HEIGHT . ")");

                if (!$dryRun) {
                    $image->scaleDown(self::MAX_WIDTH, self::MAX_HEIGHT);
                    $image->save($path, quality: self::QUALITY);
                }

                $processed++;
            } catch (\Throwable $e) {
                $this->warn("  ERROR " . basename($path) . ": " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info("Procesadas: {$processed} | Saltadas (ya optimizadas): {$skipped}");

        return self::SUCCESS;
    }
}
