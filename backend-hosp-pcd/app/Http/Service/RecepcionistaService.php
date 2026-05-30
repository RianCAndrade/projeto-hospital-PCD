<?php

namespace App\Http\Service;

use App\Enums\TiposUsuario;
use App\Http\Repository\RecepcionistaRepository;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class RecepcionistaService
{
    public function __construct(
        private RecepcionistaRepository $recepcionistaRepository
    ) {}

    public function index()
    {
        return Usuario::query()
            ->where('tipo_usuario', TiposUsuario::Recepcionista)
            ->orderBy('nome')
            ->get();
    }

    public function show(int $id): ?Usuario
    {
        return Usuario::query()
            ->where('id', $id)
            ->where('tipo_usuario', TiposUsuario::Recepcionista)
            ->first();
    }

    public function store(array $dados)
    {
        $dados['senha'] = Hash::make($dados['senha']);

        return $this->recepcionistaRepository->store($dados);
    }

    public function update(int $id, array $dados)
    {
        if (array_key_exists('senha', $dados)) {
            $dados['senha'] = Hash::make($dados['senha']);
        }

        return $this->recepcionistaRepository->update($id, $dados);
    }

    public function destroy(int $id)
    {
        return $this->recepcionistaRepository->delete($id);
    }
}
