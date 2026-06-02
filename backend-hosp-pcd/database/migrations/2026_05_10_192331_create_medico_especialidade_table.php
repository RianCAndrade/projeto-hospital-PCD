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

        // Vincula os 3 médicos seedados às 3 especialidades
        // (ids 1=Cardiologia, 2=Ortopedia, 3=Neurologia — conforme
        // ordem do insert na migration de tbespecialidades).
        DB::table('tbmedico_especialidade')->insert([
            [
                'medico_id' => 1,
                'especialidade_id' => 1,
            ],
            [
                'medico_id' => 2,
                'especialidade_id' => 2,
            ],
            [
                'medico_id' => 3,
                'especialidade_id' => 3,
            ],
            // [
            //     'medico_id' => 6,
            //     'especialidade_id' => 3,
            // ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbmedico_especialidade');
    }
};
