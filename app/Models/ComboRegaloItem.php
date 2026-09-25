<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboRegaloItem extends Model
{
    protected $fillable = ['combo_regalo_id', 'category_id', 'quantity', 'product_id'];

    public function combo()
    {
        return $this->belongsTo(ComboRegalo::class, 'combo_regalo_id');
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
