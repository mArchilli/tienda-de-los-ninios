<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Color;
use App\Models\Combo;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Size;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now      = Carbon::now();
        $monthStart = (clone $now)->startOfMonth();
        $monthEnd   = (clone $now)->endOfMonth();
        $prevStart  = (clone $monthStart)->subMonthNoOverflow()->startOfMonth();
        $prevEnd    = (clone $monthStart)->subMonthNoOverflow()->endOfMonth();

        $currentMonth = $this->monthRevenue($monthStart, $monthEnd);
        $previousMonth = $this->monthRevenue($prevStart, $prevEnd);

        return Inertia::render('Dashboard', [
            'currentMonth'  => $currentMonth,
            'previousMonth' => $previousMonth,
            'monthLabel'    => $this->monthLabel($monthStart),
            'pendingOrdersCount' => Order::where('shipping_status', Order::SHIPPING_STATUS_PENDING)
                ->where('status', '!=', Order::STATUS_CANCELLED)
                ->count(),
            'todayOrdersCount' => Order::where('status', '!=', Order::STATUS_CANCELLED)
                ->whereDate('created_at', $now->toDateString())
                ->count(),
            'totals' => [
                'products'   => Product::count(),
                'combos'     => Combo::count(),
                'categories' => Category::count(),
                'colors'     => Color::count(),
                'sizes'      => Size::count(),
            ],
            'last7Days'    => $this->last7Days(),
            'recentOrders' => $this->recentOrders(6),
            'topProducts'  => $this->topProductsForRange($monthStart, $monthEnd, 5),
        ]);
    }

    private function monthRevenue(Carbon $start, Carbon $end): array
    {
        $base = Order::query()
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('created_at', [$start, $end]);

        $revenue = (float) (clone $base)->sum('total');
        $orders  = (int) (clone $base)->count();

        return [
            'revenue'      => round($revenue, 2),
            'orders_count' => $orders,
            'avg_ticket'   => $orders > 0 ? round($revenue / $orders, 2) : 0.0,
        ];
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

    private function last7Days(): array
    {
        $start = Carbon::now()->subDays(6)->startOfDay();

        $rows = Order::query()
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as d, SUM(total) as revenue, COUNT(*) as orders_count')
            ->groupBy('d')
            ->get()
            ->keyBy('d');

        $diasCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        $result = [];
        for ($i = 0; $i < 7; $i++) {
            $d   = (clone $start)->addDays($i);
            $key = $d->toDateString();
            $row = $rows->get($key);
            $result[] = [
                'date'         => $key,
                'label'        => $diasCortos[(int) $d->dayOfWeekIso - 1] . ' ' . $d->format('d/m'),
                'short'        => $d->format('d/m'),
                'revenue'      => $row ? round((float) $row->revenue, 2) : 0.0,
                'orders_count' => $row ? (int) $row->orders_count : 0,
            ];
        }
        return $result;
    }

    private function recentOrders(int $limit): array
    {
        return Order::query()
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->with('items:id,order_id,quantity')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Order $o) => [
                'id'              => $o->id,
                'customer'        => trim(($o->first_name ?? '') . ' ' . ($o->last_name ?? '')) ?: 'Sin nombre',
                'total'           => (float) $o->total,
                'shipping_status' => $o->shipping_status,
                'items_count'     => (int) $o->items->sum('quantity'),
                'created_at'      => optional($o->created_at)->toIso8601String(),
            ])
            ->all();
    }

    private function topProductsForRange(Carbon $start, Carbon $end, int $limit): array
    {
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('order_items.product_id')
            ->whereNull('order_items.combo_data')
            ->select(
                'order_items.product_id as product_id',
                DB::raw('SUM(order_items.quantity) as units')
            )
            ->groupBy('order_items.product_id')
            ->orderByDesc('units')
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) return [];

        $productIds = $rows->pluck('product_id')->all();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        return $rows->map(function ($r) use ($products) {
            $p = $products->get($r->product_id);
            return [
                'id'    => (int) $r->product_id,
                'name'  => $p?->name ?? 'Producto eliminado',
                'image' => $p?->images[0] ?? null,
                'units' => (int) $r->units,
            ];
        })->values()->all();
    }
}
