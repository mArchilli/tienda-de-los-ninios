<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    const LANDING_COMBOS_TITLE_KEY = 'landing_combos_title';
    const LANDING_COMBOS_TITLE_DEFAULT = 'COMBOS DE ESTA SEMANA';

    protected $fillable = ['key', 'value'];

    public static function get(string $key, ?string $default = null): ?string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, ?string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
