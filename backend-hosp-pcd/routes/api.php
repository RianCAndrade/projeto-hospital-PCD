<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AgendamentoController;
use App\Http\Controllers\AtendimentoController;
use App\Http\Controllers\BootstrapController;
use App\Http\Controllers\EspecialidadeController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\MedicoController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\RecepcionistaController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ResponsavelController;
use App\Http\Controllers\RhController;
use App\Http\Controllers\SenhaController;
use App\Http\Controllers\TipoDeficienciaController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);

    // ─── Perfil do usuário logado ───
    Route::prefix('perfil')->group(function () {
        Route::get('/', [PerfilController::class, 'index']);
        Route::put('/{id}', [PerfilController::class, 'update']);
        Route::delete('/{id}', [PerfilController::class, 'destroy']);
    });

    // ─── Me (usuário atual) ───
    Route::get('/me', [MeController::class, 'show']);

    // ─── Bootstrap ───
    Route::get('/bootstrap', [BootstrapController::class, 'index']);

    // ─── Admin ───
    Route::prefix('admin')->group(function () {
        Route::get('/', [AdminController::class, 'index']);
        Route::get('/{id}', [AdminController::class, 'show']);
        Route::delete('/{id}', [AdminController::class, 'destroy']);
    });

    // ─── RH (Hospital) ───
    Route::prefix('rh')->group(function () {
        // Médicos (gestão RH)
        Route::get('/medicos', [RhController::class, 'indexMedico']);
        Route::post('/medicos', [RhController::class, 'storeMedico']);
        Route::get('/medicos/{id}', [RhController::class, 'showMedico']);
        Route::put('/medicos/{id}', [RhController::class, 'updateMedico']);
        Route::delete('/medicos/{id}', [RhController::class, 'destroyMedico']);
        // Recepcionistas (gestão RH)
        Route::get('/recepcionistas', [RhController::class, 'indexRecepcionista']);
        Route::post('/recepcionistas', [RhController::class, 'storeRecepcionista']);
        Route::get('/recepcionistas/{id}', [RhController::class, 'showRecepcionista']);
        Route::put('/recepcionistas/{id}', [RhController::class, 'updateRecepcionista']);
        Route::delete('/recepcionistas/{id}', [RhController::class, 'destroyRecepcionista']);
    });

    // ─── Médicos (auto-cadastro) ───
    Route::get('/medicos', [MedicoController::class, 'index']);
    Route::post('/medicos', [MedicoController::class, 'store']);
    Route::get('/medicos/{id}', [MedicoController::class, 'show']);
    Route::put('/medicos/{id}', [MedicoController::class, 'update']);
    Route::delete('/medicos/{id}', [MedicoController::class, 'destroy']);

    // ─── Pacientes ───
    Route::prefix('pacientes')->group(function () {
        Route::get('/', [PacienteController::class, 'index']);
        Route::post('/', [PacienteController::class, 'store']);
        Route::get('/meus', [PacienteController::class, 'meusPacientes']);
        Route::get('/{id}', [PacienteController::class, 'show']);
        Route::put('/{id}', [PacienteController::class, 'update']);
        Route::delete('/{id}', [PacienteController::class, 'destroy']);
    });

    // ─── Responsáveis ───
    Route::prefix('responsaveis')->group(function () {
        Route::get('/', [ResponsavelController::class, 'index']);
        Route::post('/', [ResponsavelController::class, 'store']);
        Route::get('/{id}', [ResponsavelController::class, 'show']);
        Route::delete('/{id}', [ResponsavelController::class, 'destroy']);
    });

    // ─── Recepcionista (legado - manter compatibilidade) ───
    Route::prefix('recepcionista')->group(function () {
        Route::get('/paciente', [RecepcionistaController::class, 'index']);
        Route::get('/paciente/{id}', [RecepcionistaController::class, 'show']);
        Route::post('/paciente', [RecepcionistaController::class, 'store']);
        Route::put('/paciente/{id}', [RecepcionistaController::class, 'update']);
        Route::delete('/paciente/{id}', [RecepcionistaController::class, 'destroy']);
    });

    // ─── Atendimentos ───
    Route::prefix('atendimentos')->group(function () {
        Route::get('/', [AtendimentoController::class, 'index']);
        Route::post('/', [AtendimentoController::class, 'store']);
        Route::get('/{id}', [AtendimentoController::class, 'show']);
        Route::put('/{id}', [AtendimentoController::class, 'update']);
        Route::delete('/{id}', [AtendimentoController::class, 'destroy']);
    });

    // ─── Agendamentos ───
    Route::prefix('agendamentos')->group(function () {
        Route::get('/', [AgendamentoController::class, 'index']);
        Route::post('/', [AgendamentoController::class, 'store']);
        Route::get('/{id}', [AgendamentoController::class, 'show']);
        Route::put('/{id}', [AgendamentoController::class, 'update']);
        Route::delete('/{id}', [AgendamentoController::class, 'destroy']);
        Route::patch('/{id}/status', [AgendamentoController::class, 'updateStatus']);
        Route::patch('/{id}/cancelar', [AgendamentoController::class, 'cancel']);
        Route::patch('/{id}/remarcar', [AgendamentoController::class, 'reschedule']);
    });

    // ─── Especialidades ───
    Route::prefix('especialidades')->group(function () {
        Route::get('/', [EspecialidadeController::class, 'index']);
        Route::post('/', [EspecialidadeController::class, 'store']);
        Route::get('/{id}', [EspecialidadeController::class, 'show']);
        Route::delete('/{id}', [EspecialidadeController::class, 'destroy']);
    });

    // ─── Tipos de Deficiência ───
    Route::prefix('tipos-deficiencia')->group(function () {
        Route::get('/', [TipoDeficienciaController::class, 'index']);
        Route::post('/', [TipoDeficienciaController::class, 'store']);
        Route::get('/{id}', [TipoDeficienciaController::class, 'show']);
        Route::delete('/{id}', [TipoDeficienciaController::class, 'destroy']);
    });

    // ─── Senhas ───
    Route::prefix('senhas')->group(function () {
        Route::get('/', [SenhaController::class, 'index']);
        Route::post('/', [SenhaController::class, 'store']);
        Route::get('/{id}', [SenhaController::class, 'show']);
        Route::patch('/{id}/status', [SenhaController::class, 'updateStatus']);
        Route::patch('/{id}/chamar', [SenhaController::class, 'chamar']);
    });

    // ─── Usuários ───
    Route::prefix('usuarios')->group(function () {
        Route::get('/', [UsuarioController::class, 'index']);
        Route::get('/{id}', [UsuarioController::class, 'show']);
        Route::delete('/{id}', [UsuarioController::class, 'destroy']);
    });
});
