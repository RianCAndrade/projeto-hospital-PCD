<?php

// use Illuminate\Http\Request;

use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (){
    Route::post('/logout', [LogoutController::class, 'logout']);
});
