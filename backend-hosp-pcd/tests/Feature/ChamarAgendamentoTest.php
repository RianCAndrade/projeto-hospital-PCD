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
        // `2026_05_10_192327_create_especialidades_table.php` (3 linhas: 1, 2, 3).
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

    public function test_iniciar_agendamento_ja_em_atendimento_retorna_422(): void
    {
        $agendamento = $this->criarAgendamento(StatusAgendamento::EmAtendimento->value);

        $response = $this->actingAs($this->medico)
            ->patchJson("/api/agendamentos/{$agendamento->id}/iniciar");

        $response->assertStatus(422);
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
}
