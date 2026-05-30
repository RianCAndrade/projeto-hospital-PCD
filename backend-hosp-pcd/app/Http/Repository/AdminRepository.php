<?php

namespace App\Http\Repository;

use App\Models\Usuario;

class AdminRepository
{
    public function __construct(private Usuario $usuario) {}

    public function index(): mixed
    {
        return $this->usuario->orderBy('nome')->get();
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
