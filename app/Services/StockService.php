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

        $sizeName = $item->size;
        if (! $sizeName) return;

        $size = Size::where('name', $sizeName)->first();
        if (! $size) return;

        $qty = (int) $item->quantity;
        if ($qty <= 0) return;

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
