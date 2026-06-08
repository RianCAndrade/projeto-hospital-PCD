<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
                'nome' => 'Fisiatria / Medicina Física e Reabilitação',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Neuropediatria',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Ortopedia Pediátrica / Funcional',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Psiquiatria Infantil / Neuropsiquiatria',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Fonoaudiologia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Terapia Ocupacional',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Pediatria do Desenvolvimento',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Genética Médica',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Oftalmologia',
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
