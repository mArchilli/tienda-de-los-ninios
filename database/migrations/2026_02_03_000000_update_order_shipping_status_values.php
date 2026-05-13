<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Actualizar los valores de shipping_status de español a inglés
        DB::table('orders')->whereIn('shipping_status', ['Pendiente', 'pendiente'])->update(['shipping_status' => 'pending']);
        DB::table('orders')->whereIn('shipping_status', ['Despachado', 'despachado'])->update(['shipping_status' => 'dispatched']);
        DB::table('orders')->whereIn('shipping_status', ['Entregado', 'entregado'])->update(['shipping_status' => 'delivered']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir los valores al formato anterior
        DB::table('orders')->where('shipping_status', 'pending')->update(['shipping_status' => 'Pendiente']);
        DB::table('orders')->where('shipping_status', 'dispatched')->update(['shipping_status' => 'Despachado']);
        DB::table('orders')->where('shipping_status', 'delivered')->update(['shipping_status' => 'Entregado']);
    }
};
