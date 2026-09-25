<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MetricsExpensesTest extends TestCase
{
    use RefreshDatabase;

    // ── Página de gastos ────────────────────────────────────────────────────

    public function test_guest_cannot_view_the_expenses_page(): void
    {
        $this->get('/admin/metrics/expenses')->assertRedirect('/login');
    }

    public function test_expenses_page_shows_gross_expenses_and_net(): void
    {
        $user = User::factory()->create();

        Carbon::setTestNow(Carbon::parse('2026-09-15 12:00:00'));
        Order::create(['total' => 100000, 'status' => Order::STATUS_CONFIRMED]);
        Carbon::setTestNow();

        Expense::create(['title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => '2026-09']);
        Expense::create(['title' => 'Insumos', 'amount' => 10000, 'type' => 'variable', 'month' => '2026-09']);

        $response = $this->actingAs($user)->get('/admin/metrics/expenses?month=2026-09');

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Metrics/Expenses')
            ->where('grossRevenue', 100000)
            ->where('expenses.fixed_total', 30000)
            ->where('expenses.variable_total', 10000)
            ->where('expenses.total', 40000)
            ->where('netRevenue', 60000)
            ->has('expenses.items', 2)
        );
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public function test_guest_cannot_create_an_expense(): void
    {
        $this->post('/admin/metrics/expenses', [
            'title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => '2026-09',
        ])->assertRedirect('/login');
    }

    public function test_admin_can_create_an_expense(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/metrics/expenses', [
            'title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => '2026-09',
        ])->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => '2026-09',
        ]);
    }

    public function test_expense_type_must_be_fixed_or_variable(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/metrics/expenses', [
            'title' => 'Algo', 'amount' => 1000, 'type' => 'bogus', 'month' => '2026-09',
        ])->assertSessionHasErrors(['type']);
    }

    public function test_admin_can_update_an_expense(): void
    {
        $user = User::factory()->create();
        $expense = Expense::create(['title' => 'Insumos', 'amount' => 10000, 'type' => 'variable', 'month' => '2026-09']);

        $this->actingAs($user)->put("/admin/metrics/expenses/{$expense->id}", [
            'title' => 'Insumos varios', 'amount' => 15000, 'type' => 'fixed',
        ])->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id, 'title' => 'Insumos varios', 'amount' => 15000, 'type' => 'fixed',
        ]);
    }

    public function test_admin_can_delete_an_expense(): void
    {
        $user = User::factory()->create();
        $expense = Expense::create(['title' => 'Insumos', 'amount' => 10000, 'type' => 'variable', 'month' => '2026-09']);

        $this->actingAs($user)->delete("/admin/metrics/expenses/{$expense->id}")->assertRedirect();

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    }

    // ── Copiar fijos del mes anterior ───────────────────────────────────────

    public function test_admin_can_copy_fixed_expenses_from_previous_month(): void
    {
        $user = User::factory()->create();
        Expense::create(['title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => '2026-08']);
        Expense::create(['title' => 'Insumos', 'amount' => 5000, 'type' => 'variable', 'month' => '2026-08']);

        $this->actingAs($user)->post('/admin/metrics/expenses/copy-fixed', ['month' => '2026-09'])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', ['title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => '2026-09']);
        // El variable de agosto no se copia.
        $this->assertDatabaseMissing('expenses', ['title' => 'Insumos', 'month' => '2026-09']);
    }

    public function test_copying_fixed_expenses_twice_does_not_duplicate(): void
    {
        $user = User::factory()->create();
        Expense::create(['title' => 'Alquiler', 'amount' => 30000, 'type' => 'fixed', 'month' => '2026-08']);

        $this->actingAs($user)->post('/admin/metrics/expenses/copy-fixed', ['month' => '2026-09']);
        $this->actingAs($user)->post('/admin/metrics/expenses/copy-fixed', ['month' => '2026-09']);

        $this->assertSame(1, Expense::where('month', '2026-09')->where('title', 'Alquiler')->count());
    }

    // ── Neto en la página principal de Métricas ────────────────────────────

    public function test_net_revenue_is_bruto_minus_expenses_in_month_view(): void
    {
        $user = User::factory()->create();

        Carbon::setTestNow(Carbon::parse('2026-09-15 12:00:00'));
        Order::create(['total' => 100000, 'status' => Order::STATUS_CONFIRMED]);
        Carbon::setTestNow();

        Expense::create(['title' => 'Alquiler', 'amount' => 20000, 'type' => 'fixed', 'month' => '2026-09']);

        $response = $this->actingAs($user)->get('/admin/metrics?month=2026-09');
        $response->assertInertia(fn ($page) => $page
            ->where('netRevenue', 80000)
            ->where('expenses.total', 20000)
        );
    }

    public function test_previous_net_revenue_is_computed_for_the_prior_month(): void
    {
        $user = User::factory()->create();

        Carbon::setTestNow(Carbon::parse('2026-08-10 12:00:00'));
        Order::create(['total' => 50000, 'status' => Order::STATUS_CONFIRMED]);
        Carbon::setTestNow();
        Expense::create(['title' => 'Alquiler', 'amount' => 10000, 'type' => 'fixed', 'month' => '2026-08']);

        Carbon::setTestNow(Carbon::parse('2026-09-15 12:00:00'));
        Order::create(['total' => 100000, 'status' => Order::STATUS_CONFIRMED]);
        Carbon::setTestNow();
        Expense::create(['title' => 'Alquiler', 'amount' => 20000, 'type' => 'fixed', 'month' => '2026-09']);

        $response = $this->actingAs($user)->get('/admin/metrics?month=2026-09');
        $response->assertInertia(fn ($page) => $page
            ->where('netRevenue', 80000)
            ->where('previousNetRevenue', 40000)
        );
    }

    public function test_net_revenue_is_null_in_day_view(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/metrics?view=day&day=2026-09-15');
        $response->assertInertia(fn ($page) => $page
            ->where('netRevenue', null)
            ->where('expenses', null)
        );
    }
}
