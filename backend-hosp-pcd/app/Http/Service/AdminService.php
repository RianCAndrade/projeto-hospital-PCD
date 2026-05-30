<?php

namespace App\Http\Service;

use App\Http\Repository\AdminRepository;
use App\Models\Usuario;

class AdminService
{
    public function __construct(private AdminRepository $adminRepository) {}

    public function index(): mixed
    {
        return $this->adminRepository->index();
    }

    public function show(int $id): ?Usuario
    {
        return $this->adminRepository->show($id);
    }

    public function destroy(int $id): bool
    {
        return $this->adminRepository->destroy($id);
    }
}
