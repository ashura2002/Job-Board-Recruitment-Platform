/*
  Warnings:

  - You are about to drop the column `jobId` on the `Skill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_jobId_fkey";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "jobId";
