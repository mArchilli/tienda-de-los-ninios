<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('combo_emprendedor_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('combo_emprendedor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['combo_emprendedor_id', 'product_id'], 'ce_item_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_emprendedor_items');
    }
};
