<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbtipos_deficiencia', function (Blueprint $table) {
            $table->id();

            $table->string('nome')
                ->unique();

            $table->timestamps();
        });

        DB::table('tbtipos_deficiencia')->insert([
            [
                'nome' => 'TEA (Transtorno do Espectro Autista)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Deficiência Física — Membros Superiores',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Deficiência Física — Membros Inferiores',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Deficiência Visual',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Deficiência Auditiva',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Deficiência Intelectual',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Deficiência Múltipla',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Síndrome de Down',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Paralisia Cerebral',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Outras / Não Classificado',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbtipos_deficiencia');
    }
};
