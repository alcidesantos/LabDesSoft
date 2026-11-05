/*
  Warnings:

  - The `estado` column on the `Tarefa` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `prioridade` column on the `Tarefa` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoTarefa" AS ENUM ('aberta', 'em_progresso', 'concluida', 'cancelada');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('baixa', 'media', 'alta', 'critica');

-- AlterTable
ALTER TABLE "Tarefa" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoTarefa" NOT NULL DEFAULT 'aberta',
DROP COLUMN "prioridade",
ADD COLUMN     "prioridade" "PrioridadeTarefa" NOT NULL DEFAULT 'media';
