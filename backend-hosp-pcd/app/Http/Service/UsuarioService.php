<?php

namespace App\Http\Service;

use App\Http\Repository\UsuarioRepository;
use App\Models\Usuario;

class UsuarioService
{
    public function __construct(private UsuarioRepository $usuarioRepository) {}

    public function index(array $filtros = []): mixed
    {
        return $this->usuarioRepository->index($filtros);
    }

    public function show(int $id): ?Usuario
    {
        return $this->usuarioRepository->show($id);
    }

    public function destroy(int $id): bool
    {
        return $this->usuarioRepository->destroy($id);
    }
}
