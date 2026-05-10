<?php

namespace App\Http\Controllers;

use App\Http\Service\RegisterService;
use Illuminate\Http\Request;

class RegisterController
{
    public function __construct(
        private RegisterService $registerService
    ){}

    public function register(Request $request)
    {
        
    }
}