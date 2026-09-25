<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ChannelSale;
use App\Models\Color;
use App\Models\Combo;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Size;
use App\Services\FinanceMetricsService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private FinanceMetricsService $finance) {}

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

    /**
     * Facturación del mes para el dashboard: siempre se muestra en términos
     * de Neto (Bruto —tienda online + canales manuales— menos los gastos
     * cargados en Métricas), consistente con la sección de Métricas.
     */
    private function monthRevenue(Carbon $start, Carbon $end): array
    {
        $orders = (int) Order::where('status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $revenueData = $this->finance->revenueFor($start, $end);
        $expenses    = $this->finance->expensesFor($start->format('Y-m'));

        $netRevenue = round($revenueData['revenue'] - $expenses['total'], 2);

        // Las ventas de WhatsApp/Instagram/TikTok también son pedidos.
        $totalSales = $orders + $revenueData['channel_sales_count'];

        return [
            'revenue'             => $netRevenue,
            'gross_revenue'       => $revenueData['revenue'],
            'expenses_total'      => $expenses['total'],
            'orders_count'        => $orders,
            'channel_sales_count' => $revenueData['channel_sales_count'],
            'total_sales_count'   => $totalSales,
            'avg_ticket'          => $totalSales > 0 ? round($revenueData['revenue'] / $totalSales, 2) : 0.0,
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

        $channelByDay = ChannelSale::where('date', '>=', $start->toDateString())
            ->get(['date', 'amount', 'sales_count'])
            ->reduce(function (array $acc, ChannelSale $row) {
                $key = $row->date->toDateString();
                $acc[$key]['amount'] = ($acc[$key]['amount'] ?? 0.0) + (float) $row->amount;
                $acc[$key]['count']  = ($acc[$key]['count'] ?? 0) + (int) $row->sales_count;
                return $acc;
            }, []);

        $diasCortos = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        $result = [];
        for ($i = 0; $i < 7; $i++) {
            $d   = (clone $start)->addDays($i);
            $key = $d->toDateString();
            $row = $rows->get($key);
            $channel = $channelByDay[$key] ?? ['amount' => 0.0, 'count' => 0];

            $result[] = [
                'date'              => $key,
                'label'             => $diasCortos[(int) $d->dayOfWeekIso - 1] . ' ' . $d->format('d/m'),
                'short'             => $d->format('d/m'),
                'revenue'           => round(($row ? (float) $row->revenue : 0.0) + $channel['amount'], 2),
                'orders_count'      => $row ? (int) $row->orders_count : 0,
                'total_sales_count' => ($row ? (int) $row->orders_count : 0) + $channel['count'],
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
