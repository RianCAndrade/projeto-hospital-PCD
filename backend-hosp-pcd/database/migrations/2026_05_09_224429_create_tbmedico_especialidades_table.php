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
        Schema::create('tbmedico_especialidades', function (Blueprint $table) {
            $table->foreignId('medico_id')->constrained('tbmedicos')->onDelete('cascade');
            $table->foreignId('especialidade_id')->constrained('tbespecialidades')->onDelete('cascade');
            $table->primary(['medico_id', 'especialidade_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbmedico_especialidades');
    }
};
