<?php

use App\Enums\StatusSenha;
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
        Schema::create('tbsenhas', function (Blueprint $table) {
            $table->id();

            $table->string('codigo')
                ->unique();

            $table->foreignId('agendamento_id')
                ->unique()
                ->constrained('tbagendamentos')
                ->cascadeOnDelete();

            $table->foreignId('paciente_id')
                ->constrained('tbpacientes')
                ->cascadeOnDelete();

            $table->string('status', 20)
                ->default(StatusSenha::Ativa->value);

            $table->timestamp('chamada_em')
                ->nullable();

            $table->timestamps();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbsenhas');
    }
};
