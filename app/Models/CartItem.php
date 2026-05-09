<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['cart_id', 'product_id', 'quantity', 'size', 'price'];

    protected $appends = ['unit_price'];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the unit price (uses saved price or product price as fallback)
     */
    public function getUnitPriceAttribute()
    {
        // Si existe el precio guardado, usarlo
        if ($this->price !== null) {
            return (float) $this->price;
        }

        // Si no, cargar el producto y obtener el precio con oferta si aplica
        if ($this->product) {
            $this->product->load('activeOffer');
            return $this->product->active_offer 
                ? (float) $this->product->active_offer->discount_price 
                : (float) $this->product->price;
        }

        return 0;
    }
}
