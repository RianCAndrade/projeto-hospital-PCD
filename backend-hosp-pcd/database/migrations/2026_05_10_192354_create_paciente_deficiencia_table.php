<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbpaciente_deficiencia', function (Blueprint $table) {

            $table->foreignId('paciente_id')
                ->constrained('tbpacientes')
                ->onDelete('cascade');

            $table->foreignId('tipo_deficiencia_id')
                ->constrained('tbtipos_deficiencia')
                ->onDelete('cascade');

            $table->text('observacoes')
                ->nullable();

            $table->primary([
                'paciente_id',
                'tipo_deficiencia_id'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbpaciente_deficiencia');
    }
};