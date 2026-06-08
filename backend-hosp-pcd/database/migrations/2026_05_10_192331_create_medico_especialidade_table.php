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
        Schema::create('tbmedico_especialidade', function (Blueprint $table) {
            $table->foreignId('medico_id')
                ->constrained('tbmedicos')
                ->onDelete('cascade');

            $table->foreignId('especialidade_id')
                ->constrained('tbespecialidades')
                ->onDelete('cascade');

            $table->primary([
                'medico_id',
                'especialidade_id',
            ]);
        });

        // Vincula os 9 médicos seedados às 9 especialidades (1:1)
        // Ordem das especialidades conforme insert em tbespecialidades:
        // 1=Fisiatria, 2=Neuropediatria, 3=Ortopedia Pediátrica,
        // 4=Psiquiatria Infantil, 5=Fonoaudiologia, 6=Terapia Ocupacional,
        // 7=Pediatria do Desenvolvimento, 8=Genética Médica, 9=Oftalmologia
        $vinculos = [];
        for ($i = 1; $i <= 9; $i++) {
            $vinculos[] = ['medico_id' => $i, 'especialidade_id' => $i];
        }
        DB::table('tbmedico_especialidade')->insert($vinculos);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbmedico_especialidade');
    }
};
