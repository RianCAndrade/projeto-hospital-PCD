<?php

namespace App\Http\Repository;

use App\Models\Usuario;

class LogoutRepository
{
    public function __construct(){}

    public function logout(Usuario $user)
    {
        return $user->currentAccessToken()->delete();
    }
}