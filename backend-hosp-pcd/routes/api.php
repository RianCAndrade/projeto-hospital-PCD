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

// ──────────────────────────────────────────────────────────────────────────
// Rotas públicas
// ──────────────────────────────────────────────────────────────────────────
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// ──────────────────────────────────────────────────────────────────────────
// Rotas autenticadas
// ──────────────────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);

    // ─── Perfil do usuário logado ──────────────────────────────────────
    // index/show: o próprio usuário; update/destroy: self OR admin
    Route::prefix('perfil')->group(function () {
        Route::get('/', [PerfilController::class, 'index']);
        Route::put('/{id}', [PerfilController::class, 'update'])
            ->middleware('self.or.role:admin');
        Route::delete('/{id}', [PerfilController::class, 'destroy'])
            ->middleware('self.or.role:admin');
    });

    // ─── Me (usuário atual) ────────────────────────────────────────────
    Route::get('/me', [MeController::class, 'show']);

    // ─── Bootstrap (carga inicial do app) ──────────────────────────────
    Route::get('/bootstrap', [BootstrapController::class, 'index']);

    // ─── Admin: somente admin ──────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/', [AdminController::class, 'index']);
        Route::get('/{id}', [AdminController::class, 'show']);
        Route::delete('/{id}', [AdminController::class, 'destroy']);
    });

    // ─── RH: rh ou admin gerencia médicos e recepcionistas ────────────
    Route::middleware('role:rh,admin')->prefix('rh')->group(function () {
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

    // ─── Médicos: leitura liberada; escrita restrita a rh/admin ────────
    Route::get('/medicos', [MedicoController::class, 'index']);
    Route::get('/medicos/{id}', [MedicoController::class, 'show']);
    Route::middleware('role:rh,admin')->group(function () {
        Route::post('/medicos', [MedicoController::class, 'store']);
        Route::put('/medicos/{id}', [MedicoController::class, 'update']);
        Route::delete('/medicos/{id}', [MedicoController::class, 'destroy']);
    });

    // ─── Pacientes ─────────────────────────────────────────────────────
    // /meus é para qualquer usuário autenticado (filtra pelos seus vínculos)
    // /index e mutações são restritos a staff (recep/rh/admin/medico para leitura)
    Route::prefix('pacientes')->group(function () {
        Route::get('/meus', [PacienteController::class, 'meusPacientes']);

        Route::middleware('role:recepcionista,medico,rh,admin')->group(function () {
            Route::get('/', [PacienteController::class, 'index']);
            Route::get('/{id}', [PacienteController::class, 'show']);
        });

        Route::middleware('role:recepcionista,rh,admin')->group(function () {
            Route::post('/', [PacienteController::class, 'store']);
            Route::put('/{id}', [PacienteController::class, 'update']);
            Route::delete('/{id}', [PacienteController::class, 'destroy']);
        });
    });

    // ─── Responsáveis: staff pode criar/desvincular ────────────────────
    Route::middleware('role:recepcionista,rh,admin')->prefix('responsaveis')->group(function () {
        Route::get('/', [ResponsavelController::class, 'index']);
        Route::post('/', [ResponsavelController::class, 'store']);
        Route::get('/{id}', [ResponsavelController::class, 'show']);
        Route::delete('/{id}', [ResponsavelController::class, 'destroy']);
    });

    // ─── Recepcionista (legado - manter compatibilidade) ───────────────
    Route::middleware('role:recepcionista,rh,admin')->prefix('recepcionista')->group(function () {
        Route::get('/paciente', [RecepcionistaController::class, 'index']);
        Route::get('/paciente/{id}', [RecepcionistaController::class, 'show']);
        Route::post('/paciente', [RecepcionistaController::class, 'store']);
        Route::put('/paciente/{id}', [RecepcionistaController::class, 'update']);
        Route::delete('/paciente/{id}', [RecepcionistaController::class, 'destroy']);
    });

    // ─── Atendimentos ──────────────────────────────────────────────────
    Route::prefix('atendimentos')->group(function () {
        Route::middleware('role:medico,recepcionista,rh,admin')->group(function () {
            Route::get('/', [AtendimentoController::class, 'index']);
            Route::get('/{id}', [AtendimentoController::class, 'show']);
        });
        Route::middleware('role:medico,recepcionista')->group(function () {
            Route::post('/', [AtendimentoController::class, 'store']);
            Route::put('/{id}', [AtendimentoController::class, 'update']);
        });
        Route::middleware('role:rh,admin')->delete('/{id}', [AtendimentoController::class, 'destroy']);
    });

    // ─── Agendamentos ──────────────────────────────────────────────────
    // Service aplica scoping por papel (medico/responsavel veem só o escopo deles)
    Route::prefix('agendamentos')->group(function () {
        Route::get('/', [AgendamentoController::class, 'index']);
        Route::post('/', [AgendamentoController::class, 'store']);
        Route::get('/{id}', [AgendamentoController::class, 'show']);
        Route::put('/{id}', [AgendamentoController::class, 'update']);
        Route::delete('/{id}', [AgendamentoController::class, 'destroy']);
        Route::patch('/{id}/status', [AgendamentoController::class, 'updateStatus']);
        Route::patch('/{id}/cancelar', [AgendamentoController::class, 'cancel']);
        Route::patch('/{id}/remarcar', [AgendamentoController::class, 'reschedule']);
        // Chamada e início: staff (medico/recep/admin); service valida ownership do médico
        Route::middleware('role:medico,recepcionista,admin')->group(function () {
            Route::patch('/{id}/chamar', [AgendamentoController::class, 'chamar']);
            Route::patch('/{id}/iniciar', [AgendamentoController::class, 'iniciarAtendimento']);
        });
    });

    // ─── Especialidades ────────────────────────────────────────────────
    Route::get('/especialidades', [EspecialidadeController::class, 'index']);
    Route::get('/especialidades/{id}', [EspecialidadeController::class, 'show']);
    Route::middleware('role:rh,admin')->group(function () {
        Route::post('/especialidades', [EspecialidadeController::class, 'store']);
        Route::delete('/especialidades/{id}', [EspecialidadeController::class, 'destroy']);
    });

    // ─── Tipos de Deficiência ──────────────────────────────────────────
    Route::get('/tipos-deficiencia', [TipoDeficienciaController::class, 'index']);
    Route::get('/tipos-deficiencia/{id}', [TipoDeficienciaController::class, 'show']);
    Route::middleware('role:rh,admin')->group(function () {
        Route::post('/tipos-deficiencia', [TipoDeficienciaController::class, 'store']);
        Route::delete('/tipos-deficiencia/{id}', [TipoDeficienciaController::class, 'destroy']);
    });

    // ─── Senhas ────────────────────────────────────────────────────────
    Route::prefix('senhas')->group(function () {
        Route::middleware('role:recepcionista,medico,admin')->group(function () {
            Route::get('/', [SenhaController::class, 'index']);
            Route::get('/{id}', [SenhaController::class, 'show']);
        });
        Route::middleware('role:recepcionista')->group(function () {
            Route::post('/', [SenhaController::class, 'store']);
            Route::patch('/{id}/status', [SenhaController::class, 'updateStatus']);
            Route::patch('/{id}/chamar', [SenhaController::class, 'chamar']);
        });
    });

    // ─── Usuários (gestão) ─────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('usuarios')->group(function () {
        Route::get('/', [UsuarioController::class, 'index']);
        Route::get('/{id}', [UsuarioController::class, 'show']);
        Route::delete('/{id}', [UsuarioController::class, 'destroy']);
    });
});
