<?php

namespace Tests\Feature;

use App\Models\Medico;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MedicoSeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_migrations_seedao_medicos_e_vinculos(): void
    {
        // 9 médicos seedados (1 herdado do seed de tbusuarios + 8 novos)
        $this->assertSame(9, Medico::count());

        $usuarios = Usuario::where('tipo_usuario', 'medico')
            ->orderBy('id')
            ->get();
        $this->assertCount(9, $usuarios);
        // Primeiro usuário médico vem da migration de tbusuarios (Alex, id=4)
        $this->assertSame('Alex', $usuarios[0]->nome);
        // Os 8 criados na migration de tbmedicos
        $this->assertSame('Pedro Henrique', $usuarios[1]->nome);
        $this->assertSame('Juliana Costa', $usuarios[2]->nome);
        $this->assertSame('Rafael Almeida', $usuarios[3]->nome);
        $this->assertSame('Beatriz Lima', $usuarios[4]->nome);
        $this->assertSame('Gustavo Ferreira', $usuarios[5]->nome);
        $this->assertSame('Camila Rocha', $usuarios[6]->nome);
        $this->assertSame('Lucas Martins', $usuarios[7]->nome);
        $this->assertSame('Fernanda Souza', $usuarios[8]->nome);

        // Cada médico tem 1 especialidade vinculada
        foreach (Medico::all() as $medico) {
            $this->assertCount(
                1,
                $medico->especialidades,
                "Médico {$medico->id} deveria ter 1 especialidade.",
            );
        }

        // Verifica a relação 1:1 médico -> especialidade (ordem dos inserts)
        $esperados = [
            1 => 'Fisiatria / Medicina Física e Reabilitação',
            2 => 'Neuropediatria',
            3 => 'Ortopedia Pediátrica / Funcional',
            4 => 'Psiquiatria Infantil / Neuropsiquiatria',
            5 => 'Fonoaudiologia',
            6 => 'Terapia Ocupacional',
            7 => 'Pediatria do Desenvolvimento',
            8 => 'Genética Médica',
            9 => 'Oftalmologia',
        ];

        foreach ($esperados as $medicoId => $especialidadeNome) {
            $medico = Medico::find($medicoId);
            $this->assertNotNull($medico, "Médico {$medicoId} não encontrado");
            $this->assertSame(
                $especialidadeNome,
                $medico->especialidades[0]->nome,
                "Médico {$medicoId} deveria ter especialidade {$especialidadeNome}",
            );
        }
    }
}
