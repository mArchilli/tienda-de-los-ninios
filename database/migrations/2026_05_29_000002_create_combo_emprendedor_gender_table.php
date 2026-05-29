<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('combo_emprendedor_gender', function (Blueprint $table) {
            $table->id();
            $table->foreignId('combo_emprendedor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gender_id')->constrained()->cascadeOnDelete();
            $table->unique(['combo_emprendedor_id', 'gender_id'], 'ce_gender_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combo_emprendedor_gender');
    }
};
