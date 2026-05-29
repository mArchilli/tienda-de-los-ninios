<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboEmprendedorItem extends Model
{
    protected $fillable = ['combo_emprendedor_id', 'product_id'];

    public function combo()
    {
        return $this->belongsTo(ComboEmprendedor::class, 'combo_emprendedor_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
