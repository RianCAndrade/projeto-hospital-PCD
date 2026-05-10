<?php

use App\Enums\StatusAgendamento;
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
        Schema::create('tbagendamentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('paciente_id')
                ->constrained('tbpacientes')
                ->restrictOnDelete();

            $table->foreignId('medico_id')
                ->constrained('tbmedicos')
                ->restrictOnDelete();

            $table->foreignId('especialidade_id')
                ->constrained('tbespecialidades')
                ->restrictOnDelete();

            $table->foreignId('recepcionista_id')
                ->nullable()
                ->constrained('tbusuarios')
                ->nullOnDelete();

            $table->date('data_agendamento');
            $table->time('horario');

            $table->string('status', 20)
                ->default(StatusAgendamento::Agendado->value);

            $table->text('observacoes')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices para consultas comuns (agenda do dia, agenda do médico)
            $table->index(['data_agendamento', 'status']);
            $table->index(['medico_id', 'data_agendamento']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbagendamentos');
    }
};
