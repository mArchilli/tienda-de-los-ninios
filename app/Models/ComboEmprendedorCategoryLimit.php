<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboEmprendedorCategoryLimit extends Model
{
    protected $table = 'combo_emprendedor_category_limits';

    protected $fillable = [
        'combo_emprendedor_id',
        'category_id',
        'max_items',
    ];

    protected $casts = [
        'max_items' => 'integer',
    ];

    public function combo()
    {
        return $this->belongsTo(ComboEmprendedor::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
