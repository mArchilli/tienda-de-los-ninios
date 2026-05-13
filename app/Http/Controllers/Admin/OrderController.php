<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $o) => [
                'id'              => $o->id,
                'first_name'      => $o->first_name,
                'last_name'       => $o->last_name,
                'email'           => $o->email,
                'phone'           => $o->phone,
                'total'           => (float) $o->total,
                'shipping_method' => $o->shipping_method,
                'shipping_status' => $o->shipping_status,
                'status'          => $o->status,
                'items_count'     => $o->items->sum('quantity'),
                'created_at'      => optional($o->created_at)->toIso8601String(),
            ]);

        $pending    = $orders->where('shipping_status', Order::SHIPPING_STATUS_PENDING)->values();
        $dispatched = $orders->whereIn('shipping_status', [
            Order::SHIPPING_STATUS_DISPATCHED,
            Order::SHIPPING_STATUS_DELIVERED,
        ])->values();

        return Inertia::render('Admin/Orders/Index', [
            'pending'    => $pending,
            'dispatched' => $dispatched,
        ]);
    }

    public function show(Order $order)
    {
        $order->load('items.product');

        // Resolvemos los nombres de los productos elegidos dentro de los combos.
        $pickIds = [];
        foreach ($order->items as $item) {
            if ($item->combo_data && ! empty($item->combo_data['picks'])) {
                foreach ($item->combo_data['picks'] as $ids) {
                    foreach ((array) $ids as $id) {
                        $pickIds[] = (int) $id;
                    }
                }
            }
        }
        $pickNames = [];
        if (! empty($pickIds)) {
            $pickNames = Product::whereIn('id', array_unique($pickIds))->pluck('name', 'id')->toArray();
        }

        $items = $order->items->map(function ($item) use ($pickNames) {
            $isCombo = ! is_null($item->combo_data);
            $picked  = [];
            if ($isCombo && ! empty($item->combo_data['picks'])) {
                foreach ($item->combo_data['picks'] as $ids) {
                    foreach ((array) $ids as $id) {
                        if (isset($pickNames[$id])) {
                            $picked[] = $pickNames[$id];
                        }
                    }
                }
            }

            return [
                'id'         => $item->id,
                'type'       => $isCombo ? 'combo' : 'product',
                'name'       => $isCombo
                    ? ($item->combo_data['name'] ?? 'Combo')
                    : ($item->product?->name ?? 'Producto eliminado'),
                'quantity'   => (int) $item->quantity,
                'price'      => (float) $item->price,
                'subtotal'   => (float) $item->price * (int) $item->quantity,
                'size'       => $item->size,
                'gender'     => $isCombo ? ($item->combo_data['gender_name'] ?? null) : null,
                'picks'      => $picked,
            ];
        })->values();

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id'              => $order->id,
                'first_name'      => $order->first_name,
                'last_name'       => $order->last_name,
                'email'           => $order->email,
                'phone'           => $order->phone,
                'dni'             => $order->dni,
                'shipping_method' => $order->shipping_method,
                'courier_company' => $order->courier_company,
                'province'        => $order->province,
                'city'            => $order->city,
                'postal_code'     => $order->postal_code,
                'address'         => $order->address,
                'observations'    => $order->observations,
                'status'          => $order->status,
                'shipping_status' => $order->shipping_status,
                'total'           => (float) $order->total,
                'created_at'      => optional($order->created_at)->toIso8601String(),
                'items'           => $items,
            ],
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'shipping_status' => [
                'required',
                'in:' . implode(',', [
                    Order::SHIPPING_STATUS_PENDING,
                    Order::SHIPPING_STATUS_DISPATCHED,
                    Order::SHIPPING_STATUS_DELIVERED,
                ]),
            ],
        ]);

        $order->update(['shipping_status' => $data['shipping_status']]);

        return back()->with('success', 'Estado del pedido actualizado.');
    }
}
