<?php

namespace Tests\Feature;

use App\Models\ChannelSale;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MetricsChannelSalesTest extends TestCase
{
    use RefreshDatabase;

    private function channelsPayload(array $overrides = []): array
    {
        return array_replace([
            'whatsapp'  => ['sales_count' => 5, 'amount' => 100000],
            'instagram' => ['sales_count' => 3, 'amount' => 60000],
            'tiktok'    => ['sales_count' => 2, 'amount' => 40000],
        ], $overrides);
    }

    public function test_guest_cannot_update_channel_sales(): void
    {
        $this->post('/admin/metrics/channel-sales', [
            'date'     => '2026-09-15',
            'channels' => $this->channelsPayload(),
        ])->assertRedirect('/login');
    }

    public function test_admin_can_log_channel_sales_for_a_day(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date'     => '2026-09-15',
            'channels' => $this->channelsPayload(),
        ])->assertRedirect();

        $this->assertSame(5, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'whatsapp')->value('sales_count'));
        $this->assertEquals(100000, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'whatsapp')->value('amount'));
        $this->assertSame(3, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'instagram')->value('sales_count'));
        $this->assertEquals(60000, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'instagram')->value('amount'));
        $this->assertSame(2, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'tiktok')->value('sales_count'));
        $this->assertEquals(40000, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'tiktok')->value('amount'));
    }

    public function test_saving_again_updates_instead_of_duplicating(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-15',
            'channels' => $this->channelsPayload(),
        ]);

        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-15',
            'channels' => $this->channelsPayload(['whatsapp' => ['sales_count' => 9, 'amount' => 250000]]),
        ]);

        $this->assertSame(1, ChannelSale::where('channel', 'whatsapp')->whereDate('date', '2026-09-15')->count());
        $this->assertSame(9, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'whatsapp')->value('sales_count'));
        $this->assertEquals(250000, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'whatsapp')->value('amount'));
    }

    public function test_omitted_channel_defaults_to_zero(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-15',
            'channels' => ['whatsapp' => ['sales_count' => 4, 'amount' => 80000]],
        ])->assertRedirect();

        $this->assertSame(0, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'instagram')->value('sales_count'));
        $this->assertEquals(0, ChannelSale::whereDate('date', '2026-09-15')->where('channel', 'instagram')->value('amount'));
    }

    public function test_negative_amount_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-15',
            'channels' => $this->channelsPayload(['whatsapp' => ['sales_count' => 1, 'amount' => -500]]),
        ])->assertSessionHasErrors(['channels.whatsapp.amount']);
    }

    public function test_a_day_without_a_logged_entry_counts_as_zero_for_that_channel(): void
    {
        $user = User::factory()->create();

        // Sólo se carga el día 15; el 16 no tiene ninguna fila.
        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-15',
            'channels' => $this->channelsPayload(),
        ]);

        $response = $this->actingAs($user)->get('/admin/metrics/orders?view=day&day=2026-09-16');
        $response->assertInertia(fn ($page) => $page
            ->where('currentStats.channel_revenue', 0)
            ->where('currentStats.channel_sales_count', 0)
        );
    }

    public function test_month_view_sums_every_logged_day_in_that_month(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-01',
            'channels' => $this->channelsPayload(),
        ]);
        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-15',
            'channels' => $this->channelsPayload(),
        ]);
        // Un día del mes siguiente no debe sumar al mes de septiembre.
        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-10-01',
            'channels' => $this->channelsPayload(),
        ]);

        $response = $this->actingAs($user)->get('/admin/metrics/orders?month=2026-09');
        $response->assertInertia(fn ($page) => $page
            // whatsapp+instagram+tiktok = 200000 por día cargado, dos días cargados.
            ->where('currentStats.channel_revenue', 400000)
            ->where('currentStats.channel_sales_count', 20)
        );
    }

    public function test_channel_sales_are_added_into_the_facturado_shown_for_orders_period(): void
    {
        $user = User::factory()->create();

        Carbon::setTestNow(Carbon::parse('2026-09-15 12:00:00'));
        Order::create(['total' => 15000, 'status' => Order::STATUS_CONFIRMED]);
        Carbon::setTestNow();

        $this->actingAs($user)->post('/admin/metrics/channel-sales', [
            'date' => '2026-09-15',
            'channels' => $this->channelsPayload(),
        ]);

        $response = $this->actingAs($user)->get('/admin/metrics/orders?month=2026-09');
        $response->assertInertia(fn ($page) => $page
            ->where('currentStats.online_revenue', 15000)
            ->where('currentStats.channel_revenue', 200000)
            ->where('currentStats.revenue', 215000)
        );
    }
}
