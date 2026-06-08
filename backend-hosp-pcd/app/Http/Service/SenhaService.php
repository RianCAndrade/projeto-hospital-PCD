<?php

namespace App\Http\Service;

use App\Enums\StatusSenha;
use App\Enums\TiposUsuario;
use App\Http\Repository\SenhaRepository;
use App\Models\Senha;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

class SenhaService
{
    public function __construct(private SenhaRepository $senhaRepository) {}

    /**
     * Lista senhas aplicando scoping:
     *  - admin/rh: tudo
     *  - medico: tudo (visão operacional)
     *  - recepcionista: tudo
     *  - responsavel/paciente: apenas senhas dos pacientes vinculados
     */
    public function index(?Usuario $user = null): mixed
    {
        $filtros = [];

        if ($user && in_array($this->role($user), [TiposUsuario::Responsavel->value, TiposUsuario::Paciente->value], true)) {
            $filtros['paciente_ids'] = $this->pacienteIdsDoUsuario($user);
        }

        return $this->senhaRepository->index($filtros);
    }

    public function store(array $dados): Senha
    {
        $dados['status'] ??= StatusSenha::Ativa->value;

        if (empty($dados['codigo'])) {
            $ultimo = $this->senhaRepository->index()->sortByDesc('id')->first();
            $proximoNumero = $ultimo ? ((int) substr($ultimo->codigo, 1)) + 1 : 1;
            $dados['codigo'] = 'A'.str_pad((string) $proximoNumero, 3, '0', STR_PAD_LEFT);
        }

        return $this->senhaRepository->store($dados);
    }

    public function show(int $id): ?Senha
    {
        return $this->senhaRepository->show($id);
    }

    public function updateStatus(int $id, string $status): ?Senha
    {
        $dados = ['status' => $status];

        if ($status === StatusSenha::Chamada->value) {
            $dados['chamada_em'] = now();
        }

        return $this->senhaRepository->update($id, $dados);
    }

    public function chamar(int $id): ?Senha
    {
        return $this->updateStatus($id, StatusSenha::Chamada->value);
    }

    private function role(Usuario $user): string
    {
        return $user->tipo_usuario instanceof TiposUsuario
            ? $user->tipo_usuario->value
            : (string) $user->tipo_usuario;
    }

    private function pacienteIdsDoUsuario(Usuario $user): array
    {
        $ids = DB::table('tbresponsavel_paciente')
            ->where('usuario_id', $user->id)
            ->pluck('paciente_id')
            ->all();

        if ($user->paciente) {
            $ids[] = $user->paciente->id;
        }

        return array_values(array_unique($ids));
    }
}
