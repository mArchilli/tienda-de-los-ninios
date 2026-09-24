<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('combos', function (Blueprint $table) {
            $table->unsignedInteger('order')->default(0)->after('is_featured');
        });

        // Arranca el orden manual con el mismo criterio que usaba la landing
        // (destacados primero, luego alfabético) para que no cambie nada a la vista
        // hasta que alguien lo reordene a mano desde el panel.
        DB::table('combos')
            ->orderByDesc('is_featured')
            ->orderBy('name')
            ->pluck('id')
            ->each(function ($id, $index) {
                DB::table('combos')->where('id', $id)->update(['order' => $index + 1]);
            });
    }

    public function down(): void
    {
        Schema::table('combos', function (Blueprint $table) {
            $table->dropColumn('order');
        });
    }
};
