<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            // 'fixed' se repite todos los meses (alquiler, sueldos, etc.),
            // 'variable' es puntual de ese mes.
            $table->string('type', 10);
            // Los gastos son un concepto mensual: 'YYYY-MM'.
            $table->string('month', 7);
            $table->timestamps();

            $table->index(['month', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
