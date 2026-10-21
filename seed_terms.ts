import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.termsOfService.create({
    data: {
      version: '1.0',
      type: 'B2B_BUSINESS_MSA',
      content: '<h1>Contrato de Parceria</h1><p>Bem-vindo à nossa plataforma. Este é o seu contrato gerado automaticamente.</p><p>Razão Social: {{corporate_reason}}</p>',
      is_active: true
    }
  });
  console.log('Dummy B2B terms created!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
