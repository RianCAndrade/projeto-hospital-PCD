<?php

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
        Schema::create('tbmedicos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('usuario_id')
                ->unique()
                ->constrained('tbusuarios')
                ->restrictOnDelete();

            $table->string('crm')
                ->unique();

            $table->text('descricao')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // 1) Vincula o usuário "Medico" que já vem do seed de tbusuarios (id=3)
        DB::table('tbmedicos')->insert([
            'usuario_id' => 4,
            'crm' => 'CRM/SP 100100',
            'descricao' => 'Cardiologia pediátrica.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2) Cria mais dois médicos (usuário + linha em tbmedicos)
        $anaId = DB::table('tbusuarios')->insertGetId([
            'nome' => 'Ana Souza',
            'cpf' => '123.456.789-10',
            'email' => 'ana.souza@acolher.com',
            'senha' => Hash::make('medico123'),
            'telefone' => '(11) 98888-7777',
            'tipo_usuario' => 'medico',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('tbmedicos')->insert([
            'usuario_id' => $anaId,
            'crm' => 'CRM/SP 200200',
            'descricao' => 'Ortopedia pediátrica.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $carlosId = DB::table('tbusuarios')->insertGetId([
            'nome' => 'Carlos Lima',
            'cpf' => '123.456.789-11',
            'email' => 'carlos.lima@acolher.com',
            'senha' => Hash::make('medico123'),
            'telefone' => '(11) 97777-6666',
            'tipo_usuario' => 'medico',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('tbmedicos')->insert([
            'usuario_id' => $carlosId,
            'crm' => 'CRM/SP 300300',
            'descricao' => 'Neurologia pediátrica.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbmedicos');
    }
};
