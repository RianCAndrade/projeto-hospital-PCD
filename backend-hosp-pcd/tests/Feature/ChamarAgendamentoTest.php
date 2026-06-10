<?php

namespace Tests\Feature;

use App\Enums\StatusAgendamento;
use App\Enums\TiposUsuario;
use App\Models\Agendamento;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ChamarAgendamentoTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $medico;

    private Usuario $paciente;

    private Medico $medicoModel;

    private Paciente $pacienteModel;

    protected function setUp(): void
    {
        parent::setUp();

        // Usuário médico (vinculado ao model Medico) com token Sanctum ativo.
        $usuarioMedico = Usuario::create([
            'nome' => 'Dra. Teste',
            'email' => 'medico@acolher.com',
            'senha' => Hash::make('segura123'),
            'tipo_usuario' => TiposUsuario::Medico->value,
        ]);
        $this->medicoModel = Medico::create([
            'usuario_id' => $usuarioMedico->id,
            'crm' => 'CRM-SP-9999',
        ]);
        $this->medico = $usuarioMedico;

        // Usuário paciente (vinculado ao model Paciente).
        $usuarioPaciente = Usuario::create([
            'nome' => 'Paciente Teste',
            'email' => 'paciente@acolher.com',
            'senha' => Hash::make('segura123'),
            'tipo_usuario' => TiposUsuario::Paciente->value,
        ]);
        $this->pacienteModel = Paciente::create([
            'usuario_id' => $usuarioPaciente->id,
            'nome' => 'Paciente Teste',
            'data_nascimento' => '2010-01-01',
            'sexo' => 'masculino',
        ]);
        $this->paciente = $usuarioPaciente;

        // `tbespecialidades` é seedada pela migration
        // `2026_05_10_192327_create_especialidades_table.php` (9 linhas: 1=Fisiatria ... 9=Oftalmologia).
    }

    private function criarAgendamento(string $status): Agendamento
    {
        return Agendamento::create([
            'paciente_id' => $this->pacienteModel->id,
            'medico_id' => $this->medicoModel->id,
            'especialidade_id' => 1,
            'data_agendamento' => '2026-06-15',
            'horario' => '14:00:00',
            'status' => $status,
        ]);
    }

    public function test_chamar_agendamento_confirmado_retorna_chamado(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::Confirmado->value);

        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$agendamento->id}/chamar");

        $response->assertOk()
            ->assertJsonPath('error', false)
            ->assertJsonPath('data.status', StatusAgendamento::Chamado->value);

        $this->assertDatabaseHas('tbagendamentos', [
            'id' => $agendamento->id,
            'status' => StatusAgendamento::Chamado->value,
        ]);
    }

    public function test_chamar_agendamento_nao_confirmado_retorna_422(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::Agendado->value);

        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$agendamento->id}/chamar");

        $response->assertStatus(422)
            ->assertJsonPath('error', true);

        $this->assertDatabaseHas('tbagendamentos', [
            'id' => $agendamento->id,
            'status' => StatusAgendamento::Agendado->value,
        ]);
    }

    public function test_chamar_segundo_paciente_reverte_primeiro_para_confirmado(): void
    {
        $primeiro = $this->criarAgendamento(StatusAgendamento::Chamado->value);
        $segundo = $this->criarAgendamento(StatusAgendamento::Confirmado->value);

        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$segundo->id}/chamar");

        $response->assertOk()
            ->assertJsonPath('data.status', StatusAgendamento::Chamado->value);

        $this->assertDatabaseHas('tbagendamentos', [
            'id' => $primeiro->id,
            'status' => StatusAgendamento::Confirmado->value,
        ]);
        $this->assertDatabaseHas('tbagendamentos', [
            'id' => $segundo->id,
            'status' => StatusAgendamento::Chamado->value,
        ]);
    }

    public function test_iniciar_agendamento_chamado_retorna_em_atendimento(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::Chamado->value);

        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$agendamento->id}/iniciar");

        $response->assertOk()
            ->assertJsonPath('data.status', StatusAgendamento::EmAtendimento->value);

        $this->assertDatabaseHas('tbagendamentos', [
            'id' => $agendamento->id,
            'status' => StatusAgendamento::EmAtendimento->value,
        ]);
    }

    public function test_iniciar_agendamento_confirmado_sem_passar_por_chamado_retorna_422(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::Confirmado->value);

        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$agendamento->id}/iniciar");

        $response->assertStatus(422)
            ->assertJsonPath('error', true);

        $this->assertDatabaseHas('tbagendamentos', [
            'id' => $agendamento->id,
            'status' => StatusAgendamento::Confirmado->value,
        ]);
    }

    public function test_iniciar_agendamento_ja_em_atendimento_idempotente(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::EmAtendimento->value);

        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$agendamento->id}/iniciar");

        $response->assertOk()
            ->assertJsonPath('data.status', StatusAgendamento::EmAtendimento->value);
    }

    public function test_chamar_agendamento_inexistente_retorna_404(): void
    {
        $response = $this->actingAs($this->medico)
            ->patchJson('/api/agendamentos/9999/chamar');

        $response->assertNotFound();
    }

    public function test_iniciar_agendamento_inexistente_retorna_404(): void
    {
        $response = $this->actingAs($this->medico)
            ->patchJson('/api/agendamentos/9999/iniciar');

        $response->assertNotFound();
    }

    public function test_medico_nao_pode_chamar_agendamento_de_outro_medico(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::Confirmado->value);

        $outroUsuarioMedico = Usuario::create([
            'nome' => 'Dr. Outro',
            'email' => 'outro@acolher.com',
            'senha' => Hash::make('segura123'),
            'tipo_usuario' => TiposUsuario::Medico->value,
        ]);
        $outroMedico = Medico::create([
            'usuario_id' => $outroUsuarioMedico->id,
            'crm' => 'CRM-SP-8888',
        ]);

        // Vincula o agendamento ao primeiro médico (criado no setUp);
        // o segundo médico tenta chamar — não pode.
        $this->assertSame($this->medicoModel->id, $agendamento->medico_id);
        $this->assertNotSame($outroMedico->id, $agendamento->medico_id);

        $response = $this->actingAs($outroUsuarioMedico)
            ->patchJson("/api/agendamentos/{$agendamento->id}/chamar");

        $response->assertStatus(403)
            ->assertJsonPath('error', true);

        $this->assertDatabaseHas('tbagendamentos', [
            'id' => $agendamento->id,
            'status' => StatusAgendamento::Confirmado->value,
        ]);
    }

    public function test_iniciar_atendimento_cria_atendimento_idempotente(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::Chamado->value);

        // 1 chamada - medico logado ($this->medico)
        $response = $this->actingAs($this->medico)->patchJson("/api/agendamentos/{$agendamento->id}/iniciar");
        $response->assertOk();
        $this->assertDatabaseCount('tbatendimentos', 1);
        $this->assertDatabaseHas('tbatendimentos', [
            // 'id' => $agendamento->id,
            'agendamento_id' => $agendamento->id,
            'medico_id' => $this->medico->medico->id,
            'registrado_por_id' => $this->medico->id,
            'status' => StatusAgendamento::EmAtendimento->value,
        ]);

        // 2 chamadas - medico logado ($this->medico)
        $response = $this->actingAs($this->medico)->patchJson("/api/agendamentos/{$agendamento->id}/iniciar");
        $response->assertOk();
        $this->assertDatabaseCount('tbatendimentos', 1); // Não duplicou
        // $this->assertDatabaseHas('tbagendamentos', [
        //     // 'id' => $agendamento->id,
        //     'status' => StatusAgendamento::EmAtendimento->value,
        // ]);

        // Novo agendamento - mesmo médico
        $agendamento2 = $this->criarAgendamento(StatusAgendamento::Chamado->value);
        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$agendamento2->id}/iniciar");
        $response->assertOk();
        $this->assertDatabaseCount('tbatendimentos', 2); // CRIOU novo (agendamento_id diferente)
    }
}
