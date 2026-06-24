<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use App\Models\ComboEmprendedor;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $month     = $this->parseMonth($request->query('month'));
        $start     = (clone $month)->startOfMonth();
        $end       = (clone $month)->endOfMonth();
        $previous  = (clone $month)->subMonthNoOverflow();
        $prevStart = (clone $previous)->startOfMonth();
        $prevEnd   = (clone $previous)->endOfMonth();

        $monthOrders = Order::with('items')
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->get();

        $map = fn (Order $o) => [
            'id'              => $o->id,
            'first_name'      => $o->first_name,
            'last_name'       => $o->last_name,
            'email'           => $o->email,
            'phone'           => $o->phone,
            'total'           => (float) $o->total,
            'shipping_method' => $o->shipping_method,
            'address'         => $o->address,
            'shipping_status' => $o->shipping_status,
            'status'          => $o->status,
            'items_count'     => (int) $o->items->sum('quantity'),
            'created_at'      => optional($o->created_at)->toIso8601String(),
        ];

        $pending = $monthOrders
            ->where('shipping_status', Order::SHIPPING_STATUS_PENDING)
            ->map($map)->values();

        $dispatched = $monthOrders
            ->whereIn('shipping_status', [
                Order::SHIPPING_STATUS_DISPATCHED,
                Order::SHIPPING_STATUS_DELIVERED,
            ])
            ->map($map)->values();

        $cancelled = $monthOrders
            ->where('shipping_status', Order::SHIPPING_STATUS_CANCELLED)
            ->map($map)->values();

        $activeOrders = $monthOrders->where('shipping_status', '!=', Order::SHIPPING_STATUS_CANCELLED);

        // Pedidos por método de envío en el mes (excluye cancelados).
        $branchCount = $activeOrders->where('shipping_method', 'branch')->count();
        $homeCount   = $activeOrders->where('shipping_method', 'home')->count();

        $prevCount = Order::whereBetween('created_at', [$prevStart, $prevEnd])
            ->where('shipping_status', '!=', Order::SHIPPING_STATUS_CANCELLED)
            ->count();

        // Pendientes globales (incluye otros meses) para no perder de vista lo accionable.
        $pendingTotal = Order::where('shipping_status', Order::SHIPPING_STATUS_PENDING)->count();

        return Inertia::render('Admin/Orders/Index', [
            'selectedMonth'   => $month->format('Y-m'),
            'selectedLabel'   => $this->monthLabel($month),
            'previousLabel'   => $this->monthLabel($previous),
            'availableMonths' => $this->availableMonths(),
            'pending'         => $pending,
            'dispatched'      => $dispatched,
            'cancelled'       => $cancelled,
            'metrics'         => [
                'orders_total'      => $activeOrders->count(),
                'orders_prev'       => $prevCount,
                'branch_count'      => $branchCount,
                'home_count'        => $homeCount,
                'pending_count'     => $pending->count(),
                'dispatched_count'  => $dispatched->count(),
                'cancelled_count'   => $cancelled->count(),
                'pending_total'     => $pendingTotal,
            ],
        ]);
    }

    private function parseMonth(?string $value): Carbon
    {
        if ($value && preg_match('/^\d{4}-\d{2}$/', $value)) {
            try {
                return Carbon::createFromFormat('Y-m', $value)->startOfMonth();
            } catch (\Exception $e) {
                // fallback al mes actual
            }
        }
        return Carbon::now()->startOfMonth();
    }

    private function monthLabel(Carbon $date): string
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
        ];
        return $meses[(int) $date->month] . ' ' . $date->year;
    }

    private function availableMonths(): array
    {
        $first = Order::min('created_at');
        $start = $first ? Carbon::parse($first)->startOfMonth() : Carbon::now()->startOfMonth();
        $end   = Carbon::now()->startOfMonth();

        $months = [];
        $cursor = clone $end;
        while ($cursor->greaterThanOrEqualTo($start)) {
            $months[] = [
                'value' => $cursor->format('Y-m'),
                'label' => $this->monthLabel($cursor),
            ];
            $cursor->subMonthNoOverflow();
        }
        return $months;
    }

    public function show(Order $order)
    {
        $order->load('items.product.colors');

        // Recopilamos ids para bulk-load. Diferenciamos entre combos tradicionales
        // (picks = {catId: [productId,...]}) y combos emprendedor
        // (picks = [{product_id, size_id, size_name}, ...]).
        $traditionalComboIds  = [];
        $emprendedorComboIds  = [];
        $pickIds              = [];

        foreach ($order->items as $item) {
            if (is_null($item->combo_data)) continue;

            $variant = $item->combo_data['variant'] ?? 'combo';
            $comboId = (int) ($item->combo_data['combo_id'] ?? 0);

            if ($variant === 'emprendedor') {
                if ($comboId) $emprendedorComboIds[] = $comboId;
                foreach (($item->combo_data['picks'] ?? []) as $pick) {
                    $pid = (int) ($pick['product_id'] ?? 0);
                    if ($pid > 0) $pickIds[] = $pid;
                }
            } else {
                if ($comboId) $traditionalComboIds[] = $comboId;
                foreach (($item->combo_data['picks'] ?? []) as $ids) {
                    foreach ((array) $ids as $id) {
                        $pickIds[] = (int) $id;
                    }
                }
            }
        }

        // Combos tradicionales indexados por id.
        $combosById = [];
        if (! empty($traditionalComboIds)) {
            Combo::whereIn('id', array_unique($traditionalComboIds))
                ->get()->each(function (Combo $c) use (&$combosById) {
                    $combosById[$c->id] = [
                        'image'       => $c->image ? '/' . ltrim($c->image, '/') : null,
                        'description' => $c->description ?? null,
                    ];
                });
        }

        // Combos emprendedor indexados por id.
        $emprendedorById = [];
        if (! empty($emprendedorComboIds)) {
            ComboEmprendedor::whereIn('id', array_unique($emprendedorComboIds))
                ->get()->each(function (ComboEmprendedor $c) use (&$emprendedorById) {
                    $emprendedorById[$c->id] = [
                        'image'       => $c->image ? '/' . ltrim($c->image, '/') : null,
                        'description' => $c->description ?? null,
                    ];
                });
        }

        // Productos de picks indexados por id.
        $picksById = [];
        if (! empty($pickIds)) {
            Product::with('colors')->whereIn('id', array_unique($pickIds))->get()->each(function (Product $p) use (&$picksById) {
                $picksById[$p->id] = [
                    'name'        => $p->name,
                    'image'       => $p->images[0] ?? null,
                    'description' => $p->description ?? null,
                    'color'       => $p->colors->pluck('name')->implode(', ') ?: null,
                ];
            });
        }

        $items = $order->items->map(function ($item) use ($combosById, $emprendedorById, $picksById) {
            $isCombo = ! is_null($item->combo_data);
            $variant = $isCombo ? ($item->combo_data['variant'] ?? 'combo') : null;

            $picks = [];
            if ($isCombo && ! empty($item->combo_data['picks'])) {
                if ($variant === 'emprendedor') {
                    // Agrupamos picks por (product_id + size_name) y contamos cantidad.
                    $aggregated = [];
                    foreach ($item->combo_data['picks'] as $pick) {
                        $pid      = (int) ($pick['product_id'] ?? 0);
                        $sizeName = $pick['size_name'] ?? null;
                        if (! isset($picksById[$pid])) continue;
                        $key = $pid . '|' . ($sizeName ?? '');
                        if (! isset($aggregated[$key])) {
                            $aggregated[$key] = $picksById[$pid] + [
                                'size'     => $sizeName,
                                'quantity' => 0,
                            ];
                        }
                        $aggregated[$key]['quantity']++;
                    }
                    $picks = array_values($aggregated);
                } else {
                    foreach ($item->combo_data['picks'] as $ids) {
                        foreach ((array) $ids as $id) {
                            if (isset($picksById[$id])) {
                                $picks[] = $picksById[$id] + ['size' => null, 'quantity' => 1];
                            }
                        }
                    }
                }
            }

            $comboId = $isCombo ? (int) ($item->combo_data['combo_id'] ?? 0) : 0;
            $comboMeta = $variant === 'emprendedor'
                ? ($emprendedorById[$comboId] ?? null)
                : ($combosById[$comboId] ?? null);

            return [
                'id'          => $item->id,
                'type'        => $isCombo ? 'combo' : 'product',
                'variant'     => $variant,
                'name'        => $isCombo
                    ? ($item->combo_data['name'] ?? 'Combo')
                    : ($item->product?->name ?? 'Producto eliminado'),
                'description' => $isCombo
                    ? ($comboMeta['description'] ?? null)
                    : ($item->product?->description ?? null),
                'image'       => $isCombo
                    ? ($comboMeta['image'] ?? null)
                    : ($item->product?->images[0] ?? null),
                'quantity'    => (int) $item->quantity,
                'price'       => (float) $item->price,
                'subtotal'    => (float) $item->price * (int) $item->quantity,
                'size'        => $item->size,
                'color'       => $isCombo ? null : ($item->product?->colors->pluck('name')->implode(', ') ?: null),
                'gender'      => $isCombo ? ($item->combo_data['gender_name'] ?? null) : null,
                'picks'       => $picks,
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
                    Order::SHIPPING_STATUS_CANCELLED,
                ]),
            ],
        ]);

        $order->update(['shipping_status' => $data['shipping_status']]);

        return back()->with('success', 'Estado del pedido actualizado.');
    }
}
