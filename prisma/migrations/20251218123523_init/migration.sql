/*
  Warnings:

  - You are about to drop the column `updateAt` on the `Job` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "salaryRange" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "resumeLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
