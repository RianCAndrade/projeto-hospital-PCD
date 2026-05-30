<?php

use App\Enums\TiposUsuario;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbusuarios', function (Blueprint $table) {
            $table->id();

            $table->string('nome');
            $table->string('cpf')->unique();
            $table->string('email')->unique();
            $table->string('senha');
            $table->string('telefone')->nullable();

            $table->string('tipo_usuario', 30)->default(TiposUsuario::Paciente->value);

            $table->timestamps();
        });

        DB::table('tbusuarios')->insert([
            [
                'nome' => 'Administrador',
                'cpf' => '123.456.789-00',
                'email' => 'admin@admin.com',
                'senha' => Hash::make('admin123'), //admin123
                'telefone' => '(11) 99999-9999',
                'tipo_usuario' => TiposUsuario::Admin->value,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'RH',
                'cpf' => '123.456.789-01',
                'email' => 'rh@rh.com',
                'senha' => Hash::make('rh123'),
                'telefone' => '(11) 99999-9999',
                'tipo_usuario' => TiposUsuario::Rh->value,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => 'Medico',
                'cpf' => '123.456.789-02',
                'email' => 'medico@medico.com',
                'senha' => Hash::make('medico123'),
                'telefone' => '(11) 99999-9999',
                'tipo_usuario' => TiposUsuario::Medico->value,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbusuarios');
    }
};
