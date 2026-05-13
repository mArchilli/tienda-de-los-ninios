<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear tabla pivot (solo si no existe)
        if (!Schema::hasTable('gender_product')) {
            Schema::create('gender_product', function (Blueprint $table) {
                $table->id();
                $table->foreignId('gender_id')->constrained()->onDelete('cascade');
                $table->foreignId('product_id')->constrained()->onDelete('cascade');
                $table->unique(['gender_id', 'product_id']);
            });
        }

        // 2. Migrar datos existentes solo si la columna gender_id todavía existe en products
        if (Schema::hasColumn('products', 'gender_id')) {
            DB::statement('INSERT IGNORE INTO gender_product (gender_id, product_id) SELECT gender_id, id FROM products WHERE gender_id IS NOT NULL');

            // 3. Eliminar la foreign key y la columna gender_id de products
            Schema::table('products', function (Blueprint $table) {
                $table->dropForeign(['gender_id']);
                $table->dropColumn('gender_id');
            });
        }

        // 4. Eliminar "Unisex" de la tabla genders (no hay productos con ese género en producción)
        DB::table('genders')->where('name', 'Unisex')->delete();
    }

    public function down(): void
    {
        // 1. Restaurar columna gender_id como nullable
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('gender_id')->nullable()->constrained()->after('id');
        });

        // 2. Copiar el primer género del pivot de vuelta a gender_id
        DB::statement('UPDATE products INNER JOIN gender_product ON gender_product.product_id = products.id SET products.gender_id = gender_product.gender_id');

        // 3. Restaurar género Unisex
        DB::table('genders')->insert(['name' => 'Unisex', 'created_at' => now(), 'updated_at' => now()]);

        // 4. Eliminar tabla pivot
        Schema::dropIfExists('gender_product');
    }
};
