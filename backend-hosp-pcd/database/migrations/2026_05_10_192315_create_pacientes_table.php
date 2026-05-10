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
        Schema::create('tbpacientes', function (Blueprint $table) {
            $table->id();

            // Vínculo opcional: paciente adulto que tem conta própria.
            // Crianças PCD ficam sem usuario_id e são acessadas via tbresponsavel_paciente.
            $table->foreignId('usuario_id')
                ->nullable()
                ->unique()
                ->constrained('tbusuarios')
                ->nullOnDelete();

            $table->string('nome');
            $table->date('data_nascimento');

            $table->string('cpf')
                ->unique()
                ->nullable();

            $table->string('sexo', 20);

            $table->boolean('possui_autismo')
                ->default(false);

            $table->boolean('necessita_acessibilidade')
                ->default(false);

            $table->boolean('usa_cadeira_rodas')
                ->default(false);

            $table->boolean('necessita_acompanhante')
                ->default(false);

            $table->text('observacoes')
                ->nullable();

            $table->text('observacoes_comunicacao')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('data_nascimento');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbpacientes');
    }
};
