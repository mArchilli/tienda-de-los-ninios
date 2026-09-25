<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChannelSale;
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

    /**
     * Consolidado de facturación por canal de venta (Web, WhatsApp, Instagram,
     * TikTok Live) para el período seleccionado, más su evolución histórica.
     */
    public function channels(Request $request)
    {
        $view = $request->query('view') === 'day' ? 'day' : 'month';

        if ($view === 'day') {
            $selected = $this->parseDay($request->query('day'));
            $range = [$selected->copy()->startOfDay(), $selected->copy()->endOfDay()];

            $viewData = [
                'selectedPeriod' => $selected->format('Y-m-d'),
                'selectedLabel'  => $this->dayLabel($selected),
                'dayBounds'      => $this->dayBounds(),
            ];

            $history = $this->dailyHistory(30);
        } else {
            $selected = $this->parseMonth($request->query('month'));
            $range = [$selected->copy()->startOfMonth(), $selected->copy()->endOfMonth()];

            $viewData = [
                'selectedPeriod'  => $selected->format('Y-m'),
                'selectedLabel'   => $this->monthLabel($selected),
                'availableMonths' => $this->availableMonths(),
            ];

            $history = $this->monthlyHistory(12);
        }

        $stats = $this->periodStats(...$range);

        $channels = [
            [
                'key'         => 'web',
                'label'       => 'Web',
                'sales_count' => $stats['orders_count'],
                'amount'      => $stats['online_revenue'],
                'editable'    => false,
            ],
        ];
        foreach ($stats['channel_sales'] as $key => $row) {
            $channels[] = [
                'key'         => $key,
                'label'       => $row['label'],
                'sales_count' => $row['sales_count'],
                'amount'      => $row['amount'],
                'editable'    => true,
            ];
        }

        return Inertia::render('Admin/Metrics/Channels', array_merge($viewData, [
            'view'            => $view,
            'channels'        => $channels,
            'totalRevenue'    => $stats['revenue'],
            'totalSalesCount' => $stats['orders_count'] + $stats['channel_sales_count'],
            'history'         => $history,
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

        $ordersCount   = (clone $base)->count();
        $onlineRevenue = (float) (clone $base)->sum('total');
        $itemsCount    = (int) DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('orders.created_at', [$start, $end])
            ->sum('order_items.quantity');

        [$channelSales, $channelRevenue, $channelCount] = $this->channelSalesFor($start->toDateString(), $end->toDateString());

        $grossRevenue = $onlineRevenue + $channelRevenue;
        $avgTicket    = $ordersCount > 0 ? $onlineRevenue / $ordersCount : 0.0;

        return [
            'revenue'             => round($grossRevenue, 2),
            'online_revenue'      => round($onlineRevenue, 2),
            'channel_revenue'     => round($channelRevenue, 2),
            'channel_sales'       => $channelSales,
            'orders_count'        => $ordersCount,
            'channel_sales_count' => $channelCount,
            'items_count'         => $itemsCount,
            'avg_ticket'          => round($avgTicket, 2),
        ];
    }

    /**
     * Ventas cargadas a mano por canal (WhatsApp, Instagram, TikTok Live),
     * siempre registradas por día, sumadas entre las dos fechas dadas (ambas
     * incluidas). Un día sin carga cuenta como 0. Devuelve [detalle por canal,
     * monto total, cantidad total].
     *
     * @return array{0: array<string, array>, 1: float, 2: int}
     */
    private function channelSalesFor(string $startDate, string $endDate): array
    {
        $rows = ChannelSale::whereBetween('date', [$startDate, $endDate])
            ->selectRaw('channel, SUM(sales_count) as sales_count, SUM(amount) as amount')
            ->groupBy('channel')
            ->get()
            ->keyBy('channel');

        $detail = [];
        $totalAmount = 0.0;
        $totalCount  = 0;

        foreach (ChannelSale::CHANNELS as $key => $label) {
            $row = $rows->get($key);
            $count = $row ? (int) $row->sales_count : 0;
            $amount = $row ? (float) $row->amount : 0.0;

            $detail[$key] = [
                'label'       => $label,
                'sales_count' => $count,
                'amount'      => round($amount, 2),
            ];

            $totalAmount += $amount;
            $totalCount  += $count;
        }

        return [$detail, $totalAmount, $totalCount];
    }

    private function monthlyHistory(int $months): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths($months - 1);

        // Se agrupa en PHP (en vez de YEAR()/MONTH() en SQL) para no depender
        // de funciones de fecha específicas del motor de base de datos.
        $rows = $this->billableQuery()
            ->where('created_at', '>=', $start)
            ->get(['created_at', 'total'])
            ->reduce(function (array $acc, Order $order) {
                $key = $order->created_at->format('Y-m');
                $acc[$key]['revenue']      = ($acc[$key]['revenue'] ?? 0.0) + (float) $order->total;
                $acc[$key]['orders_count'] = ($acc[$key]['orders_count'] ?? 0) + 1;
                return $acc;
            }, []);

        $channelByMonth = ChannelSale::where('date', '>=', $start->toDateString())
            ->get(['date', 'channel', 'amount'])
            ->reduce(function (array $acc, ChannelSale $row) {
                $key = $row->date->format('Y-m');
                $acc[$key][$row->channel] = ($acc[$key][$row->channel] ?? 0) + (float) $row->amount;
                return $acc;
            }, []);

        $result = [];
        for ($i = 0; $i < $months; $i++) {
            $d   = (clone $start)->addMonths($i);
            $key = $d->format('Y-m');
            $row = $rows[$key] ?? null;
            $onlineRevenue = $row ? (float) $row['revenue'] : 0.0;
            $breakdown = $this->channelBreakdown($channelByMonth[$key] ?? []);

            $result[] = [
                'period'          => $key,
                'label'           => $this->shortMonthLabel($d),
                'revenue'         => round($onlineRevenue + $breakdown['total'], 2),
                'orders_count'    => $row ? (int) $row['orders_count'] : 0,
                'online_revenue'  => round($onlineRevenue, 2),
                'channel_revenue' => round($breakdown['total'], 2),
                'channels'        => $breakdown['channels'],
            ];
        }

        return $result;
    }

    /**
     * Normaliza un mapa parcial [canal => monto] (algunos canales pueden faltar
     * si no se cargó nada ese día/mes) contra la lista completa de canales.
     *
     * @param array<string, float> $amounts
     * @return array{total: float, channels: array<string, float>}
     */
    private function channelBreakdown(array $amounts): array
    {
        $channels = [];
        $total = 0.0;

        foreach (ChannelSale::CHANNELS as $key => $label) {
            $amount = round((float) ($amounts[$key] ?? 0), 2);
            $channels[$key] = $amount;
            $total += $amount;
        }

        return ['total' => $total, 'channels' => $channels];
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

        $channelByDay = ChannelSale::where('date', '>=', $start->toDateString())
            ->get(['date', 'channel', 'amount'])
            ->reduce(function (array $acc, ChannelSale $row) {
                $key = $row->date->toDateString();
                $acc[$key][$row->channel] = ($acc[$key][$row->channel] ?? 0) + (float) $row->amount;
                return $acc;
            }, []);

        $result = [];
        for ($i = 0; $i < $days; $i++) {
            $d   = (clone $start)->addDays($i);
            $key = $d->toDateString();
            $row = $rows->get($key);
            $onlineRevenue = $row ? (float) $row->revenue : 0.0;
            $breakdown = $this->channelBreakdown($channelByDay[$key] ?? []);

            $result[] = [
                'period'          => $key,
                'label'           => $d->format('d/m'),
                'revenue'         => round($onlineRevenue + $breakdown['total'], 2),
                'orders_count'    => $row ? (int) $row->orders_count : 0,
                'online_revenue'  => round($onlineRevenue, 2),
                'channel_revenue' => round($breakdown['total'], 2),
                'channels'        => $breakdown['channels'],
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

        $onlineRevenue  = (float) (clone $base)->sum('total');
        $channelRevenue = (float) ChannelSale::sum('amount');

        return [
            'revenue'         => round($onlineRevenue + $channelRevenue, 2),
            'online_revenue'  => round($onlineRevenue, 2),
            'channel_revenue' => round($channelRevenue, 2),
            'orders_count'    => (int) (clone $base)->count(),
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

        $currentStats = $this->periodStats($start, $end);

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
            'currentStats' => $currentStats,
        ]);
    }

    /**
     * Guarda (o actualiza) la cantidad de ventas y el monto facturado por cada
     * canal manual —WhatsApp, Instagram, TikTok Live— para un día puntual. La
     * carga siempre es diaria; la vista "Mes" de Métricas sólo suma los días
     * ya cargados (un día sin carga cuenta como 0).
     */
    public function updateChannelSales(Request $request)
    {
        $data = $request->validate([
            'date'                    => ['required', 'date_format:Y-m-d'],
            'channels'                => ['required', 'array'],
            'channels.*.sales_count'  => ['nullable', 'integer', 'min:0'],
            'channels.*.amount'       => ['nullable', 'numeric', 'min:0'],
        ]);

        $date = Carbon::createFromFormat('Y-m-d', $data['date'])->startOfDay();

        foreach (ChannelSale::CHANNELS as $key => $label) {
            $entry = $data['channels'][$key] ?? [];

            ChannelSale::updateOrCreate(
                ['channel' => $key, 'date' => $date],
                [
                    'sales_count' => (int) ($entry['sales_count'] ?? 0),
                    'amount'      => (float) ($entry['amount'] ?? 0),
                ]
            );
        }

        return redirect()
            ->route('admin.metrics.index', ['view' => 'day', 'day' => $date])
            ->with('success', 'Ventas por canal actualizadas.');
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
