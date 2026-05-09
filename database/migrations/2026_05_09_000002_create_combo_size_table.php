<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('combo_size', function (Blueprint $table) {
            $table->foreignId('combo_id')->constrained()->cascadeOnDelete();
            $table->foreignId('size_id')->constrained()->cascadeOnDelete();
            $table->primary(['combo_id', 'size_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_size');
    }
};
