<div align="center">

# 🏥 Hospital PCD

### Sistema de Gestão Hospitalar para Atendimento de Crianças com Deficiência

*Uma plataforma humanizada, acessível e eficiente para conectar pacientes, médicos e profissionais de saúde.*

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📖 Sobre o Projeto

O **Hospital PCD** é um sistema de gestão hospitalar desenvolvido especialmente para atender **crianças com deficiência (PCD)**, oferecendo uma experiência completa, acessível e humanizada para todos os envolvidos no processo de atendimento médico.

A plataforma centraliza o agendamento de consultas, o gerenciamento de prontuários, a organização da fila de atendimento e o controle administrativo do hospital — tudo em um único ambiente intuitivo, com interfaces dedicadas a cada perfil de usuário.

> 💙 **Nosso compromisso:** tornar o cuidado infantil mais acolhedor, inclusivo e organizado, eliminando barreiras burocráticas e priorizando o bem-estar das crianças e de suas famílias.

---

## ✨ Funcionalidades

- 👨‍⚕️ **Painel do Médico** — Visualização da agenda diária, registro de atendimentos e acesso ao histórico do paciente.
- 👶 **Painel do Paciente / Responsável** — Agendamento de consultas, acompanhamento da senha e histórico clínico.
- 🛎️ **Painel do Recepcionista** — Gerenciamento de filas, chamada de senhas e organização dos atendimentos.
- 🛠️ **Painel Administrativo** — Cadastro e gerenciamento de médicos, especialidades, funcionários e relatórios.
- 🔐 **Autenticação Segura** — Sistema de login com Laravel Sanctum (tokens) e múltiplos perfis de acesso.
- 📋 **Cadastro Inteligente** — Registro de pacientes, médicos, recepcionistas e funcionários com validação completa.
- 🩺 **Especialidades Médicas** — Vínculo flexível entre médicos e múltiplas especialidades.
- 📅 **Agendamentos & Atendimentos** — Controle completo do fluxo: do agendamento à conclusão do atendimento.
- 🎫 **Sistema de Senhas** — Distribuição e chamada organizada de pacientes na recepção.
- 📊 **Status de Atendimento** — Rastreamento em tempo real (`Não Atendido`, `Em Atendimento`, `Atendido`, `Não Compareceu`, `Cancelado`).

---

## 🧱 Arquitetura do Projeto

O projeto segue uma arquitetura **desacoplada (frontend + backend)**, com comunicação via API REST.

```diagram
╭──────────────────────╮      HTTP / JSON       ╭──────────────────────╮
│                      │ ◀───────────────────▶ │                      │
│  Frontend (Next.js)  │      Sanctum Auth      │   Backend (Laravel)  │
│      React 19        │                        │       PHP 8.4        │
│   TailwindCSS + UI   │                        │   Controllers /      │
│                      │                        │   Services /         │
╰──────────┬───────────╯                        │   Repositories       │
           │                                    ╰──────────┬───────────╯
           │                                               │
           ▼                                               ▼
╭──────────────────────╮                        ╭──────────────────────╮
│       Usuário        │                        │    PostgreSQL 16     │
│  (Médico/Paciente/   │                        │    (Docker / SQLite  │
│   Recep./Admin)      │                        │     em desenvolv.)   │
╰──────────────────────╯                        ╰──────────────────────╯
```

### 📂 Estrutura de Pastas

```
projeto-hospital-pcd/
├── backend-hosp-pcd/          # API REST em Laravel 13
│   ├── app/
│   │   ├── Enums/             # Enumerações (StatusAtendimento, etc.)
│   │   ├── Http/
│   │   │   ├── Controllers/   # LoginController, RegisterController
│   │   │   ├── Service/       # Camada de regras de negócio
│   │   │   └── Repository/    # Camada de acesso a dados
│   │   ├── Models/            # Modelos Eloquent
│   │   └── Providers/
│   ├── database/
│   │   └── migrations/        # Estrutura do banco (12 tabelas)
│   ├── routes/api.php         # Endpoints da API
│   ├── docker-compose.yaml    # Orquestração de containers
│   └── Dockerfile
│
└── frontend-hosp-pcd/         # Interface em Next.js 16
    ├── app/
    │   ├── login/             # Tela de login
    │   ├── cadastro/          # Tela de cadastro
    │   ├── admin/             # Painel administrativo
    │   ├── medico/            # Painel do médico
    │   ├── paciente/          # Painel do paciente
    │   └── recepcionista/     # Painel da recepção
    ├── components/
    │   ├── ui/                # Componentes Radix UI (shadcn)
    │   ├── appointment-card.tsx
    │   ├── dashboard-header.tsx
    │   └── status-badge.tsx
    ├── hooks/
    └── lib/
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **PHP**            | 8.4    | Linguagem principal do backend |
| **Laravel**        | 13.7   | Framework PHP para construção da API |
| **Laravel Sanctum**| 4.0    | Autenticação por tokens |
| **PostgreSQL**     | 16     | Banco de dados relacional |
| **SQLite**         | —      | Banco para ambiente de desenvolvimento |
| **Docker**         | —      | Containerização e ambiente isolado |
| **Nginx**          | Alpine | Servidor web (em produção) |

### Frontend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Next.js**        | 16.2   | Framework React com SSR/SSG |
| **React**          | 19     | Biblioteca de UI |
| **TypeScript**     | 5.7    | Tipagem estática |
| **TailwindCSS**    | 4.2    | Estilização utilitária |
| **Radix UI**       | —      | Componentes acessíveis (shadcn/ui) |
| **React Hook Form**| 7.54   | Gerenciamento de formulários |
| **Zod**            | 3.24   | Validação de schemas |
| **Lucide React**   | —      | Ícones modernos |
| **Recharts**       | 2.15   | Gráficos e dashboards |

---

## 🗄️ Modelagem do Banco de Dados

O sistema possui **12 tabelas** principais que organizam toda a lógica do hospital:

| Tabela | Descrição |
|--------|-----------|
| `tbusuarios`              | Dados de autenticação e perfil dos usuários |
| `tbmedicos`               | Informações específicas dos médicos |
| `tbespecialidades`        | Catálogo de especialidades médicas |
| `tbmedico_especialidades` | Relação N:N entre médicos e especialidades |
| `tbrecepcionista`         | Dados dos recepcionistas |
| `tbfuncionarios`          | Funcionários administrativos |
| `tbsenhas`                | Sistema de senhas para a fila de atendimento |
| `tbagendamentos`          | Consultas agendadas |
| `tbatendimentos`          | Registro de atendimentos realizados |
| `personal_access_tokens`  | Tokens de autenticação (Sanctum) |
| `cache` / `jobs`          | Tabelas internas do Laravel |

---

## 🚀 Como Executar o Projeto

### ✅ Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) **18+** e [pnpm](https://pnpm.io/) (ou npm)
- [PHP](https://www.php.net/) **8.4+** e [Composer](https://getcomposer.org/) *(opcional, se rodar sem Docker)*
- [Git](https://git-scm.com/)

---

### 🔧 1. Clone o repositório

```bash
git clone https://github.com/riancandrade/projeto-hospital-pcd.git
cd projeto-hospital-pcd
```

---

### 🐳 2. Backend com Docker (recomendado)

```bash
cd backend-hosp-pcd

