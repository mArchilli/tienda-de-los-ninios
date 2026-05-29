<?php

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Size;

class StockService
{
    public function adjustForOrderItem(OrderItem $item, int $sign): void
    {
        if ($sign === 0) return;

        $qty = (int) $item->quantity;
        if ($qty <= 0) return;

        // Combo Emprendedor: cada pick trae su propio size_id, no hay talle único.
        if ($item->combo_data && ($item->combo_data['variant'] ?? null) === 'emprendedor') {
            $picks = $item->combo_data['picks'] ?? [];
            foreach ($picks as $pick) {
                $productId = (int) ($pick['product_id'] ?? 0);
                $sizeId    = (int) ($pick['size_id'] ?? 0);
                if ($productId <= 0 || $sizeId <= 0) continue;
                $this->adjustProductSize($productId, $sizeId, $sign * $qty);
            }
            return;
        }

        // Combos tradicionales / productos sueltos: usan el talle del item.
        $sizeName = $item->size;
        if (! $sizeName) return;

        $size = Size::where('name', $sizeName)->first();
        if (! $size) return;

        if ($item->combo_data) {
            $picks = $item->combo_data['picks'] ?? [];
            foreach ($picks as $ids) {
                foreach ((array) $ids as $productId) {
                    $this->adjustProductSize((int) $productId, $size->id, $sign * $qty);
                }
            }
            return;
        }

        if ($item->product_id) {
            $this->adjustProductSize((int) $item->product_id, $size->id, $sign * $qty);
        }
    }

    private function adjustProductSize(int $productId, int $sizeId, int $delta): void
    {
        $product = Product::find($productId);
        if (! $product) return;

        $existing = $product->sizes()->where('sizes.id', $sizeId)->first();

        if ($existing) {
            $newStock = max(0, (int) $existing->pivot->stock + $delta);
            $product->sizes()->updateExistingPivot($sizeId, ['stock' => $newStock]);
            return;
        }

        if ($delta > 0) {
            $product->sizes()->attach($sizeId, ['stock' => $delta]);
        }
    }
}
