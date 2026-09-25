<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channel_sales', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 20);
            // Carga siempre diaria; la vista "Mes" de Métricas suma los días
            // del mes, igual que ya hace con los pedidos online.
            $table->date('date');
            $table->unsignedInteger('sales_count')->default(0);
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['channel', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channel_sales');
    }
};
