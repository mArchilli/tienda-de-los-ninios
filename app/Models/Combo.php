<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Combo extends Model
{
    protected $fillable = ['name', 'description', 'price', 'is_active', 'is_featured', 'image', 'gender_id'];

    protected $casts = [
        'price'       => 'decimal:2',
        'is_active'   => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(ComboItem::class);
    }

    public function sizes()
    {
        return $this->belongsToMany(Size::class);
    }

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }
}
