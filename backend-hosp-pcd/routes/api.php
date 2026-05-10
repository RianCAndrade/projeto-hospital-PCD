<?php

// use Illuminate\Http\Request;

use App\Http\Controllers\RegisterController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [RegisterController::class, 'register']);
// Route::post('/login', [loginController::class, 'register']);

Route::middleware('auth:sanctum')->group(function (){
    
});
