<?php

namespace App\Http\Repository;

use App\Models\Usuario;

class UsuarioRepository
{
    public function __construct(private Usuario $usuario) {}

    public function index(array $filtros = []): mixed
    {
        $query = $this->usuario->orderBy('nome');

        if (! empty($filtros['tipo_usuario'])) {
            $query->where('tipo_usuario', $filtros['tipo_usuario']);
        }

        if (! empty($filtros['q'])) {
            $query->where(function ($q) use ($filtros) {
                $q->where('nome', 'like', '%'.$filtros['q'].'%')
                    ->orWhere('email', 'like', '%'.$filtros['q'].'%')
                    ->orWhere('cpf', 'like', '%'.$filtros['q'].'%');
            });
        }

        return $query->get();
    }

    public function show(int $id): ?Usuario
    {
        return $this->usuario->find($id);
    }

    public function destroy(int $id): bool
    {
        return (bool) $this->usuario->where('id', $id)->delete();
    }
}
