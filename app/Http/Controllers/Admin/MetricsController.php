<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use App\Models\Order;
use App\Models\Product;
use App\Services\StockService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MetricsController extends Controller
{
    public function index(Request $request)
    {
        $view = $request->query('view') === 'day' ? 'day' : 'month';

        if ($view === 'day') {
            $selected = $this->parseDay($request->query('day'));
            $previous = (clone $selected)->subDay();

            $selectedRange = [$selected->copy()->startOfDay(), $selected->copy()->endOfDay()];
            $previousRange = [$previous->copy()->startOfDay(), $previous->copy()->endOfDay()];

            $viewData = [
                'selectedPeriod' => $selected->format('Y-m-d'),
                'selectedLabel'  => $this->dayLabel($selected),
                'previousLabel'  => $this->dayLabel($previous),
                'dayBounds'      => $this->dayBounds(),
            ];

            $history = $this->dailyHistory(30);
        } else {
            $selected = $this->parseMonth($request->query('month'));
            $previous = (clone $selected)->subMonthNoOverflow();

            $selectedRange = [$selected->copy()->startOfMonth(), $selected->copy()->endOfMonth()];
            $previousRange = [$previous->copy()->startOfMonth(), $previous->copy()->endOfMonth()];

            $viewData = [
                'selectedPeriod'  => $selected->format('Y-m'),
                'selectedLabel'   => $this->monthLabel($selected),
                'previousLabel'   => $this->monthLabel($previous),
                'availableMonths' => $this->availableMonths(),
            ];

            $history = $this->monthlyHistory(12);
        }

        $selectedStats = $this->periodStats(...$selectedRange);
        $previousStats = $this->periodStats(...$previousRange);

        $topProducts = $this->topProducts(...$selectedRange, limit: 10);
        $topCombos   = $this->topCombos(...$selectedRange, limit: 10);

        $allTime = $this->allTimeStats();

        return Inertia::render('Admin/Metrics/Index', array_merge($viewData, [
            'view'          => $view,
            'selectedStats' => $selectedStats,
            'previousStats' => $previousStats,
            'history'       => $history,
            'topProducts'   => $topProducts,
            'topCombos'     => $topCombos,
            'allTime'       => $allTime,
        ]));
    }

    private function parseMonth(?string $value): Carbon
    {
        if ($value && preg_match('/^\d{4}-\d{2}$/', $value)) {
            try {
                return Carbon::createFromFormat('Y-m', $value)->startOfMonth();
            } catch (\Exception $e) {
                // fallback to current
            }
        }
        return Carbon::now()->startOfMonth();
    }

    private function parseDay(?string $value): Carbon
    {
        if ($value && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            try {
                return Carbon::createFromFormat('Y-m-d', $value)->startOfDay();
            } catch (\Exception $e) {
                // fallback to today
            }
        }
        return Carbon::now()->startOfDay();
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

    private function dayLabel(Carbon $date): string
    {
        $dias = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];
        $meses = [
            1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
            5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
            9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
        ];
        return $dias[(int) $date->dayOfWeekIso] . ' ' . $date->day . ' de ' . $meses[(int) $date->month] . ' de ' . $date->year;
    }

    private function billableQuery()
    {
        return Order::query()->where('status', '!=', Order::STATUS_CANCELLED);
    }

    private function periodStats(Carbon $start, Carbon $end): array
    {
        $base = $this->billableQuery()->whereBetween('created_at', [$start, $end]);

        $ordersCount = (clone $base)->count();
        $revenue     = (float) (clone $base)->sum('total');
        $itemsCount  = (int) DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('orders.created_at', [$start, $end])
            ->sum('order_items.quantity');

        $avgTicket = $ordersCount > 0 ? $revenue / $ordersCount : 0.0;

        return [
            'revenue'      => round($revenue, 2),
            'orders_count' => $ordersCount,
            'items_count'  => $itemsCount,
            'avg_ticket'   => round($avgTicket, 2),
        ];
    }

    private function monthlyHistory(int $months): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths($months - 1);

        $rows = $this->billableQuery()
            ->where('created_at', '>=', $start)
            ->selectRaw('YEAR(created_at) as y, MONTH(created_at) as m, SUM(total) as revenue, COUNT(*) as orders_count')
            ->groupBy('y', 'm')
            ->get()
            ->keyBy(fn ($r) => sprintf('%04d-%02d', $r->y, $r->m));

        $result = [];
        for ($i = 0; $i < $months; $i++) {
            $d   = (clone $start)->addMonths($i);
            $key = $d->format('Y-m');
            $row = $rows->get($key);

            $result[] = [
                'period'       => $key,
                'label'        => $this->shortMonthLabel($d),
                'revenue'      => $row ? round((float) $row->revenue, 2) : 0.0,
                'orders_count' => $row ? (int) $row->orders_count : 0,
            ];
        }

        return $result;
    }

    private function dailyHistory(int $days): array
    {
        $start = Carbon::now()->startOfDay()->subDays($days - 1);

        $rows = $this->billableQuery()
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as d, SUM(total) as revenue, COUNT(*) as orders_count')
            ->groupBy('d')
            ->get()
            ->keyBy('d');

        $result = [];
        for ($i = 0; $i < $days; $i++) {
            $d   = (clone $start)->addDays($i);
            $key = $d->toDateString();
            $row = $rows->get($key);

            $result[] = [
                'period'       => $key,
                'label'        => $d->format('d/m'),
                'revenue'      => $row ? round((float) $row->revenue, 2) : 0.0,
                'orders_count' => $row ? (int) $row->orders_count : 0,
            ];
        }

        return $result;
    }

    private function shortMonthLabel(Carbon $date): string
    {
        $meses = [
            1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr',
            5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago',
            9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic',
        ];
        return $meses[(int) $date->month] . ' ' . substr($date->year, -2);
    }

    private function availableMonths(): array
    {
        $first = $this->billableQuery()->min('created_at');
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

    private function dayBounds(): array
    {
        $first = $this->billableQuery()->min('created_at');
        $min = $first ? Carbon::parse($first)->toDateString() : Carbon::now()->toDateString();

        return [
            'min' => $min,
            'max' => Carbon::now()->toDateString(),
        ];
    }

    private function topProducts(Carbon $start, Carbon $end, int $limit): array
    {
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('order_items.product_id')
            ->whereNull('order_items.combo_data')
            ->select(
                'order_items.product_id as product_id',
                DB::raw('SUM(order_items.quantity) as units'),
                DB::raw('SUM(order_items.price * order_items.quantity) as revenue')
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
                'id'      => (int) $r->product_id,
                'name'    => $p?->name ?? 'Producto eliminado',
                'image'   => $p?->images[0] ?? null,
                'units'   => (int) $r->units,
                'revenue' => round((float) $r->revenue, 2),
            ];
        })->values()->all();
    }

    private function topCombos(Carbon $start, Carbon $end, int $limit): array
    {
        // Pull combo rows for the period, then aggregate in PHP using combo_data JSON.
        $items = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('orders.created_at', [$start, $end])
            ->whereNotNull('order_items.combo_data')
            ->select('order_items.quantity', 'order_items.price', 'order_items.combo_data')
            ->get();

        $agg = [];
        foreach ($items as $it) {
            $data = json_decode($it->combo_data, true) ?? [];
            $comboId = $data['combo_id'] ?? null;
            $name    = $data['name'] ?? 'Combo';

            $key = $comboId !== null ? 'id:' . $comboId : 'name:' . $name;

            if (! isset($agg[$key])) {
                $agg[$key] = [
                    'combo_id' => $comboId,
                    'name'     => $name,
                    'units'    => 0,
                    'revenue'  => 0.0,
                ];
            }
            $agg[$key]['units']   += (int) $it->quantity;
            $agg[$key]['revenue'] += (float) $it->price * (int) $it->quantity;
        }

        usort($agg, fn ($a, $b) => $b['units'] <=> $a['units']);
        $agg = array_slice($agg, 0, $limit);

        $comboIds = array_filter(array_column($agg, 'combo_id'));
        $combos   = $comboIds
            ? Combo::whereIn('id', $comboIds)->get()->keyBy('id')
            : collect();

        return array_map(function ($row) use ($combos) {
            $c = $row['combo_id'] !== null ? $combos->get($row['combo_id']) : null;
            return [
                'id'      => $row['combo_id'],
                'name'    => $c?->name ?? $row['name'],
                'image'   => $c?->image ? '/' . ltrim($c->image, '/') : null,
                'units'   => $row['units'],
                'revenue' => round($row['revenue'], 2),
            ];
        }, $agg);
    }

    private function allTimeStats(): array
    {
        $base = $this->billableQuery();

        return [
            'revenue'      => round((float) (clone $base)->sum('total'), 2),
            'orders_count' => (int) (clone $base)->count(),
        ];
    }

    public function orders(Request $request)
    {
        $view = $request->query('view') === 'day' ? 'day' : 'month';

        if ($view === 'day') {
            $day = $this->parseDay($request->query('day'));
            $start = $day->copy()->startOfDay();
            $end   = $day->copy()->endOfDay();
            $period = $day->format('Y-m-d');
            $label  = $this->dayLabel($day);
        } else {
            $month = $this->parseMonth($request->query('month'));
            $start = $month->copy()->startOfMonth();
            $end   = $month->copy()->endOfMonth();
            $period = $month->format('Y-m');
            $label  = $this->monthLabel($month);
        }

        $orders = Order::with('items')
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $o) => [
                'id'           => $o->id,
                'first_name'   => $o->first_name,
                'last_name'    => $o->last_name,
                'email'        => $o->email,
                'total'        => (float) $o->total,
                'items_count'  => (int) $o->items->sum('quantity'),
                'status'       => $o->status,
                'is_billable'  => $o->status !== Order::STATUS_CANCELLED,
                'created_at'   => optional($o->created_at)->toIso8601String(),
            ])
            ->values();

        return Inertia::render('Admin/Metrics/Orders', [
            'view'         => $view,
            'period'       => $period,
            'periodLabel'  => $label,
            'orders'       => $orders,
            'currentStats' => $this->periodStats($start, $end),
        ]);
    }

    public function updateOrders(Request $request, StockService $stock)
    {
        $data = $request->validate([
            'view'                 => ['nullable', 'in:day,month'],
            'month'                => ['required_if:view,month', 'nullable', 'regex:/^\d{4}-\d{2}$/'],
            'day'                  => ['required_if:view,day', 'nullable', 'regex:/^\d{4}-\d{2}-\d{2}$/'],
            'billable_order_ids'   => ['present', 'array'],
            'billable_order_ids.*' => ['integer'],
        ]);

        $view = $data['view'] ?? 'month';

        if ($view === 'day') {
            $day = $this->parseDay($data['day']);
            $start = $day->copy()->startOfDay();
            $end   = $day->copy()->endOfDay();
            $redirectParams = ['view' => 'day', 'day' => $data['day']];
        } else {
            $month = $this->parseMonth($data['month']);
            $start = $month->copy()->startOfMonth();
            $end   = $month->copy()->endOfMonth();
            $redirectParams = ['month' => $data['month']];
        }

        $billable = array_map('intval', $data['billable_order_ids']);

        DB::transaction(function () use ($start, $end, $billable, $stock) {
            $orders = Order::with('items')
                ->whereBetween('created_at', [$start, $end])
                ->get();

            foreach ($orders as $order) {
                $shouldBeBillable = in_array($order->id, $billable, true);
                $isCancelled = $order->status === Order::STATUS_CANCELLED;

                if ($shouldBeBillable && $isCancelled) {
                    foreach ($order->items as $item) {
                        $stock->adjustForOrderItem($item, -1);
                    }
                    $order->update(['status' => Order::STATUS_PENDING]);
                } elseif (! $shouldBeBillable && ! $isCancelled) {
                    foreach ($order->items as $item) {
                        $stock->adjustForOrderItem($item, +1);
                    }
                    $order->update(['status' => Order::STATUS_CANCELLED]);
                }
            }
        });

        return redirect()
            ->route('admin.metrics.orders', $redirectParams)
            ->with('success', 'Métricas actualizadas.');
    }
}