# Copia o arquivo de variáveis de ambiente
cp .env.example .env

# Sobe os containers (Laravel + Nginx + PostgreSQL)
docker compose up -d --build

# Acessa o container e finaliza a configuração
docker exec -it hospital-pcd-app bash
php artisan key:generate
php artisan migrate
exit
```

A API estará disponível em **http://localhost:8000**.

#### Banco de Dados (Docker)
- **Host:** `localhost`
- **Porta:** `5436`
- **Database:** `hospital_pcd`
- **Usuário:** `postgres`
- **Senha:** `ogof`

---

### ⚙️ 2.1. Backend sem Docker (alternativa)

```bash
cd backend-hosp-pcd

cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

A API ficará disponível em **http://localhost:8000**.

---

### 💻 3. Frontend (Next.js)

```bash
cd frontend-hosp-pcd

# Instala as dependências
pnpm install        # ou: npm install

# Inicia o servidor de desenvolvimento
pnpm dev            # ou: npm run dev
```

Acesse o frontend em **http://localhost:3000**.

---

## 📡 Endpoints da API

> 🚧 A API está em desenvolvimento. Endpoints atuais:

| Método | Rota             | Descrição                  | Auth |
|--------|------------------|----------------------------|------|
| `POST` | `/api/register`  | Cadastro de novo usuário   | ❌   |
| `POST` | `/api/login`     | Autenticação do usuário    | ❌   |

Rotas protegidas usam o middleware `auth:sanctum`.

---

## 🧭 Perfis de Acesso

| Perfil           | Acesso |
|------------------|--------|
| 👑 **Administrador** | Gerencia médicos, funcionários, especialidades e relatórios |
| 👨‍⚕️ **Médico**       | Visualiza agenda, realiza atendimentos e registra prontuários |
| 🛎️ **Recepcionista** | Gerencia filas, senhas e agendamentos |
| 👶 **Paciente**      | Realiza agendamentos e acompanha histórico de consultas |

---

## ♿ Acessibilidade

Como o sistema atende **crianças com deficiência**, a acessibilidade é prioridade máxima:

- ✅ Componentes baseados em **Radix UI**, com suporte completo a leitores de tela
- ✅ Navegação totalmente acessível via teclado
- ✅ Contraste adequado e tipografia legível
- ✅ Estrutura semântica e ARIA labels
- ✅ Foco visível e indicadores claros de estado

---

<!-- ## 🗺️ Roadmap

- [x] Estruturação do banco de dados
- [x] Setup do backend Laravel + Docker
- [x] Setup do frontend Next.js + Tailwind + Radix UI
- [x] Cadastro de usuários
- [ ] Autenticação completa (login + logout + refresh)
- [ ] CRUD de médicos, especialidades e funcionários
- [ ] Sistema completo de agendamentos
- [ ] Painel de chamada de senhas em tempo real
- [ ] Prontuário eletrônico
- [ ] Dashboard com métricas e relatórios
- [ ] Notificações por e-mail / SMS
- [ ] Testes automatizados (PHPUnit + Vitest)
- [ ] Deploy em produção

--- -->
<!-- 
## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Para colaborar:

1. Faça um **fork** do projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça commit das alterações: `git commit -m 'feat: adiciona minha feature'`
4. Envie para o seu fork: `git push origin feature/minha-feature`
5. Abra um **Pull Request** 🚀

--- -->

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** — veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com 💙 por **[Rian C. Andrade](https://github.com/riancandrade)**

> *"Tecnologia a serviço do cuidado — porque toda criança merece um atendimento digno, acolhedor e acessível."*

---

<div align="center">

⭐ Se este projeto te ajudou ou inspirou, considere deixar uma estrela no repositório!

</div>
