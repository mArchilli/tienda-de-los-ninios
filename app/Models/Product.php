<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
     use HasFactory;

    protected $fillable = [
        'name', 'description', 'price', 'images', 'is_featured'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    protected function images(): Attribute
    {
        $storagePath = rtrim(env('PUBLIC_IMAGES_PATH', 'images'), '/');
        $urlPath     = rtrim(env('PUBLIC_IMAGES_URL_PATH', 'images'), '/');

        return Attribute::make(
            get: fn ($value) => array_map(
                fn ($path) => '/' . $urlPath . '/' . ltrim(substr($path, strlen($storagePath) + 1), '/'),
                json_decode($value, true) ?? []
            ),
            set: fn ($value) => json_encode(
                array_map(
                    fn ($url) => $storagePath . '/' . ltrim(substr(ltrim($url, '/'), strlen($urlPath) + 1), '/'),
                    (array) $value
                )
            ),
        );
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function sizes()
    {
        return $this->belongsToMany(Size::class)->withPivot('stock');
    }

    public function colors()
    {
        return $this->belongsToMany(Color::class);
    }

    public function genders()
    {
        return $this->belongsToMany(Gender::class);
    }
}
