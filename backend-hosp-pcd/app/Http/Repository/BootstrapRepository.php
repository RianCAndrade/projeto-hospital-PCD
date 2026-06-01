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
            'usuario' => $this->usuario
                ->with(['paciente', 'medico', 'responsavelDe'])
                ->find($usuarioId),
            'usuarios' => $this->usuario->orderBy('nome')->get(),
            'pacientes' => $this->paciente
                ->with(['usuario', 'responsaveis.usuario', 'deficiencias.tipoDeficiencia'])
                ->orderBy('nome')
                ->get(),
            'responsaveis' => $this->responsavelPaciente->with(['usuario', 'paciente'])->get(),
            'medicos' => $this->medico->with(['usuario', 'especialidades'])->get(),
            'agendamentos' => $this->agendamento
                ->with(['paciente', 'medico.usuario', 'especialidade', 'recepcionista'])
                ->orderBy('data_agendamento')
                ->orderBy('horario')
                ->get(),
            'especialidades' => $this->especialidade->orderBy('nome')->get(),
            'tipos_deficiencia' => $this->tipoDeficiencia->orderBy('nome')->get(),
        ];
    }
}
