<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Size extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot('stock');
    }

    public function combos()
    {
        return $this->belongsToMany(Combo::class);
    }

    /**
     * Clave de orden por familia + valor numérico.
     * Bebé < Niño/a < Otros; dentro de cada familia, asc por primer número del nombre.
     *
     * @return array{0:int,1:int}
     */
    public static function sortKey(string $name): array
    {
        $lower = mb_strtolower($name);
        if (str_contains($lower, 'bebe') || str_contains($lower, 'bebé')) {
            $cat = 0;
        } elseif (str_contains($lower, 'niño') || str_contains($lower, 'niña')
            || str_contains($lower, 'nino') || str_contains($lower, 'nina')) {
            $cat = 1;
        } else {
            $cat = 2;
        }
        preg_match('/\d+/', $name, $m);
        $num = isset($m[0]) ? (int) $m[0] : PHP_INT_MAX;
        return [$cat, $num];
    }

    public static function compareNames(string $a, string $b): int
    {
        return self::sortKey($a) <=> self::sortKey($b);
    }
}
