<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Combo;
use App\Models\ComboEmprendedor;
use App\Models\ComboRegalo;
use App\Models\Gender;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminComboGenderFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_combos_index_can_be_filtered_by_gender(): void
    {
        $nene = Gender::create(['name' => 'Nene']);
        $nena = Gender::create(['name' => 'Nena']);
        Combo::create(['name' => 'Combo nene', 'price' => 100, 'is_active' => true, 'gender_id' => $nene->id]);
        Combo::create(['name' => 'Combo nena', 'price' => 100, 'is_active' => true, 'gender_id' => $nena->id]);

        $this->actingAs(User::factory()->create())
            ->get(route('admin.combos.index', ['gender' => $nena->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.gender', (string) $nena->id)
                ->has('combos.data', 1)
                ->where('combos.data.0.name', 'Combo nena'));
    }

    public function test_emprendedor_combos_index_can_be_filtered_by_gender_and_category(): void
    {
        $nene = Gender::create(['name' => 'Nene']);
        $nena = Gender::create(['name' => 'Nena']);
        $remeras = Category::create(['name' => 'Remeras']);
        $buzos = Category::create(['name' => 'Buzos']);

        $a = ComboEmprendedor::create(['name' => 'Emp A', 'price' => 100, 'max_items' => 5, 'is_active' => true]);
        $a->genders()->attach($nene->id);
        $a->categoryLimits()->create(['category_id' => $remeras->id, 'max_items' => 2]);

        $b = ComboEmprendedor::create(['name' => 'Emp B', 'price' => 100, 'max_items' => 5, 'is_active' => true]);
        $b->genders()->attach($nena->id);
        $b->categoryLimits()->create(['category_id' => $buzos->id, 'max_items' => 2]);

        $admin = User::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.combos-emprendedor.index', ['category' => $buzos->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.category', (string) $buzos->id)
                ->has('combos.data', 1)
                ->where('combos.data.0.name', 'Emp B'));

        $this->actingAs($admin)
            ->get(route('admin.combos-emprendedor.index', ['gender' => $nene->id, 'category' => $buzos->id]))
            ->assertInertia(fn (Assert $page) => $page->has('combos.data', 0));
    }

    public function test_gift_combos_index_can_be_filtered_by_gender(): void
    {
        $nene = Gender::create(['name' => 'Nene']);
        $nena = Gender::create(['name' => 'Nena']);
        ComboRegalo::create(['name' => 'Regalo nene', 'price' => 100, 'is_active' => true, 'gender_id' => $nene->id]);
        ComboRegalo::create(['name' => 'Regalo nena', 'price' => 100, 'is_active' => true, 'gender_id' => $nena->id]);

        $this->actingAs(User::factory()->create())
            ->get(route('admin.combos-regalo.index', ['gender' => $nene->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.gender', (string) $nene->id)
                ->has('combos.data', 1)
                ->where('combos.data.0.name', 'Regalo nene'));
    }
}
