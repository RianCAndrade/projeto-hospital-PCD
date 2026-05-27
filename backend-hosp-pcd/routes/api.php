<?php

// use Illuminate\Http\Request;

use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\RhController;
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
        Route::get('');
        Route::post('');
    });

    // Rota de RH (Hospital)
    Route::prefix('rh')->group(function (){
        Route::get('/medico', [RhController::class, 'index']);
        Route::get('/medico/{id}', [RhController::class, 'show']);
        Route::post('/medico/store', [RhController::class, 'store']);
        Route::put('medico/update/{id}', [RhController::class, 'update']);
        Route::delete('/medico/delete/{id} ', [RhController::class, 'destroy']);
    });

    // Proprio medico pode se cadastrar
    Route::get('/medico/cadastro', [RhController::class, 'cadastro']);
    Route::post('/medico/cadastro', [RhController::class, 'cadastro']);
    Route::update('/medico/cadastro', [RhController::class, 'cadastro']);
    Route::delete('/medico/cadastro', [RhController::class, 'cadastro']);

    // Rota responsaveis
    Route::post('/responsaveis', );
    Route::delete('/responsaveis', );

    // Rotas Recepcionista
    Route::prefix('recepcionista')->group(function (){
        Route::get('');
        Route::post('');
    });

    // Rota de atendimento
    Route::prefix('atendimento')->group(function (){
        Route::get('');
        Route::post('');
    });

    // Rotas agendamento
    


});
