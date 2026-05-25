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

    // Rotas usuario
    Route::prefix('me')->group(function (){
        Route::get('/', [PerfilController::class, 'index']);
        Route::put('/update', [PerfilController::class, 'update']);
        Route::delete('/delete', [PerfilController::class, 'destroy']);
    });
    
});
