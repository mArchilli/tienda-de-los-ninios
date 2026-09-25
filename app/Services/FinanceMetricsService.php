<?php

namespace App\Services;

use App\Models\ChannelSale;
use App\Models\Expense;
use App\Models\Order;
use Carbon\Carbon;

/**
 * Cálculos financieros compartidos entre el Dashboard y la sección de
 * Métricas: facturación bruta (tienda online + canales manuales) y gastos.
 * Centralizado acá para que "Bruto" y "Neto" signifiquen lo mismo en toda
 * la app en vez de recalcularse por separado en cada controlador.
 */
class FinanceMetricsService
{
    /**
     * Facturación bruta de un rango: pedidos online confirmados + ventas
     * cargadas a mano por canal (WhatsApp, Instagram, TikTok Live).
     */
    public function revenueFor(Carbon $start, Carbon $end): array
    {
        $onlineRevenue = (float) Order::where('status', '!=', Order::STATUS_CANCELLED)
            ->whereBetween('created_at', [$start, $end])
            ->sum('total');

        [$channelSales, $channelRevenue, $channelCount] = $this->channelSalesFor(
            $start->toDateString(),
            $end->toDateString()
        );

        return [
            'online_revenue'      => round($onlineRevenue, 2),
            'channel_revenue'     => round($channelRevenue, 2),
            'revenue'             => round($onlineRevenue + $channelRevenue, 2),
            'channel_sales'       => $channelSales,
            'channel_sales_count' => $channelCount,
        ];
    }

    /**
     * Ventas cargadas a mano por canal, siempre registradas por día, sumadas
     * entre las dos fechas dadas (ambas incluidas). Un día sin carga cuenta
     * como 0. Devuelve [detalle por canal, monto total, cantidad total].
     *
     * @return array{0: array<string, array>, 1: float, 2: int}
     */
    public function channelSalesFor(string $startDate, string $endDate): array
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
            $row    = $rows->get($key);
            $count  = $row ? (int) $row->sales_count : 0;
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

    /**
     * Gastos cargados para un mes ('YYYY-MM'), separados en fijos (se repiten
     * todos los meses) y variables, con sus totales.
     */
    public function expensesFor(string $month): array
    {
        $expenses = Expense::where('month', $month)
            ->orderByDesc('type')
            ->orderBy('created_at')
            ->get();

        $fixedTotal    = (float) $expenses->where('type', 'fixed')->sum('amount');
        $variableTotal = (float) $expenses->where('type', 'variable')->sum('amount');

        return [
            'items' => $expenses->map(fn (Expense $e) => [
                'id'     => $e->id,
                'title'  => $e->title,
                'amount' => round((float) $e->amount, 2),
                'type'   => $e->type,
            ])->values()->all(),
            'fixed_total'    => round($fixedTotal, 2),
            'variable_total' => round($variableTotal, 2),
            'total'          => round($fixedTotal + $variableTotal, 2),
        ];
    }
}
