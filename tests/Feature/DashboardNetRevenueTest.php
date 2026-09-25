<?php

namespace Tests\Feature;

use App\Models\ChannelSale;
use App\Models\Expense;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardNetRevenueTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_the_dashboard(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_dashboard_shows_net_revenue_as_bruto_minus_gastos(): void
    {
        $user = User::factory()->create();

        Carbon::setTestNow(Carbon::now()->startOfMonth()->addDays(2));
        $month = Carbon::now()->format('Y-m');

        Order::create(['total' => 100000, 'status' => Order::STATUS_CONFIRMED]);
        ChannelSale::create(['channel' => 'whatsapp', 'date' => Carbon::now()->toDateString(), 'sales_count' => 2, 'amount' => 20000]);
        Expense::create(['title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => $month]);

        $response = $this->actingAs($user)->get('/dashboard');
        Carbon::setTestNow();

        // Bruto = 100000 (online) + 20000 (whatsapp) = 120000; Neto = 120000 - 30000 = 90000.
        $response->assertInertia(fn ($page) => $page
            ->where('currentMonth.gross_revenue', 120000)
            ->where('currentMonth.expenses_total', 30000)
            ->where('currentMonth.revenue', 90000)
        );
    }
}
