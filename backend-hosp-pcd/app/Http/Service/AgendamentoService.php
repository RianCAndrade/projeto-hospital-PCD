<?php

namespace App\Http\Service;

use App\Enums\StatusAgendamento;
use App\Enums\StatusAtendimento;
use App\Enums\TiposUsuario;
use App\Http\Repository\AgendamentoRepository;
use App\Models\Agendamento;
use App\Models\Atendimento;
use App\Models\Senha;
use App\Models\Usuario;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class AgendamentoService
{
    public function __construct(private AgendamentoRepository $agendamentoRepository, private AtendimentoService $atendimentoService, private SenhaService $senhaService) {}

    /**
     * Lista agendamentos aplicando scoping por papel:
     *  - admin/rh/recepcionista: veem tudo
     *  - medico: apenas os próprios (medico_id === user->medico->id)
     *  - responsavel/paciente: apenas dos pacientes vinculados em tbresponsavel_paciente
     */
    public function index(array $filtros = [], ?Usuario $user = null): mixed
    {
        $filtros = $this->aplicarEscopo($filtros, $user);

        return $this->agendamentoRepository->index($filtros);
    }

    public function store(array $dados): Agendamento
    {
        $dados['status'] ??= StatusAgendamento::Agendado->value;

        return $this->agendamentoRepository->store($dados);
    }

    /**
     * Show: se o usuário não for staff, retorna null quando não for do escopo dele.
     */
    public function show(int $id, ?Usuario $user = null): ?Agendamento
    {
        $agendamento = $this->agendamentoRepository->show($id);

        if (! $agendamento) {
            return null;
        }

        if ($user && ! $this->userPodeVer($user, $agendamento)) {
            return null;
        }

        return $agendamento;
    }

    public function update(int $id, array $dados): ?Agendamento
    {
        return $this->agendamentoRepository->update($id, $dados);
    }

    public function destroy(int $id): bool
    {
        return $this->agendamentoRepository->destroy($id);
    }

    public function updateStatus(int $id, string $status): ?Agendamento
    {
        if ($status === StatusAgendamento::Confirmado->value) {
            $agendamento = $this->agendamentoRepository->show($id);

            if ($agendamento) {
                $jaTemSenha = Senha::where('agendamento_id', $agendamento->id)->exists();
                if (! $jaTemSenha) {
                    $this->senhaService->store([
                        'agendamento_id' => $agendamento->id,
                        'paciente_id' => $agendamento->paciente_id,
                    ]);
                }
            }
        }

        return $this->agendamentoRepository->update($id, ['status' => $status]);
    }

    /**
     * Cancelar: recep/rh/admin sempre podem; responsavel só se for do paciente.
     *
     * @throws AuthorizationException quando um responsavel tenta cancelar
     *                                agendamento de paciente que não é dele.
     */
    public function cancel(int $id, ?Usuario $user = null): ?Agendamento
    {
        $agendamento = $this->agendamentoRepository->show($id);

        if (! $agendamento) {
            return null;
        }

        if ($user && ! $this->userPodeVer($user, $agendamento)) {
            throw new AuthorizationException(
                'Você só pode cancelar agendamentos dos seus pacientes.',
            );
        }

        return $this->agendamentoRepository->update($id, [
            'status' => StatusAgendamento::Cancelado->value,
        ]);
    }

    /**
     * Remarcar: mesma regra de ownership do cancel.
     *
     * @throws AuthorizationException
     */
    public function reschedule(int $id, array $dados, ?Usuario $user = null): ?Agendamento
    {
        $agendamento = $this->agendamentoRepository->show($id);

        if (! $agendamento) {
            return null;
        }

        if ($user && ! $this->userPodeVer($user, $agendamento)) {
            throw new AuthorizationException(
                'Você só pode remarcar agendamentos dos seus pacientes.',
            );
        }

        $dados['status'] ??= StatusAgendamento::Remarcado->value;

        return $this->agendamentoRepository->update($id, $dados);
    }

    /**
     * Marca um agendamento como "chamado" (status intermediário entre
     * `confirmado` e `em_atendimento`). Reverte automaticamente qualquer
     * outro agendamento `chamado` do mesmo médico de volta para
     * `confirmado`, evitando dois pacientes chamados ao mesmo tempo.
     *
     * Se for um médico, valida que o agendamento é dele.
     *
     * @throws InvalidArgumentException se o agendamento não estiver
     *                                  com status `confirmado`.
     * @throws AuthorizationException se for médico e o agendamento
     *                                não for dele.
     */
    public function chamar(int $id, ?Usuario $user = null): ?Agendamento
    {
        $agendamento = $this->agendamentoRepository->show($id);

        if (! $agendamento) {
            return null;
        }

        if ($user && $this->isMedico($user) && ! $this->agendamentoPertenceAoMedico($user, $agendamento)) {
            throw new AuthorizationException(
                'Você só pode chamar pacientes da sua agenda.',
            );
        }

        if ($agendamento->status !== StatusAgendamento::Confirmado->value) {
            throw new \InvalidArgumentException(
                'Somente agendamentos confirmados podem ser chamados.',
            );
        }

        $this->agendamentoRepository->reverterChamadoDoMedico(
            $agendamento->medico_id,
            $agendamento->id,
        );

        return $this->agendamentoRepository->update($id, [
            'status' => StatusAgendamento::Chamado->value,
        ]);
    }

    /**
     * Move o agendamento de `chamado` para `em_atendimento`. Falha se o
     * status atual for diferente — garante que o médico não pule a etapa
     * de "chamar" e a recepção/paciente sejam avisados de que ele chegou.
     *
     * @throws InvalidArgumentException se o status atual não for `chamado`.
     * @throws AuthorizationException se for médico e o agendamento
     *                                não for dele.
     */
    public function iniciarAtendimento(int $id, ?Usuario $user = null): ?Agendamento
    {
        $agendamento = $this->agendamentoRepository->show($id);

        if (! $agendamento) {
            return null;
        }

        if ($user && $this->isMedico($user) && ! $this->agendamentoPertenceAoMedico($user, $agendamento)) {
            throw new AuthorizationException(
                'Você só pode iniciar atendimentos da sua agenda.',
            );
        }

        if ($agendamento->status === StatusAgendamento::EmAtendimento->value) {
            // idempotente: ja em atendimento, so atualiza quem registrou

            Atendimento::updateOrCreate(
                [
                    'agendamento_id' => $agendamento->id,
                    'medico_id' => $agendamento->medico_id,
                ],
                [
                    'registrado_por_id' => $user->id,
                    'status' => StatusAtendimento::EmAtendimento->value,
                ]
            );

            return $this->agendamentoRepository->update($id, [
                'status' => StatusAgendamento::EmAtendimento->value,
            ]);
        }

        if ($agendamento->status !== StatusAgendamento::Chamado->value) {
            throw new \InvalidArgumentException(
                'Somente agendamentos chamados podem ser iniciados.',
            );
        }

        $atendimento = Atendimento::updateOrCreate(
            [
                'agendamento_id' => $agendamento->id,
                'medico_id' => $agendamento->medico_id,
            ],
            [
                'registrado_por_id' => $user->id,
                'status' => StatusAtendimento::EmAtendimento->value,
            ]
        );

        // Atualiza o status do agendamento
        return $this->agendamentoRepository->update($id, [
            'status' => StatusAgendamento::EmAtendimento->value,
        ]);
    }

    // ───────────────────────── helpers ─────────────────────────

    private function aplicarEscopo(array $filtros, ?Usuario $user): array
    {
        if (! $user) {
            return $filtros;
        }

        $role = $this->role($user);

        if (in_array($role, [TiposUsuario::Admin->value, TiposUsuario::Rh->value, TiposUsuario::Recepcionista->value], true)) {
            return $filtros;
        }

        if ($role === TiposUsuario::Medico->value && $user->medico) {
            // Não sobrescreve se o filtro já veio com medico_id explícito.
            $filtros['medico_id'] ??= $user->medico->id;

            return $filtros;
        }

        if (in_array($role, [TiposUsuario::Responsavel->value, TiposUsuario::Paciente->value], true)) {
            $pacienteIds = DB::table('tbresponsavel_paciente')
                ->where('usuario_id', $user->id)
                ->pluck('paciente_id')
                ->all();

            // Para o próprio paciente (adulto autocadastrado), também inclui o próprio paciente_id.
            if ($user->paciente) {
                $pacienteIds[] = $user->paciente->id;
            }

            $filtros['paciente_ids'] = array_values(array_unique($pacienteIds));

            return $filtros;
        }

        return $filtros;
    }

    private function userPodeVer(Usuario $user, Agendamento $agendamento): bool
    {
        $role = $this->role($user);

        if (in_array($role, [TiposUsuario::Admin->value, TiposUsuario::Rh->value, TiposUsuario::Recepcionista->value], true)) {
            return true;
        }

        if ($role === TiposUsuario::Medico->value && $user->medico) {
            return $this->agendamentoPertenceAoMedico($user, $agendamento);
        }

        if (in_array($role, [TiposUsuario::Responsavel->value, TiposUsuario::Paciente->value], true)) {
            $vinculado = DB::table('tbresponsavel_paciente')
                ->where('usuario_id', $user->id)
                ->where('paciente_id', $agendamento->paciente_id)
                ->exists();

            if ($vinculado) {
                return true;
            }

            // Paciente adulto vendo a própria agenda.
            return $user->paciente && $user->paciente->id === $agendamento->paciente_id;
        }

        return false;
    }

    private function isMedico(Usuario $user): bool
    {
        return $this->role($user) === TiposUsuario::Medico->value;
    }

    private function agendamentoPertenceAoMedico(Usuario $user, Agendamento $agendamento): bool
    {
        return $user->medico && $user->medico->id === $agendamento->medico_id;
    }

    private function role(Usuario $user): string
    {
        return $user->tipo_usuario instanceof TiposUsuario
            ? $user->tipo_usuario->value
            : (string) $user->tipo_usuario;
    }
}
