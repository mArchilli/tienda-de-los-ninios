<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    public const TYPES = [
        'fixed'    => 'Fijo',
        'variable' => 'Variable',
    ];

    protected $fillable = ['title', 'amount', 'type', 'month'];

    protected $casts = [
        'amount' => 'decimal:2',
    ];
}
