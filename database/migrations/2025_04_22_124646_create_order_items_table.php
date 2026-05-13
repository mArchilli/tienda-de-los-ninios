<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderItemsTable extends Migration
{
    public function up()
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade'); // Relación con la orden
            $table->foreignId('product_id')->constrained()->onDelete('cascade'); // Producto comprado
            $table->integer('quantity'); // Cantidad comprada
            $table->decimal('price', 10, 2); // Precio unitario del producto
            $table->string('size')->nullable(); // Talle seleccionado
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_items');
    }
}