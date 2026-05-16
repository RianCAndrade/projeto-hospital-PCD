<?php 

namespace App\Http\Service;

use App\Http\Repository\LoginRepository;
use Illuminate\Support\Facades\Hash;

class LoginService
{
    private LoginRepository $loginRepository;
    public function __construct(
        LoginRepository $loginRepository
    ){
        $this->loginRepository = $loginRepository;
    }

    public function login(array $dados)
    {
        $user = $this->loginRepository->findByemail($dados['email']);

        if ($user == false){
            return false;
        }

        if (!Hash::check($dados['senha'], $user->senha)){
            return false;
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return $token;
    }
}