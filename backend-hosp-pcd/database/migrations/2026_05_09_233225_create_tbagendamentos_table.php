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
        Schema::create('tbagendamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('tbusuarios')->onDelete('cascade');
            $table->foreignId('senha_id')->constrained('tbsenhas')->onDelete('cascade');
            $table->foreignId('medico_id')->constrained('tbmedicos')->onDelete('cascade');
            $table->string('data-hora_marcado');
            // $table->timestamps();
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
