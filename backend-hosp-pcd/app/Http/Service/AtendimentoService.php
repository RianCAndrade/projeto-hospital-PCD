<?php

namespace App\Http\Service;

use App\Enums\StatusAtendimento;
use App\Enums\TiposUsuario;
use App\Http\Repository\AtendimentoRepository;
use App\Models\Atendimento;
use App\Models\Usuario;

class AtendimentoService
{
    public function __construct(private AtendimentoRepository $atendimentoRepository) {}

    /**
     * Lista atendimentos aplicando scoping por papel:
     *  - admin/rh: veem tudo
     *  - medico: apenas os próprios (medico_id === user->medico->id)
     *  - recepcionista: veem tudo (visão operacional)
     *  - responsavel/paciente: sem acesso (rota já é bloqueada por middleware)
     */
    public function index(?Usuario $user = null): mixed
    {
        $filtros = [];

        if ($user && $this->role($user) === TiposUsuario::Medico->value && $user->medico) {
            $filtros['medico_id'] = $user->medico->id;
        }

        return $this->atendimentoRepository->index($filtros);
    }

    public function store(array $dados): Atendimento
    {
        $dados['status'] ??= StatusAtendimento::NaoAtendido->value;

        return $this->atendimentoRepository->store($dados);
    }

    public function show(int $id): ?Atendimento
    {
        return $this->atendimentoRepository->show($id);
    }

    public function update(int $id, array $dados): ?Atendimento
    {
        return $this->atendimentoRepository->update($id, $dados);
    }

    public function destroy(int $id): bool
    {
        return $this->atendimentoRepository->destroy($id);
    }

    private function role(Usuario $user): string
    {
        return $user->tipo_usuario instanceof TiposUsuario
            ? $user->tipo_usuario->value
            : (string) $user->tipo_usuario;
    }
}
