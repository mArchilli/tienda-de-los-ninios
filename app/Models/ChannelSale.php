<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChannelSale extends Model
{
    public const CHANNELS = [
        'whatsapp'  => 'WhatsApp',
        'instagram' => 'Instagram',
        'tiktok'    => 'TikTok Live',
    ];

    protected $fillable = ['channel', 'date', 'sales_count', 'amount'];

    protected $casts = [
        'date'        => 'date',
        'sales_count' => 'integer',
        'amount'      => 'decimal:2',
    ];
}
