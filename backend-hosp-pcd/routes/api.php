<?php

// use Illuminate\Http\Request;

use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\MedicoController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\RecepcionistaController;
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
    Route::prefix('rh')->group(function () {
        // Médicos
        Route::get('/medico', [RhController::class, 'indexMedico']);
        Route::post('/medico', [RhController::class, 'storeMedico']);
        Route::get('/medico/{id}', [RhController::class, 'showMedico']);
        Route::put('/medico/{id}', [RhController::class, 'updateMedico']);
        Route::delete('/medico/{id}', [RhController::class, 'destroyMedico']);
        // Recepcionistas
        Route::get('/recepcionista', [RhController::class, 'indexRecepcionista']);
        Route::post('/recepcionista', [RhController::class, 'storeRecepcionista']);
        Route::get('/recepcionista/{id}', [RhController::class, 'showRecepcionista']);
        Route::put('/recepcionista/{id}', [RhController::class, 'updateRecepcionista']);
        Route::delete('/recepcionista/{id}', [RhController::class, 'destroyRecepcionista']);
    });

    // Proprio medico pode se cadastrar
    Route::get('/medico', [MedicoController::class, 'index']);
    Route::post('/medico/store', [MedicoController::class, 'store']);
    Route::update('/medico/update', [MedicoController::class, 'update']);
    Route::delete('/medico/delete', [MedicoController::class, 'destroy']);

    // Rota responsaveis
    Route::post('/responsaveis', );
    Route::delete('/responsaveis', );

    // Rotas Recepcionista
    Route::prefix('recepcionista')->group(function (){
        Route::get('', [RecepcionistaController::class, '']);
        Route::get('', [RecepcionistaController::class, '']);
        Route::get('', [RecepcionistaController::class, '']);
    });

    // Rota de atendimento
    Route::prefix('atendimento')->group(function (){
        Route::get('');
        Route::post('');
    });

    // Rotas agendamento
    


});
