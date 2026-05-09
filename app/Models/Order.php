<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    const SHIPPING_STATUS_PENDING = 'pending';
    const SHIPPING_STATUS_DISPATCHED = 'dispatched';
    const SHIPPING_STATUS_DELIVERED = 'delivered';

    protected $fillable = [
        'user_id',
        'payment_id',
        'total',
        'status',
        'province',
        'city',
        'postal_code',
        'address',
        'phone',
        'shipping_method',
        'shipping_status',
        'dni',
        'first_name',
        'last_name',
        'email',
        'observations',
        'courier_company',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
