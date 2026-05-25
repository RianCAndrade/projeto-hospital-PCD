<?php

// use Illuminate\Http\Request;

use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (){
    Route::post('/logout', [LogoutController::class, 'logout']);

    // Rotas usuario paciente
    Route::prefix('me')->group(function (){
        Route::get('/', [PerfilController::class, 'index']);
        Route::put('/update/{id}', [PerfilController::class, 'update']);
        Route::delete('/delete/{id}', [PerfilController::class, 'destroy']);
    });

    // Rota de admin
    Route::prefix('admin')->group(function (){

    });

    // Rota de RH (Hospital)
    Route::prefix('rh')->group(function (){

    });

    // Rotas Recepcionista
    Route::prefix('recepcionista')->group(function (){

    });

    // Rota de atendimento
    Route::prefix('atendimento')->group(function (){

    });

    // Rotas agendamento
    


});
