<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    const LANDING_COMBOS_TITLE_KEY = 'landing_combos_title';
    const LANDING_COMBOS_TITLE_DEFAULT = 'COMBOS DE ESTA SEMANA';

    const LANDING_HERO_TITLE_TOP_KEY = 'landing_hero_title_top';
    const LANDING_HERO_TITLE_TOP_DEFAULT = 'COMBOS';

    const LANDING_HERO_TITLE_BOTTOM_KEY = 'landing_hero_title_bottom';
    const LANDING_HERO_TITLE_BOTTOM_DEFAULT = 'PARA ARMAR.';

    const LANDING_PRICE_RANGE_TITLE_KEY = 'landing_price_range_title';
    const LANDING_PRICE_RANGE_TITLE_DEFAULT = 'COMBOS PARA EMPRENDEDORES';

    const LANDING_CATALOG_TITLE_KEY = 'landing_catalog_title';
    const LANDING_CATALOG_TITLE_DEFAULT = 'CATALOGO';

    const LANDING_ABOUT_TITLE_KEY = 'landing_about_title';
    const LANDING_ABOUT_TITLE_DEFAULT = 'SOBRE NOSOTROS';

    const LANDING_REVIEWS_TITLE_KEY = 'landing_reviews_title';
    const LANDING_REVIEWS_TITLE_DEFAULT = 'RESEÑAS DE CLIENTES';

    const LANDING_FAQ_TITLE_KEY = 'landing_faq_title';
    const LANDING_FAQ_TITLE_DEFAULT = 'PREGUNTAS FRECUENTES';

    const GIFT_MESSAGE_MAX_LENGTH_KEY = 'gift_message_max_length';
    const GIFT_MESSAGE_MAX_LENGTH_DEFAULT = 150;

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
