<?php

namespace Tests\Feature;

use App\Enums\TiposUsuario;
use App\Models\Paciente;
use App\Models\ResponsavelPaciente;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    private function payloadBase(array $overrides = []): array
    {
        return array_merge([
            'nome' => 'Maria Silva',
            'cpf' => '999.888.777-66',
            'email' => 'maria@acolher.com',
            'senha' => 'segura123',
            'telefone' => '11999998888',
            'data_nascimento' => '1990-05-12',
            'sexo' => 'feminino',
            'possui_autismo' => false,
            'necessita_acessibilidade' => true,
            'usa_cadeira_rodas' => false,
            'necessita_acompanhante' => false,
            'observacoes' => null,
            'observacoes_comunicacao' => null,
        ], $overrides);
    }

    public function test_cadastro_sem_responsavel_apenas_cria_paciente(): void
    {
        $payload = $this->payloadBase();

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('error', false)
            ->assertJsonPath('data.email', 'maria@acolher.com')
            ->assertJsonPath('data.tipo_usuario', TiposUsuario::Paciente->value);

        $this->assertDatabaseHas('tbusuarios', [
            'email' => 'maria@acolher.com',
            'tipo_usuario' => TiposUsuario::Paciente->value,
        ]);

        $this->assertDatabaseHas('tbpacientes', [
            'nome' => 'Maria Silva',
            'cpf' => '999.888.777-66',
            'necessita_acompanhante' => false,
        ]);

        $this->assertDatabaseCount('tbresponsavel_paciente', 0);
    }

    public function test_cadastro_com_necessita_acompanhante_cria_responsavel_e_vinculo(): void
    {
        $payload = $this->payloadBase([
            'necessita_acompanhante' => true,
            'responsavel_nome' => 'Joana Silva',
            'responsavel_email' => 'joana@acolher.com',
            'responsavel_telefone' => '11988887777',
            'responsavel_senha' => 'outraSenha123',
            'responsavel_parentesco' => 'Mãe',
            'responsavel_principal' => true,
        ]);

        $response = $this->postJson('/api/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('error', false);

        // Usuário paciente criado
        $paciente = Paciente::firstOrFail();
        $this->assertDatabaseHas('tbusuarios', [
            'email' => 'maria@acolher.com',
            'tipo_usuario' => TiposUsuario::Paciente->value,
        ]);
        $this->assertTrue((bool) $paciente->necessita_acompanhante);

        // Usuário responsável criado
        $responsavelUsuario = Usuario::where('email', 'joana@acolher.com')->firstOrFail();
        $this->assertSame(TiposUsuario::Responsavel->value, $responsavelUsuario->tipo_usuario->value);
        $this->assertTrue(Hash::check('outraSenha123', $responsavelUsuario->senha));

        // Vínculo criado
        $vinculo = ResponsavelPaciente::firstOrFail();
        $this->assertSame($responsavelUsuario->id, $vinculo->usuario_id);
        $this->assertSame($paciente->id, $vinculo->paciente_id);
        $this->assertSame('Mãe', $vinculo->parentesco);
        $this->assertTrue($vinculo->principal);
    }

    public function test_cadastro_com_necessita_acompanhante_exige_dados_do_responsavel(): void
    {
        $payload = $this->payloadBase(['necessita_acompanhante' => true]);

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'responsavel_nome',
                'responsavel_email',
                'responsavel_senha',
                'responsavel_parentesco',
            ]);
    }

    public function test_cadastro_com_necessita_acompanhante_email_duplicado_do_responsavel_e_rejeitado(): void
    {
        Usuario::create([
            'nome' => 'Email pré-existente',
            'email' => 'joana@acolher.com',
            'senha' => Hash::make('qualquer'),
            'tipo_usuario' => TiposUsuario::Responsavel->value,
        ]);

        $payload = $this->payloadBase([
            'necessita_acompanhante' => true,
            'responsavel_nome' => 'Joana Silva',
            'responsavel_email' => 'joana@acolher.com',
            'responsavel_senha' => 'outraSenha123',
            'responsavel_parentesco' => 'Mãe',
        ]);

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['responsavel_email']);
    }
}
