<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboEmprendedor extends Model
{
    protected $table = 'combo_emprendedors';

    protected $fillable = [
        'name',
        'description',
        'price',
        'max_items',
        'is_active',
        'is_featured',
        'image',
    ];

    protected $casts = [
        'price'       => 'decimal:2',
        'max_items'   => 'integer',
        'is_active'   => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(ComboEmprendedorItem::class);
    }

    public function genders()
    {
        return $this->belongsToMany(Gender::class, 'combo_emprendedor_gender');
    }

    public function categoryLimits()
    {
        return $this->hasMany(ComboEmprendedorCategoryLimit::class);
    }
}
