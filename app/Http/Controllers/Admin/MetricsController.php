<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MetricsController extends Controller
{
    public function index(Request $request)
    {
        $selected = $this->parseMonth($request->query('month'));
        $previous = (clone $selected)->subMonthNoOverflow();

        $selectedStats = $this->monthStats($selected);
        $previousStats = $this->monthStats($previous);

        $monthlyHistory = $this->monthlyHistory(12);
        $availableMonths = $this->availableMonths();

        $topProducts = $this->topProductsForMonth($selected, 10);
        $topCombos   = $this->topCombosForMonth($selected, 10);

        $allTime = $this->allTimeStats();

        return Inertia::render('Admin/Metrics/Index', [
            'selectedMonth'   => $selected->format('Y-m'),
            'selectedLabel'   => $this->monthLabel($selected),
            'previousLabel'   => $this->monthLabel($previous),
            'selectedStats'   => $selectedStats,
            'previousStats'   => $previousStats,
            'monthlyHistory'  => $monthlyHistory,
            'availableMonths' => $availableMonths,
            'topProducts'     => $topProducts,
            'topCombos'       => $topCombos,
            'allTime'         => $allTime,
        ]);
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

    private function monthLabel(Carbon $date): string
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
        ];
        return $meses[(int) $date->month] . ' ' . $date->year;
    }

    private function billableQuery()
    {
        return Order::query()->where('status', '!=', Order::STATUS_CANCELLED);
    }

    private function monthStats(Carbon $month): array
    {
        $start = (clone $month)->startOfMonth();
        $end   = (clone $month)->endOfMonth();

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
                'month'        => $key,
                'label'        => $this->shortMonthLabel($d),
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

    private function topProductsForMonth(Carbon $month, int $limit): array
    {
        $start = (clone $month)->startOfMonth();
        $end   = (clone $month)->endOfMonth();

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

    private function topCombosForMonth(Carbon $month, int $limit): array
    {
        $start = (clone $month)->startOfMonth();
        $end   = (clone $month)->endOfMonth();

        // Pull combo rows for the month, then aggregate in PHP using combo_data JSON.
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
}
