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
        Schema::create('tbfuncionarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medico_id')->constrained('tbmedicos')->onDelete('cascade');
            $table->foreignId('recepcionista_id')->constrained('tbrecepcionista')->onDelete('cascade');
            $table->string('is_adm');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbfuncionarios');
    }
};
