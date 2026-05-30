<?php

namespace App\Http\Service;

use App\Enums\StatusSenha;
use App\Http\Repository\SenhaRepository;
use App\Models\Senha;

class SenhaService
{
    public function __construct(private SenhaRepository $senhaRepository) {}

    public function index(): mixed
    {
        return $this->senhaRepository->index();
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
}
