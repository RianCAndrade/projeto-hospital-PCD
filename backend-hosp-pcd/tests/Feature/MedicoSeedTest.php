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
        // 3 médicos seedados (1 herdado do seed de tbusuarios + 2 novos)
        $this->assertSame(3, Medico::count());

        $usuarios = Usuario::where('tipo_usuario', 'medico')
            ->orderBy('id')
            ->get();
        $this->assertCount(3, $usuarios);
        $this->assertSame('Medico', $usuarios[0]->nome);
        $this->assertSame('Ana Souza', $usuarios[1]->nome);
        $this->assertSame('Carlos Lima', $usuarios[2]->nome);

        // Cada médico tem 1 especialidade vinculada
        foreach (Medico::all() as $medico) {
            $this->assertCount(
                1,
                $medico->especialidades,
                "Médico {$medico->id} deveria ter 1 especialidade.",
            );
        }

        // Verifica a relação específica: medico 1 -> Cardiologia, 2 -> Ortopedia, 3 -> Neurologia
        $medico1 = Medico::find(1);
        $this->assertSame('Cardiologia', $medico1->especialidades[0]->nome);

        $medico2 = Medico::find(2);
        $this->assertSame('Ortopedia', $medico2->especialidades[0]->nome);

        $medico3 = Medico::find(3);
        $this->assertSame('Neurologia', $medico3->especialidades[0]->nome);
    }
}
