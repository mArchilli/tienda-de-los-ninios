<?php

namespace Tests\Feature;

use App\Models\ChannelSale;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MetricsChannelsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_the_channels_page(): void
    {
        $this->get('/admin/metrics/channels')->assertRedirect('/login');
    }

    public function test_channels_page_lists_web_plus_the_three_manual_channels(): void
    {
        $user = User::factory()->create();

        Carbon::setTestNow(Carbon::parse('2026-09-15 12:00:00'));
        Order::create(['total' => 15000, 'status' => Order::STATUS_CONFIRMED]);
        Carbon::setTestNow();

        ChannelSale::create(['channel' => 'whatsapp', 'date' => '2026-09-15', 'sales_count' => 5, 'amount' => 100000]);
        ChannelSale::create(['channel' => 'instagram', 'date' => '2026-09-15', 'sales_count' => 3, 'amount' => 60000]);
        ChannelSale::create(['channel' => 'tiktok', 'date' => '2026-09-15', 'sales_count' => 2, 'amount' => 40000]);

        $response = $this->actingAs($user)->get('/admin/metrics/channels?month=2026-09');

        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Metrics/Channels')
            ->where('channels.0.key', 'web')
            ->where('channels.0.amount', 15000)
            ->where('channels.0.sales_count', 1)
            ->where('channels.0.editable', false)
            ->where('channels.1.key', 'whatsapp')
            ->where('channels.1.amount', 100000)
            ->where('channels.1.sales_count', 5)
            ->where('channels.1.editable', true)
            ->where('channels.2.key', 'instagram')
            ->where('channels.2.amount', 60000)
            ->where('channels.3.key', 'tiktok')
            ->where('channels.3.amount', 40000)
            ->where('totalRevenue', 215000)
            ->where('totalSalesCount', 11)
        );
    }

    public function test_channels_page_works_for_day_view_with_no_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/metrics/channels?view=day&day=2026-09-20');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Metrics/Channels')
            ->where('view', 'day')
            ->where('totalRevenue', 0)
            ->where('totalSalesCount', 0)
            ->has('channels', 4)
        );
    }
}
