<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboItem extends Model
{
    protected $fillable = ['combo_id', 'category_id', 'quantity', 'product_id'];

    public function combo()
    {
        return $this->belongsTo(Combo::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
