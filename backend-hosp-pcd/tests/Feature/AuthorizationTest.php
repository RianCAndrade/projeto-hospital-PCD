<?php

namespace Tests\Feature;

use App\Enums\StatusAgendamento;
use App\Enums\TiposUsuario;
use App\Models\Agendamento;
use App\Models\Especialidade;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\ResponsavelPaciente;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $admin;

    private Usuario $rh;

    private Usuario $recepcionista;

    private Usuario $medicoA;

    private Usuario $medicoB;

    private Usuario $responsavelA;

    private Usuario $responsavelB;

    private Medico $medicoAModel;

    private Medico $medicoBModel;

    private Paciente $pacienteDoRespA;

    private Paciente $pacienteDoRespB;

    private Agendamento $agendamentoA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = Usuario::create([
            'nome' => 'Admin', 'email' => 'admin@acolher.com',
            'senha' => Hash::make('admin123'), 'tipo_usuario' => TiposUsuario::Admin->value,
        ]);
        $this->rh = Usuario::create([
            'nome' => 'RH', 'email' => 'rh@acolher.com',
            'senha' => Hash::make('rh123'), 'tipo_usuario' => TiposUsuario::Rh->value,
        ]);
        $this->recepcionista = Usuario::create([
            'nome' => 'Recep', 'email' => 'recep@acolher.com',
            'senha' => Hash::make('recep123'), 'tipo_usuario' => TiposUsuario::Recepcionista->value,
        ]);

        $medA = Usuario::create([
            'nome' => 'Dr. A', 'email' => 'medA@acolher.com',
            'senha' => Hash::make('med123'), 'tipo_usuario' => TiposUsuario::Medico->value,
        ]);
        $this->medicoAModel = Medico::create(['usuario_id' => $medA->id, 'crm' => 'CRM-A-1']);
        $this->medicoA = $medA;

        $medB = Usuario::create([
            'nome' => 'Dr. B', 'email' => 'medB@acolher.com',
            'senha' => Hash::make('med123'), 'tipo_usuario' => TiposUsuario::Medico->value,
        ]);
        $this->medicoBModel = Medico::create(['usuario_id' => $medB->id, 'crm' => 'CRM-B-1']);
        $this->medicoB = $medB;

        $this->responsavelA = Usuario::create([
            'nome' => 'Mãe A', 'email' => 'maeA@acolher.com',
            'senha' => Hash::make('mae123'), 'tipo_usuario' => TiposUsuario::Responsavel->value,
        ]);
        $this->responsavelB = Usuario::create([
            'nome' => 'Mãe B', 'email' => 'maeB@acolher.com',
            'senha' => Hash::make('mae123'), 'tipo_usuario' => TiposUsuario::Responsavel->value,
        ]);

        $this->pacienteDoRespA = Paciente::create([
            'nome' => 'Filho A', 'data_nascimento' => '2018-01-01', 'sexo' => 'masculino',
        ]);
        ResponsavelPaciente::create([
            'usuario_id' => $this->responsavelA->id,
            'paciente_id' => $this->pacienteDoRespA->id,
            'parentesco' => 'Mãe', 'principal' => true,
        ]);

        $this->pacienteDoRespB = Paciente::create([
            'nome' => 'Filho B', 'data_nascimento' => '2018-01-01', 'sexo' => 'feminino',
        ]);
        ResponsavelPaciente::create([
            'usuario_id' => $this->responsavelB->id,
            'paciente_id' => $this->pacienteDoRespB->id,
            'parentesco' => 'Mãe', 'principal' => true,
        ]);

        $this->agendamentoA = Agendamento::create([
            'paciente_id' => $this->pacienteDoRespA->id,
            'medico_id' => $this->medicoAModel->id,
            'especialidade_id' => Especialidade::first()->id ?? Especialidade::create(['nome' => 'Cardio'])->id,
            'data_agendamento' => '2026-12-01',
            'horario' => '10:00:00',
            'status' => StatusAgendamento::Agendado->value,
        ]);
    }

    // ───────── Admin: acesso total ─────────

    public function test_admin_pode_listar_usuarios(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/usuarios')
            ->assertOk()
            ->assertJsonPath('error', false);
    }

    public function test_admin_pode_acessar_admin(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/admin')
            ->assertOk()
            ->assertJsonPath('error', false);
    }

    // ───────── RH/Admin: gestão de staff ─────────

    public function test_rh_pode_listar_medicos_via_rh(): void
    {
        $this->actingAs($this->rh)
            ->getJson('/api/rh/medicos')
            ->assertOk()
            ->assertJsonPath('error', false);
    }

    public function test_medico_nao_pode_listar_medicos_via_rh(): void
    {
        $this->actingAs($this->medicoA)
            ->getJson('/api/rh/medicos')
            ->assertStatus(403)
            ->assertJsonPath('error', true);
    }

    public function test_responsavel_nao_pode_acessar_admin(): void
    {
        $this->actingAs($this->responsavelA)
            ->getJson('/api/admin')
            ->assertStatus(403)
            ->assertJsonPath('error', true);
    }

    // ───────── Pacientes: leitura restrita a staff ─────────

    public function test_recepcionista_pode_listar_pacientes(): void
    {
        $this->actingAs($this->recepcionista)
            ->getJson('/api/pacientes')
            ->assertOk()
            ->assertJsonPath('error', false);
    }

    public function test_responsavel_nao_pode_listar_pacientes(): void
    {
        $this->actingAs($this->responsavelA)
            ->getJson('/api/pacientes')
            ->assertStatus(403);
    }

    public function test_responsavel_pode_listar_meus_pacientes(): void
    {
        $this->actingAs($this->responsavelA)
            ->getJson('/api/pacientes/meus')
            ->assertOk()
            ->assertJsonPath('error', false)
            ->assertJsonCount(1, 'data');
    }

    // ───────── Agendamentos: scoping por papel ─────────

    public function test_medico_so_ve_proprios_agendamentos(): void
    {
        $response = $this->actingAs($this->medicoA)
            ->getJson('/api/agendamentos');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertContains($this->agendamentoA->id, $ids);
    }

    public function test_responsavel_so_ve_agendamentos_dos_seus_pacientes(): void
    {
        // Cria um agendamento para o paciente do responsavel B
        $agendamentoB = Agendamento::create([
            'paciente_id' => $this->pacienteDoRespB->id,
            'medico_id' => $this->medicoBModel->id,
            'especialidade_id' => $this->agendamentoA->especialidade_id,
            'data_agendamento' => '2026-12-02',
            'horario' => '11:00:00',
            'status' => StatusAgendamento::Agendado->value,
        ]);

        $response = $this->actingAs($this->responsavelA)
            ->getJson('/api/agendamentos');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertContains($this->agendamentoA->id, $ids);
        $this->assertNotContains($agendamentoB->id, $ids);
    }

    public function test_responsavel_pode_cancelar_agendamento_do_seu_paciente(): void
    {
        $this->actingAs($this->responsavelA)
            ->patchJson("/api/agendamentos/{$this->agendamentoA->id}/cancelar")
            ->assertOk()
            ->assertJsonPath('data.status', StatusAgendamento::Cancelado->value);
    }

    public function test_responsavel_nao_pode_cancelar_agendamento_de_outro_paciente(): void
    {
        $agendamentoB = Agendamento::create([
            'paciente_id' => $this->pacienteDoRespB->id,
            'medico_id' => $this->medicoBModel->id,
            'especialidade_id' => $this->agendamentoA->especialidade_id,
            'data_agendamento' => '2026-12-02',
            'horario' => '11:00:00',
            'status' => StatusAgendamento::Agendado->value,
        ]);

        $this->actingAs($this->responsavelA)
            ->patchJson("/api/agendamentos/{$agendamentoB->id}/cancelar")
            ->assertStatus(403);
    }

    public function test_medico_pode_chamar_agendamento_da_propria_agenda(): void
    {
        $this->agendamentoA->update(['status' => StatusAgendamento::Confirmado->value]);

        $this->actingAs($this->medicoA)
            ->patchJson("/api/agendamentos/{$this->agendamentoA->id}/chamar")
            ->assertOk()
            ->assertJsonPath('data.status', StatusAgendamento::Chamado->value);
    }

    public function test_medico_nao_pode_chamar_agendamento_de_outro_medico(): void
    {
        $this->agendamentoA->update(['status' => StatusAgendamento::Confirmado->value]);

        $this->actingAs($this->medicoB)
            ->patchJson("/api/agendamentos/{$this->agendamentoA->id}/chamar")
            ->assertStatus(403);
    }

    // ───────── Atendimentos: scoping por papel ─────────

    public function test_medico_pode_criar_atendimento(): void
    {
        $this->actingAs($this->medicoA)
            ->postJson('/api/atendimentos', [
                'agendamento_id' => $this->agendamentoA->id,
                'medico_id' => $this->medicoAModel->id,
                'descricao' => 'Consulta realizada.',
            ])
            ->assertCreated()
            ->assertJsonPath('error', false);
    }

    public function test_responsavel_nao_pode_criar_atendimento(): void
    {
        $this->actingAs($this->responsavelA)
            ->postJson('/api/atendimentos', [
                'agendamento_id' => $this->agendamentoA->id,
                'medico_id' => $this->medicoAModel->id,
            ])
            ->assertStatus(403);
    }

    // ───────── Senhas: criação/chamada restrita a recep ─────────

    public function test_recepcionista_pode_criar_senha(): void
    {
        $this->actingAs($this->recepcionista)
            ->postJson('/api/senhas', [
                'agendamento_id' => $this->agendamentoA->id,
                'paciente_id' => $this->pacienteDoRespA->id,
            ])
            ->assertCreated()
            ->assertJsonPath('error', false);
    }

    public function test_responsavel_nao_pode_criar_senha(): void
    {
        $this->actingAs($this->responsavelA)
            ->postJson('/api/senhas', [
                'agendamento_id' => $this->agendamentoA->id,
                'paciente_id' => $this->pacienteDoRespA->id,
            ])
            ->assertStatus(403);
    }

    // ───────── Perfil: ownership ─────────

    public function test_usuario_pode_atualizar_proprio_perfil(): void
    {
        $this->actingAs($this->responsavelA)
            ->putJson("/api/perfil/{$this->responsavelA->id}", [
                'nome' => 'Mãe A Silva',
            ])
            ->assertOk()
            ->assertJsonPath('data.nome', 'Mãe A Silva');
    }

    public function test_usuario_nao_pode_atualizar_perfil_de_outro(): void
    {
        $this->actingAs($this->responsavelA)
            ->putJson("/api/perfil/{$this->responsavelB->id}", [
                'nome' => 'Hackeando',
            ])
            ->assertStatus(403);
    }

    public function test_admin_pode_atualizar_perfil_de_outro(): void
    {
        $this->actingAs($this->admin)
            ->putJson("/api/perfil/{$this->responsavelA->id}", [
                'nome' => 'Mãe A Editada',
            ])
            ->assertOk()
            ->assertJsonPath('data.nome', 'Mãe A Editada');
    }

    public function test_usuario_nao_pode_excluir_perfil_de_outro(): void
    {
        $this->actingAs($this->responsavelA)
            ->deleteJson("/api/perfil/{$this->responsavelB->id}")
            ->assertStatus(403);
    }

    // ───────── Usuários: somente admin ─────────

    public function test_nao_admin_nao_pode_listar_usuarios(): void
    {
        $this->actingAs($this->recepcionista)
            ->getJson('/api/usuarios')
            ->assertStatus(403);
    }

    public function test_nao_admin_nao_pode_excluir_usuario(): void
    {
        $this->actingAs($this->recepcionista)
            ->deleteJson("/api/usuarios/{$this->responsavelA->id}")
            ->assertStatus(403);
    }

    // ───────── Especialidades / Tipos ─────────

    public function test_recepcionista_pode_listar_especialidades(): void
    {
        $this->actingAs($this->recepcionista)
            ->getJson('/api/especialidades')
            ->assertOk();
    }

    public function test_responsavel_nao_pode_criar_especialidade(): void
    {
        $this->actingAs($this->responsavelA)
            ->postJson('/api/especialidades', ['nome' => 'Nova'])
            ->assertStatus(403);
    }

    public function test_rh_pode_criar_especialidade(): void
    {
        $this->actingAs($this->rh)
            ->postJson('/api/especialidades', ['nome' => 'Cardiologia Teste'])
            ->assertCreated();
    }
}
