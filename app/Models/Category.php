<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }

    public function comboItems()
    {
        return $this->hasMany(ComboItem::class);
    }

    public function comboEmprendedorLimits()
    {
        return $this->hasMany(ComboEmprendedorCategoryLimit::class);
    }
}
