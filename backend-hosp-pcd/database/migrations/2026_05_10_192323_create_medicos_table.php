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

        // 9 médicos — 1 por especialidade (ids 1-9 em tbespecialidades)
        // Todos criados aqui: usuário em tbusuarios + linha em tbmedicos
        $medicos = [
            [
                'nome' => 'Alex',
                'cpf' => '123.456.789-02',
                'email' => 'alex@medico.com',
                'telefone' => '(11) 99999-9999',
                'crm' => 'CRM/SP 110110',
                'descricao' => 'Medicina Física e Reabilitação adulto e infantil.',
            ],
            [
                'nome' => 'Pedro Henrique',
                'cpf' => '123.456.789-20',
                'email' => 'pedro.henrique@medico.com',
                'telefone' => '(11) 98888-1111',
                'crm' => 'CRM/SP 110111',
                'descricao' => 'Neurologia infantil, TEA e paralisia cerebral.',
            ],
            [
                'nome' => 'Juliana Costa',
                'cpf' => '123.456.789-21',
                'email' => 'juliana.costa@medico.com',
                'telefone' => '(11) 98888-2222',
                'crm' => 'CRM/SP 110112',
                'descricao' => 'Ortopedia funcional, órteses e próteses.',
            ],
            [
                'nome' => 'Rafael Almeida',
                'cpf' => '123.456.789-22',
                'email' => 'rafael.almeida@medico.com',
                'telefone' => '(11) 98888-3333',
                'crm' => 'CRM/SP 110113',
                'descricao' => 'Neuropsiquiatria, comorbidades do neurodesenvolvimento.',
            ],
            [
                'nome' => 'Beatriz Lima',
                'cpf' => '123.456.789-23',
                'email' => 'beatriz.lima@medico.com',
                'telefone' => '(11) 98888-4444',
                'crm' => 'CRM/SP 110114',
                'descricao' => 'Linguagem, comunicação alternativa, disfagia.',
            ],
            [
                'nome' => 'Gustavo Ferreira',
                'cpf' => '123.456.789-24',
                'email' => 'gustavo.ferreira@medico.com',
                'telefone' => '(11) 98888-5555',
                'crm' => 'CRM/SP 110115',
                'descricao' => 'Integração sensorial, AVDs, tecnologia assistiva.',
            ],
            [
                'nome' => 'Camila Rocha',
                'cpf' => '123.456.789-25',
                'email' => 'camila.rocha@medico.com',
                'telefone' => '(11) 98888-6666',
                'crm' => 'CRM/SP 110116',
                'descricao' => 'Acompanhamento neurodesenvolvimento 0-18 anos.',
            ],
            [
                'nome' => 'Lucas Martins',
                'cpf' => '123.456.789-26',
                'email' => 'lucas.martins@medico.com',
                'telefone' => '(11) 98888-7777',
                'crm' => 'CRM/SP 110117',
                'descricao' => 'Diagnóstico de síndromes, aconselhamento genético.',
            ],
            [
                'nome' => 'Fernanda Souza',
                'cpf' => '123.456.789-27',
                'email' => 'fernanda.souza@medico.com',
                'telefone' => '(11) 98888-8888',
                'crm' => 'CRM/SP 110118',
                'descricao' => 'Baixa visão, reabilitação visual.',
            ],
        ];

        foreach ($medicos as $m) {
            $uid = DB::table('tbusuarios')->insertGetId([
                'nome' => $m['nome'],
                'cpf' => $m['cpf'],
                'email' => $m['email'],
                'senha' => Hash::make('medico123'),
                'telefone' => $m['telefone'],
                'tipo_usuario' => 'medico',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('tbmedicos')->insert([
                'usuario_id' => $uid,
                'crm' => $m['crm'],
                'descricao' => $m['descricao'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbmedicos');
    }
};
