/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `EmailVerification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `EmailVerification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `age` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailVerification" ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Jobseeker',
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_email_key" ON "EmailVerification"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_username_key" ON "EmailVerification"("username");
