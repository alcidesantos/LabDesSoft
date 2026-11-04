-- CreateTable
CREATE TABLE "Utilizador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Utilizador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projecto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ativo',

    CONSTRAINT "Projecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'aberta',
    "prioridade" TEXT NOT NULL DEFAULT 'media',
    "id_projecto" INTEGER NOT NULL,
    "id_utilizador" INTEGER,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_email_key" ON "Utilizador"("email");

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_id_projecto_fkey" FOREIGN KEY ("id_projecto") REFERENCES "Projecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_id_utilizador_fkey" FOREIGN KEY ("id_utilizador") REFERENCES "Utilizador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
