<?php

use App\Enums\StatusAtendimento;
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
        Schema::create('tbatendimentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('agendamento_id')
                ->unique()
                ->constrained('tbagendamentos')
                ->restrictOnDelete();

            $table->foreignId('medico_id')
                ->constrained('tbmedicos')
                ->restrictOnDelete();

            // Auditoria: usuário (médico/recepcionista/admin) que registrou o atendimento
            $table->foreignId('registrado_por_id')
                ->nullable()
                ->constrained('tbusuarios')
                ->nullOnDelete();

            $table->string('status', 20)
                ->default(StatusAtendimento::NaoAtendido->value);

            $table->text('descricao')
                ->nullable();

            $table->text('encaminhamento')
                ->nullable();

            $table->text('receita')
                ->nullable();

            $table->text('observacoes')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index(['medico_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbatendimentos');
    }
};
