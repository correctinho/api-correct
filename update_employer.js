const fs = require('fs');

// 1. Backend repository
const repoPath = 'src/modules/business/infra/databases/prisma/repositories/list-employer.prisma.repository.ts';
let repo = fs.readFileSync(repoPath, 'utf8');
repo = repo.replace(/fantasy_name: \{\s*contains: search,\s*mode: 'insensitive',\s*\}/, antasy_name: { contains: search, mode: 'insensitive' } }, { company_name: { contains: search, mode: 'insensitive' });
repo = repo.replace(/fantasy_name: true,/, 'company_name: true,\n          fantasy_name: true,');
fs.writeFileSync(repoPath, repo);

// 2. Backend DTO
const dtoPath = 'src/modules/business/application/usecases/dto/list-employer.dto.ts';
let dto = fs.readFileSync(dtoPath, 'utf8');
dto = dto.replace(/fantasy_name: string;/, 'company_name: string;\n  fantasy_name: string;');
fs.writeFileSync(dtoPath, dto);

// 3. Backend Usecase
const usecasePath = 'src/modules/business/application/usecases/list-employer.usecase.ts';
let usecase = fs.readFileSync(usecasePath, 'utf8');
usecase = usecase.replace(/fantasy_name: item\.fantasy_name,/, 'company_name: item.company_name,\n      fantasy_name: item.company_name, // fallback for old frontends');
fs.writeFileSync(usecasePath, usecase);

// 4. Frontend Page
const frontPath = '../frontend-correct/correct-admin-platform/src/pages/EmployersListPage.tsx';
if (fs.existsSync(frontPath)) {
  let front = fs.readFileSync(frontPath, 'utf8');
  front = front.replace(/fantasy_name: string;/g, 'company_name: string;\n  fantasy_name: string;');
  front = front.replace(/Nome Fantasia/g, 'Razão Social');
  front = front.replace(/employer\.fantasy_name/g, 'employer.company_name || employer.fantasy_name');
  fs.writeFileSync(frontPath, front);
}

console.log('Done!');
