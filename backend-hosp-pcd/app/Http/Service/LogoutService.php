<?php

namespace App\Http\Service;

use App\Http\Repository\LogoutRepository;
use Illuminate\Http\Request;

class LogoutService
{
    public function __construct(
        private LogoutRepository $logoutRepository
    ){}

    public function logout(Request $request)
    {
        $user = $request->user();

        if(!$user){
            return false;
        }

        $result = $this->logoutRepository->logout($user);

        return $result;
    }
}