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
            $table->foreignId('medico_id')->constrained('tbmedicos')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('tbusuarios')->onDelete('cascade');
            $table->string('status', 20)->default(StatusAtendimento::NaoAtendido->value);
            $table->timestamps();
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
