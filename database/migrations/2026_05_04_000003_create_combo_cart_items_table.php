<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('combo_cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('combo_id')->constrained()->cascadeOnDelete();
            $table->string('size');
            $table->decimal('price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->json('combo_data');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_cart_items');
    }
};
