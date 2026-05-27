<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbespecialidades', function (Blueprint $table) {
            $table->id();

            $table->string('nome')->unique();

            $table->timestamps();
        });

        DB::table('tbespecialidades')->insert([
            [
                'nome' => 'Cardiologia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Ortopedia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Neurologia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tbespecialidades');
    }
};