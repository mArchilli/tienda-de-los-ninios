<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Franco Arias',
            'email' => 'arias-franco@hotmail.com',
            'password' => bcrypt('Telefe11'), 
            'email_verified_at' => now(),
        ]);
    }
}
