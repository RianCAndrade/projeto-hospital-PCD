<?php

namespace App\Http\Repository;

use App\Models\Agendamento;
use App\Models\Especialidade;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\ResponsavelPaciente;
use App\Models\TipoDeficiencia;
use App\Models\Usuario;

class BootstrapRepository
{
    public function __construct(
        private Usuario $usuario,
        private Paciente $paciente,
        private Medico $medico,
        private Agendamento $agendamento,
        private Especialidade $especialidade,
        private TipoDeficiencia $tipoDeficiencia,
        private ResponsavelPaciente $responsavelPaciente,
    ) {}

    public function load(int $usuarioId): array
    {
        return [
            'usuario' => $this->usuario->with('paciente')->find($usuarioId),
            'usuarios' => $this->usuario->orderBy('nome')->get(),
            'pacientes' => $this->paciente->with('usuario')->orderBy('nome')->get(),
            'responsaveis' => $this->responsavelPaciente->get(),
            'medicos' => $this->medico->get(),
            'agendamentos' => $this->agendamento
                ->with(['paciente', 'medico', 'especialidade', 'recepcionista'])
                ->orderBy('data_agendamento')
                ->get(),
            'especialidades' => $this->especialidade->orderBy('nome')->get(),
            'tipos_deficiencia' => $this->tipoDeficiencia->orderBy('nome')->get(),
        ];
    }
}
