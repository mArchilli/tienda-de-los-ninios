<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComboCartItem extends Model
{
    protected $fillable = ['cart_id', 'combo_id', 'size', 'price', 'quantity', 'combo_data'];

    protected $casts = [
        'combo_data' => 'array',
        'price'      => 'decimal:2',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function combo()
    {
        return $this->belongsTo(Combo::class);
    }

    public function getUnitPriceAttribute(): float
    {
        return (float) $this->price;
    }
}
