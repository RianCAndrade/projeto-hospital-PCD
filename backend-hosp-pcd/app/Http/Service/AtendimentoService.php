<?php

namespace App\Http\Service;

use App\Enums\StatusAtendimento;
use App\Http\Repository\AtendimentoRepository;
use App\Models\Atendimento;

class AtendimentoService
{
    public function __construct(private AtendimentoRepository $atendimentoRepository) {}

    public function index(): mixed
    {
        return $this->atendimentoRepository->index();
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
}
