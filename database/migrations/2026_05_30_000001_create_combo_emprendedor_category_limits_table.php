<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('combo_emprendedor_category_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('combo_emprendedor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('max_items');
            $table->timestamps();
            $table->unique(['combo_emprendedor_id', 'category_id'], 'ce_cat_limit_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_emprendedor_category_limits');
    }
};
