const { PrismaClient, EstadoTarefa, PrioridadeTarefa } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('A limpar a base de dados...');
  await prisma.tarefa.deleteMany();
  await prisma.projecto.deleteMany();
  await prisma.utilizador.deleteMany();

  console.log('A inserir utilizadores...');
  const u1 = await prisma.utilizador.create({ 
    data: { nome: "Ana Silva", email: "ana@minhaempresa.pt" } 
  });
  const u2 = await prisma.utilizador.create({ 
    data: { nome: "Bruno Costa", email: "bruno@minhaempresa.pt" } 
  });

  console.log('A inserir projectos...');
  const p1 = await prisma.projecto.create({ 
    data: { nome: "Website Empresa1", descricao: "Site Empresa1", estado: "ativo" } 
  });
  const p2 = await prisma.projecto.create({ 
    data: { nome: "Website Empresa2", descricao: "Site Empresa2", estado: "ativo" } 
  });

  console.log('A inserir tarefas...');
  await prisma.tarefa.createMany({
    data: [
      { 
        titulo: "ER site", 
        estado: EstadoTarefa.concluida, 
        prioridade: PrioridadeTarefa.alta, 
        id_projecto: p1.id, 
        id_utilizador: u1.id 
      },
      { 
        titulo: "Autenticação utilizadores", 
        estado: EstadoTarefa.em_progresso, 
        prioridade: PrioridadeTarefa.critica, 
        id_projecto: p1.id, 
        id_utilizador: u2.id 
      }
    ]
  });

  console.log('Base de dados populada com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });