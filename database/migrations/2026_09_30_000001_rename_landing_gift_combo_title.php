<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')
            ->where('key', 'landing_price_range_title')
            ->update(['value' => 'COMBOS PARA REGALO']);
    }

    public function down(): void
    {
        // Los títulos personalizados no se revierten automáticamente.
    }
};
