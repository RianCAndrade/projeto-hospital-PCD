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
        Schema::create('tbresponsavel_paciente', function (Blueprint $table) {
            $table->id();

            $table->foreignId('usuario_id')
                ->constrained('tbusuarios')
                ->cascadeOnDelete();

            $table->foreignId('paciente_id')
                ->constrained('tbpacientes')
                ->cascadeOnDelete();

            $table->string('parentesco');

            $table->boolean('principal')
                ->default(false);

            $table->timestamps();

            // Impede duplicar o mesmo usuário como responsável do mesmo paciente
            $table->unique(['usuario_id', 'paciente_id']);
        });

        // Garante apenas 1 responsável principal por paciente (partial unique index do Postgres)
        DB::statement('
            CREATE UNIQUE INDEX ux_responsavel_paciente_principal
            ON tbresponsavel_paciente (paciente_id)
            WHERE principal = true
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS ux_responsavel_paciente_principal');
        Schema::dropIfExists('tbresponsavel_paciente');
    }
};
